<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Sekolah;
use App\Models\Kelas;
use App\Models\Kategori;
use App\Models\Tagihan;
use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $siswas = Siswa::with(['kelas.sekolah'])->get();
        $tagihans = Tagihan::with(['siswa.kelas.sekolah', 'kategori'])->get();
        $pembayarans = Pembayaran::with(['siswa.kelas.sekolah', 'tagihan.kategori'])->get();
        $kategoris = Kategori::all();
        $sekolahList = Sekolah::all();

        return Inertia::render('Laporan/Index', [
            'siswas'       => $siswas,
            'tagihans'     => $tagihans,
            'pembayarans'  => $pembayarans,
            'kategoris'    => $kategoris,
            'sekolahList'  => $sekolahList,
        ]);
    }

    // ============================
    // EXPORT PER SISWA
    // ============================
    public function exportPerSiswa(Request $request): StreamedResponse
    {
        $filename = "laporan_per_siswa.csv";
        $siswas = Siswa::with(['kelas.sekolah'])->get();
        $tagihans = Tagihan::all();
        $pembayarans = Pembayaran::with('tagihan')->get();

        $callback = function () use ($siswas, $tagihans, $pembayarans) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Nama', 'Sekolah', 'Kelas', 'Lokal', 'Total Tagihan', 'Total Bayar', 'Sisa']);

            foreach ($siswas as $siswa) {
                $tList = $tagihans->where('siswa_id', $siswa->id);
                $totalTagihan = $tList->sum('total_tagihan');
                $totalSisa = $tList->sum('sisa_tagihan');
                $totalBayar = $pembayarans->filter(fn($p) => optional($p->siswa)->id === $siswa->id)
                                          ->sum('nominal');

                fputcsv($file, [
                    $siswa->id,
                    $siswa->nama_siswa,
                    optional($siswa->kelas?->sekolah)->nama_sekolah,
                    optional($siswa->kelas)->nama_kelas,
                    $siswa->kelas->lokal ?? '-',
                    $totalTagihan,
                    $totalBayar,
                    $totalSisa,
                ]);
            }

            fclose($file);
        };

        return response()->streamDownload($callback, $filename, [
            "Content-Type" => "text/csv",
        ]);
    }

    // ============================
    // EXPORT REKAP PEMBAYARAN
    // ============================
    public function exportRekap(Request $request): StreamedResponse
    {
        $filename = "laporan_rekap.csv";
        $pembayarans = Pembayaran::all();

        $totals = [];
        foreach ($pembayarans as $p) {
            $date = \Carbon\Carbon::parse($p->tanggal_bayar ?? $p->created_at);
            $key = $date->format('Y-m');
            if (!isset($totals[$key])) $totals[$key] = 0;
            $totals[$key] += $p->nominal;
        }

        $callback = function () use ($totals) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Periode', 'Total Pemasukan']);
            foreach ($totals as $period => $total) {
                fputcsv($file, [$period, $total]);
            }
            fclose($file);
        };

        return response()->streamDownload($callback, $filename, [
            "Content-Type" => "text/csv",
        ]);
    }

    // ============================
    // EXPORT TUNGGAKAN
    // ============================
    public function exportTunggakan(Request $request): StreamedResponse
    {
        $filename = "laporan_tunggakan.csv";
        $siswas = Siswa::with(['kelas.sekolah'])->get();
        $tagihans = Tagihan::with('siswa')->get();

        $callback = function () use ($siswas, $tagihans) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Nama', 'Sekolah', 'Kelas', 'Lokal', 'Total Tunggakan']);

            foreach ($siswas as $siswa) {
                $tunggakan = $tagihans->where('siswa_id', $siswa->id)->sum('sisa_tagihan');
                if ($tunggakan > 0) {
                    fputcsv($file, [
                        $siswa->id,
                        $siswa->nama_siswa,
                        optional($siswa->kelas?->sekolah)->nama_sekolah,
                        optional($siswa->kelas)->nama_kelas,
                        $siswa->kelas->lokal ?? '-',
                        $tunggakan,
                    ]);
                }
            }

            fclose($file);
        };

        return response()->streamDownload($callback, $filename, [
            "Content-Type" => "text/csv",
        ]);
    }
}
