<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\Sekolah;
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
    public function update(Request $request, Siswa $siswa)
    {
        $request->validate([
            'nama_siswa' => 'required|string|max:255',
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $siswa->update([
            'nama_siswa' => $request->nama_siswa,
            'kelas_id' => $request->kelas_id,
        ]);

        return redirect()->route('siswas.index')->with('success', 'Siswa berhasil diupdate');
    }

    // Hapus siswa
    public function destroy(Siswa $siswa)
    {
        $siswa->delete();
        return redirect()->route('siswas.index')->with('success', 'Siswa berhasil dihapus');
    }
}
