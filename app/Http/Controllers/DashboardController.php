<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Models\Siswa;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // === Hari ini ===
        $todayTotalNominal = Pembayaran::whereDate('tanggal_bayar', today())->sum('nominal');
        $todayTransaksi    = Pembayaran::whereDate('tanggal_bayar', today())->count();
        $todaySiswaCount   = Pembayaran::whereDate('tanggal_bayar', today())
                                ->join('tagihans','pembayarans.tagihan_id','=','tagihans.id')
                                ->distinct('tagihans.siswa_id')
                                ->count('tagihans.siswa_id');

        // === Bulan ini ===
        $monthTotalNominal = Pembayaran::whereYear('tanggal_bayar', now()->year)
                                ->whereMonth('tanggal_bayar', now()->month)
                                ->sum('nominal');
        $monthTransaksi    = Pembayaran::whereYear('tanggal_bayar', now()->year)
                                ->whereMonth('tanggal_bayar', now()->month)
                                ->count();

        // === Total agregat ===
        $totalPembayaran = Pembayaran::sum('nominal');
        $tagihanLunas    = Tagihan::where('status', 'lunas')->count();
        $tagihanBelum    = Tagihan::where('status', '!=', 'lunas')->count();
        $totalSiswa      = Siswa::count();

        // === Riwayat 10 terakhir ===
        $riwayat = Pembayaran::with([
                'tagihan:id,siswa_id,kategori_id',
                'tagihan.kategori:id,nama_kategori',
                'tagihan.siswa:id,nama_siswa',
            ])
            ->select('id','tagihan_id','nominal','tanggal_bayar','keterangan','metode')
            ->orderByDesc('tanggal_bayar')
            ->limit(10)
            ->get()
            ->map(function ($p) {
                $tgl = $p->tanggal_bayar;
                $tgl = $tgl instanceof \Carbon\CarbonInterface
                    ? $tgl->format('Y-m-d')
                    : (!empty($tgl) ? Carbon::parse($tgl)->format('Y-m-d') : null);

                return [
                    'id'        => $p->id,
                    'tanggal'   => $tgl,
                    'jumlah'    => (int) $p->nominal,
                    'keterangan'=> $p->keterangan,
                    'metode'    => $p->metode,
                    'siswa'     => optional($p->tagihan?->siswa)->nama_siswa,
                    'kategori'  => optional($p->tagihan?->kategori)->nama_kategori,
                ];
            });

        // === Performa nominal bulanan (12 bulan tahun berjalan, zero-fill) ===
        $rawMonthly = Pembayaran::selectRaw('MONTH(tanggal_bayar) as bulan, COUNT(*) as total, SUM(nominal) as nominal')
            ->whereYear('tanggal_bayar', now()->year)
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->keyBy('bulan');

        $trendMonthly = collect(range(1, 12))->map(function ($m) use ($rawMonthly) {
            $row = $rawMonthly->get($m);
            return [
                'name'    => Carbon::create()->month($m)->locale('id')->translatedFormat('M'),
                'total'   => $row ? (int)$row->total : 0,
                'nominal' => $row ? (int)$row->nominal : 0,
            ];
        });

        // === Nominal per kategori (real) ===
        $kategoriBreakdown = Pembayaran::query()
            ->join('tagihans','pembayarans.tagihan_id','=','tagihans.id')
            ->join('kategoris','tagihans.kategori_id','=','kategoris.id')
            ->selectRaw('kategoris.nama_kategori as name, SUM(pembayarans.nominal) as nominal')
            ->groupBy('kategoris.nama_kategori')
            ->orderByDesc(DB::raw('SUM(pembayarans.nominal)'))
            ->get()
            ->map(fn($r) => ['name' => $r->name, 'nominal' => (int)$r->nominal]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'today_total'      => (int) $todayTotalNominal,
                'today_transaksi'  => (int) $todayTransaksi,
                'today_siswa'      => (int) $todaySiswaCount,
                'month_total'      => (int) $monthTotalNominal,
                'month_transaksi'  => (int) $monthTransaksi,
                'total_pembayaran' => (int) $totalPembayaran,
                'tagihan_lunas'    => (int) $tagihanLunas,
                'tagihan_belum'    => (int) $tagihanBelum,
                'total_siswa'      => (int) $totalSiswa,
            ],
            'trendMonthly'      => $trendMonthly,       // [{name, total, nominal}]
            'kategoriBreakdown' => $kategoriBreakdown,  // [{name, nominal}]
            'riwayat'           => $riwayat,           // 10 transaksi terakhir
        ]);
    }
}
