<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sekolah;
use App\Models\Tagihan;
use App\Models\KasMasuk;
use App\Models\Kategori;
use App\Models\Pembayaran;
use Illuminate\Http\Request;

class KeuanganControler extends Controller
{

    public function index()
    {
        // --- Total uang masuk dari pembayaran ---
        $totalUangMasuk = Pembayaran::sum('nominal');

        // --- Total tagihan yang sudah dibuat ---
        $totalTagihan   = Tagihan::sum('total_tagihan');

        // --- Total sisa tagihan (belum dibayar) ---
        $totalSisa      = Tagihan::sum('sisa_tagihan');

        // --- Riwayat pembayaran terakhir 20 data ---
        $riwayat = Pembayaran::with([
                'tagihan:id,kategori_id,siswa_id',
                'tagihan.kategori:id,nama_kategori',
                'tagihan.siswa:id,nama_siswa',
            ])
            ->orderByDesc('tanggal_bayar')
            ->take(20)
            ->get()
            ->map(fn ($p) => [
                'id'        => $p->id,
                'tanggal'   => $p->tanggal_bayar?->format('Y-m-d'),
                'nominal'   => (int) $p->nominal,
                'siswa'     => $p->tagihan?->siswa?->nama_siswa,
                'kategori'  => $p->tagihan?->kategori?->nama_kategori,
                'keterangan'=> $p->keterangan,
                'metode'    => $p->metode,
            ]);

        return Inertia::render('Keuangan/Index', [
            'stats' => [
                'total_tagihan'   => $totalTagihan,
                'total_uangmasuk' => $totalUangMasuk,
                'total_sisa'      => $totalSisa,
            ],
            'riwayat' => $riwayat,
        ]);
    }


}
