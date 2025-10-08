<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            ->select('id','tagihan_id','nominal',$dateCol,'keterangan','metode')
            ->orderByDesc($dateCol);

        // Filter tanggal (inklusif)
        if ($from !== '' && $to !== '') {
            $q->whereBetween($dateCol, [$from.' 00:00:00', $to.' 23:59:59']);
        } elseif ($from !== '') {
            $q->where($dateCol, '>=', $from.' 00:00:00');
        } elseif ($to !== '') {
            $q->where($dateCol, '<=', $to.' 23:59:59');
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
                'keterangan'=> $p->keterangan,
                'metode'    => $p->metode,
                'siswa'     => [
                    'id'   => optional($p->tagihan?->siswa)->id,
                    'nama' => optional($p->tagihan?->siswa)->nama_siswa,
                ],
                'kelas'     => [
                    'nama' => optional($p->tagihan?->siswa?->kelas)->nama_kelas,
                    'lokal'=> optional($p->tagihan?->siswa?->kelas)->lokal,
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
        $validated = $request->validate([
            'tagihan_id' => 'required|exists:tagihans,id',
            'nominal'    => 'required|numeric|min:1',
            'keterangan' => 'nullable|string',
            'metode'     => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $tagihan = \App\Models\Tagihan::findOrFail($validated['tagihan_id']);

            Pembayaran::create([
                'tagihan_id'    => $tagihan->id,
                'nominal'       => $validated['nominal'],
                'tanggal_bayar' => now(),
                'keterangan'    => $validated['keterangan'] ?? '-',
                'metode'        => $validated['metode'] ?? 'Tunai',
            ]);

            $tagihan->sisa_tagihan -= $validated['nominal'];
            if ($tagihan->sisa_tagihan <= 0) {
                $tagihan->sisa_tagihan = 0;
                $tagihan->status = 'lunas';
            }
            $tagihan->save();
        });

        return back()->with('success', 'Pembayaran berhasil ditambahkan.');
    }
}
