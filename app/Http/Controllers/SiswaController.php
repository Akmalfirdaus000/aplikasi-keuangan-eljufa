<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\Sekolah;
use App\Models\Kategori;
use Illuminate\Http\Request;

class SiswaController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware('auth');
    // }

    // Menampilkan daftar siswa
   public function index()
{
    $siswas = Siswa::with('kelas.sekolah')->orderBy('nama_siswa')->get();
    $sekolahList = Sekolah::with('kelas')->get(); // Semua sekolah beserta kelasnya

    return Inertia::render('Siswa/Index', [
        'siswas' => $siswas,
        'sekolahList' => $sekolahList,
    ]);
}


    // Simpan siswa baru
    public function store(Request $request)
    {
        $request->validate([
            'nama_siswa' => 'required|string|max:255',
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        Siswa::create([
            'nama_siswa' => $request->nama_siswa,
            'kelas_id' => $request->kelas_id,
        ]);

        return redirect()->route('siswas.index')->with('success', 'Siswa berhasil ditambahkan');
    }

    // Edit siswa (opsional, karena modal langsung pakai data dari index)
    public function edit(Siswa $siswa)
    {
        return Inertia::render('Siswa/Edit', [
            'siswa' => $siswa,
            'kelas' => Kelas::orderBy('nama_kelas')->get(),
        ]);
    }

    // Update siswa
  public function update(Request $request, $id)
    {
        $request->validate([
            'nama_siswa' => 'required|string|max:255',
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $siswa = Siswa::findOrFail($id);

        $siswa->update([
            'nama_siswa' => $request->nama_siswa,
            'kelas_id' => $request->kelas_id,
        ]);

        return redirect()->route('siswas.index')
            ->with('success', 'Siswa berhasil diperbarui');
    }

    // Hapus Siswa
    public function destroy($id)
    {
        try {
            $siswa = Siswa::findOrFail($id);
            $siswa->delete();

            return redirect()->route('siswas.index')
                ->with('success', 'Siswa berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->route('siswas.index')
                ->with('error', 'Gagal menghapus siswa: ' . $e->getMessage());
        }
    }
public function show($id)
{
    $siswa = Siswa::with([
        'kelas',
        'tagihans.kategori',
        'tagihans.pembayarans', // ambil semua pembayaran dari setiap tagihan
    ])->findOrFail($id);

    // Hitung tunggakan
    $totalTunggakan = $siswa->tagihans
        ->where('status', 'belum_lunas')
        ->sum('sisa_tagihan');

    // Kumpulkan semua pembayaran dari setiap tagihan
    $pembayarans = $siswa->tagihans
        ->flatMap(function ($tagihan) {
            return $tagihan->pembayarans;
        });

    // Hitung total pembayaran
    $totalPembayaran = $pembayarans->sum('nominal');

    return Inertia::render('Siswa/Show', [
        'siswa' => $siswa,
        'totalTunggakan' => $totalTunggakan,
        'totalPembayaran' => $totalPembayaran,
        'pembayarans' => $pembayarans, // biar bisa ditampilkan di frontend
    ]);
}




}
