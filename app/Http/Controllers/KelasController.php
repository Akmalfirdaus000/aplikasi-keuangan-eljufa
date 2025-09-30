<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\Sekolah;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KelasController extends Controller
{
    // Menampilkan daftar kelas
    public function index()
    {
        $kelasList = Kelas::with('sekolah')->get();
        $sekolahList = Sekolah::with('kelas')->get();

        return Inertia::render('Kelas/Index', [
            'kelasList' => $kelasList,
            'sekolahList' => $sekolahList,
        ]);
    }

    // Simpan kelas baru
    public function store(Request $request)
    {
        $request->validate([
            'sekolah_id' => 'required|exists:sekolahs,id',
            'tingkat' => 'required|string',
            'nama_kelas' => 'required|string|max:255',
            'lokal' => 'required|string',
        ]);

        Kelas::create([
            'sekolah_id' => $request->sekolah_id,
            'tingkat' => $request->tingkat,
            'nama_kelas' => $request->nama_kelas,
            'lokal' => $request->lokal,
        ]);

        return redirect()->route('kelas.index')->with('success', 'Kelas berhasil ditambahkan');
    }

    // Edit kelas
    public function edit(Kelas $kelas)
    {
        $sekolahList = Sekolah::all();
        return Inertia::render('Kelas/Edit', [
            'kelas' => $kelas->load('sekolah'),
            'sekolahList' => $sekolahList,
        ]);
    }

    // Update kelas
    public function update(Request $request, Kelas $kelas)
    {
        $request->validate([
            'sekolah_id' => 'required|exists:sekolahs,id',
            'tingkat' => 'required|string',
            'nama_kelas' => 'required|string|max:255',
            'lokal' => 'required|string',
        ]);

        $kelas->update([
            'sekolah_id' => $request->sekolah_id,
            'tingkat' => $request->tingkat,
            'nama_kelas' => $request->nama_kelas,
            'lokal' => $request->lokal,
        ]);

        return redirect()->route('kelas.index')->with('success', 'Kelas berhasil diperbarui');
    }

    // Hapus kelas
    public function destroy(Kelas $kelas)
{
    $kelas->delete();
    return redirect()->route('kelas.index')->with('success', 'Kelas berhasil dihapus');
}

}
