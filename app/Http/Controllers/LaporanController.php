<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sekolah;
use App\Models\Kategori;
use App\Models\Pembayaran;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
 public function index(Request $request)
    {
        // Ambil query param polos, jangan pake ->string()
        $from       = trim((string) $request->input('from', ''));
        $to         = trim((string) $request->input('to', ''));
        $sekolah    = (string) $request->input('sekolah', 'all'); // pakai NAMA sekolah
        $kelas      = (string) $request->input('kelas', 'all');   // pakai NAMA kelas
        $lokal      = (string) $request->input('lokal', 'all');
        $kategoriId = (string) $request->input('kategori', 'all'); // id kategori (atau 'all')
        $search     = (string) $request->input('search', '');

        $amountColumn = 'nominal';
        $dateColumn   = 'tanggal_bayar';

        $q = Pembayaran::query()
            ->with([
                'tagihan:id,siswa_id,kategori_id',
                'tagihan.kategori:id,nama_kategori',
                'tagihan.siswa:id,nama_siswa,kelas_id',
                'tagihan.siswa.kelas:id,nama_kelas,sekolah_id,lokal',
                'tagihan.siswa.kelas.sekolah:id,nama_sekolah',
            ])
            ->select(['id','tagihan_id',$amountColumn,$dateColumn,'keterangan','metode']);

        // Filter tanggal
        if ($from !== '' && $to !== '') {
            $q->whereBetween($dateColumn, [$from, $to]);
        } elseif ($from !== '') {
            $q->whereDate($dateColumn, '>=', $from);
        } elseif ($to !== '') {
            $q->whereDate($dateColumn, '<=', $to);
        }

        // Filter sekolah/kelas/lokal
        if ($sekolah !== 'all') {
            $q->whereHas('tagihan.siswa.kelas.sekolah', fn($qq) => $qq->where('nama_sekolah', $sekolah));
        }
        if ($kelas !== 'all') {
            $q->whereHas('tagihan.siswa.kelas', fn($qq) => $qq->where('nama_kelas', $kelas));
        }
        if ($lokal !== 'all') {
            $q->whereHas('tagihan.siswa.kelas', fn($qq) => $qq->where('lokal', $lokal));
        }

        // Filter kategori (by id)
        if ($kategoriId !== 'all' && $kategoriId !== '') {
            $q->whereHas('tagihan.kategori', fn($qq) => $qq->where('id', $kategoriId));
        }

        // Free-text search: nama siswa / kategori / keterangan
        if ($search !== '') {
            $term = mb_strtolower($search);
            $q->where(function($qq) use ($term) {
                $qq->whereHas('tagihan.siswa', fn($w) => $w->whereRaw('LOWER(nama_siswa) like ?', ["%{$term}%"]))
                  ->orWhereHas('tagihan.kategori', fn($w) => $w->whereRaw('LOWER(nama_kategori) like ?', ["%{$term}%"]))
                  ->orWhereRaw('LOWER(keterangan) like ?', ["%{$term}%"]);
            });
        }

        $rows = $q->get()->map(function($p) use ($amountColumn, $dateColumn) {
            $tgl = $p->{$dateColumn};
            if ($tgl instanceof \Carbon\CarbonInterface) $tgl = $tgl->format('Y-m-d');
            elseif ($tgl) $tgl = (string) $tgl;

            return [
                'id'        => $p->id,
                'tanggal'   => $tgl,
                'jumlah'    => (int) ($p->{$amountColumn} ?? 0),
                'keterangan'=> $p->keterangan,
                'metode'    => $p->metode,
                'siswa'     => [
                    'id'   => optional($p->tagihan?->siswa)->id,
                    'nama' => optional($p->tagihan?->siswa)->nama_siswa,
                ],
                'kelas'     => [
                    'id'   => optional($p->tagihan?->siswa?->kelas)->id,
                    'nama' => optional($p->tagihan?->siswa?->kelas)->nama_kelas,
                    'lokal'=> optional($p->tagihan?->siswa?->kelas)->lokal,
                ],
                'sekolah'   => [
                    'id'   => optional($p->tagihan?->siswa?->kelas?->sekolah)->id,
                    'nama' => optional($p->tagihan?->siswa?->kelas?->sekolah)->nama_sekolah,
                ],
                'kategori'  => [
                    'id'   => optional($p->tagihan?->kategori)->id,
                    'nama' => optional($p->tagihan?->kategori)->nama_kategori,
                ],
            ];
        });

        // Ringkasan per kategori
        $byKategori = [];
        foreach ($rows as $r) {
            $key = $r['kategori']['nama'] ?? '(Tanpa Kategori)';
            $byKategori[$key] = ($byKategori[$key] ?? 0) + ($r['jumlah'] ?? 0);
        }
        $summaryKategori = [];
        foreach ($byKategori as $nama => $total) {
            $summaryKategori[] = ['nama' => $nama, 'total' => (int) $total];
        }
        usort($summaryKategori, fn($a,$b) => $b['total'] <=> $a['total']);

        // Dropdown sumber
        $sekolahList = Sekolah::query()
            ->with(['kelas:id,nama_kelas,sekolah_id,lokal,tingkat'])
            ->select('id','nama_sekolah')
            ->get()
            ->map(fn($s) => [
                'id'           => $s->id,
                'nama_sekolah' => $s->nama_sekolah,
                'kelas'        => $s->kelas->map(fn($k) => [
                    'id' => $k->id, 'nama_kelas' => $k->nama_kelas, 'lokal' => $k->lokal, 'tingkat' => $k->tingkat
                ])->values(),
            ]);

        $kategoriList = Kategori::select('id','nama_kategori')->orderBy('nama_kategori')->get();

        return Inertia::render('Laporan/Index', [
            'rows'         => $rows,
            'summary'      => $summaryKategori,
            'sekolahList'  => $sekolahList,
            'kategoriList' => $kategoriList,
            'filters'      => [
                'from'    => $from,
                'to'      => $to,
                'sekolah' => $sekolah,
                'kelas'   => $kelas,
                'lokal'   => $lokal,
                'kategori'=> $kategoriId,
                'search'  => $search,
            ],
            'build_id'     => now()->format('YmdHis'),
        ]);
    }
}
