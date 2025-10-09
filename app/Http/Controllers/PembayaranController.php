<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Tagihan;
use App\Models\KasSaldo;
use App\Models\KasMutasi;
use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PembayaranController extends Controller
{
    public function index(Request $request)
    {
        $from   = trim((string) $request->input('from', ''));
        $to     = trim((string) $request->input('to', ''));
        $search = trim((string) $request->input('search', ''));
        $perPage = (int)($request->input('perPage', 20)) ?: 20;

        $dateCol = 'tanggal_bayar';

        $q = Pembayaran::query()
            ->with([
                'tagihan:id,siswa_id,kategori_id',
                'tagihan.kategori:id,nama_kategori',
                'tagihan.siswa:id,nama_siswa,kelas_id',
                'tagihan.siswa.kelas:id,nama_kelas,sekolah_id,lokal',
                'tagihan.siswa.kelas.sekolah:id,nama_sekolah',
            ])
            ->select('id', 'tagihan_id', 'nominal', $dateCol, 'keterangan', 'metode')
            ->orderByDesc($dateCol);

        // Filter tanggal (inklusif)
        if ($from !== '' && $to !== '') {
            $q->whereBetween($dateCol, [$from . ' 00:00:00', $to . ' 23:59:59']);
        } elseif ($from !== '') {
            $q->where($dateCol, '>=', $from . ' 00:00:00');
        } elseif ($to !== '') {
            $q->where($dateCol, '<=', $to . ' 23:59:59');
        }

        // Filter nama siswa
        if ($search !== '') {
            $term = mb_strtolower($search);
            $q->whereHas('tagihan.siswa', function ($w) use ($term) {
                $w->whereRaw('LOWER(nama_siswa) like ?', ["%{$term}%"]);
            });
        }

        $paginator = $q->paginate($perPage)->appends($request->query());

        // Normalisasi untuk frontend
        $rows = collect($paginator->items())->map(function ($p) use ($dateCol) {
            $tgl = $p->{$dateCol};
            if ($tgl instanceof \Carbon\CarbonInterface) $tgl = $tgl->format('Y-m-d');
            elseif ($tgl) $tgl = (string) $tgl;

            return [
                'id'        => $p->id,
                'tanggal'   => $tgl,
                'jumlah'    => (int) $p->nominal,
                'keterangan' => $p->keterangan,
                'metode'    => $p->metode,
                'siswa'     => [
                    'id'   => optional($p->tagihan?->siswa)->id,
                    'nama' => optional($p->tagihan?->siswa)->nama_siswa,
                ],
                'kelas'     => [
                    'nama' => optional($p->tagihan?->siswa?->kelas)->nama_kelas,
                    'lokal' => optional($p->tagihan?->siswa?->kelas)->lokal,
                ],
                'sekolah'   => [
                    'nama' => optional($p->tagihan?->siswa?->kelas?->sekolah)->nama_sekolah,
                ],
                'kategori'  => [
                    'nama' => optional($p->tagihan?->kategori)->nama_kategori,
                ],
            ];
        });

        return Inertia::render('Pembayaran/Index', [
            'rows' => $rows,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
            'filters' => [
                'from'    => $from,
                'to'      => $to,
                'search'  => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

public function store(Request $request)
{
    // dukung input "1.000.000"
    $rawNominal   = (string) $request->input('nominal', '');
    $cleanNominal = (int) preg_replace('/[^\d]/', '', $rawNominal);

    $validated = $request->validate([
        'tagihan_id' => 'required|exists:tagihans,id',
        'keterangan' => 'nullable|string|max:255',
        'metode'     => 'nullable|string|max:50',
    ]);

    if ($cleanNominal < 1) {
        throw ValidationException::withMessages([
            'nominal' => 'Nominal tidak valid.',
        ]);
    }

    DB::transaction(function () use ($validated, $cleanNominal) {
        // 1) Lock tagihan (biar hitung sisa aman)
        $tagihan = Tagihan::lockForUpdate()
            ->with('kategori:id,nama_kategori') // opsional, kalau mau pakai
            ->findOrFail($validated['tagihan_id']);

        $kategoriId = $tagihan->kategori_id; // saldo per kategori ini

        // 2) Catat pembayaran
        $pembayaran = Pembayaran::create([
            'tagihan_id'    => $tagihan->id,
            'nominal'       => $cleanNominal,
            'tanggal_bayar' => now(),
            'keterangan'    => $validated['keterangan'] ?? '-',
            'metode'        => $validated['metode'] ?? 'Tunai',
        ]);

        // 3) Update tagihan
        $tagihan->sisa_tagihan = max(0, (int) $tagihan->sisa_tagihan - $cleanNominal);
        if ($tagihan->sisa_tagihan === 0) {
            $tagihan->status = 'lunas';
        }
        $tagihan->save();

        // 4) Ambil/buat saldo kategori (LOCK JUGA)
        //    - firstOrCreate pastikan baris ada dengan kategori_id & saldo=0
        $saldoRow = KasSaldo::firstOrCreate(
            ['kategori_id' => $kategoriId],
            ['saldo' => 0]
        );
        // re-lock baris saldo yang sudah pasti ada
        $saldoRow = KasSaldo::whereKey($saldoRow->id)->lockForUpdate()->first();

        $saldoSebelum = (float) $saldoRow->saldo;
        $saldoSetelah = $saldoSebelum + (float) $cleanNominal;

        // 5) Catat mutasi (sesuai MIGRASI TERAKHIR: debit/kredit, ref_type/ref_id)
        KasMutasi::create([
            'tanggal'        => now(),          // DATE; MySQL akan cast bagian tanggalnya
            'tipe'           => 'debit',        // uang masuk
            'kategori_id'    => $kategoriId,
            'ref_type'       => 'pembayaran',
            'ref_id'         => $pembayaran->id,
            'keterangan'     => $validated['keterangan'] ?? 'Pembayaran tagihan',
            'metode'         => $validated['metode'] ?? 'Tunai',
            'debit'          => $cleanNominal,
            'kredit'         => 0,
            'saldo_sebelum'  => $saldoSebelum,
            'saldo_setelah'  => $saldoSetelah,
            'user_id'        => auth()->id(),
        ]);

        // 6) Update saldo cache
        $saldoRow->saldo = $saldoSetelah;
        $saldoRow->save();
    });

    return back()->with('success', 'Pembayaran berhasil ditambahkan. Saldo kategori diperbarui.');
}
}
