<?php
namespace App\Http\Controllers;

use App\Models\Tagihan;
use App\Models\Siswa;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TagihanController extends Controller
{
    public function index()
    {
        $tagihans = Tagihan::with(['siswa.kelas.sekolah', 'kategori'])->get();
        $siswaList = Siswa::with('kelas.sekolah')->get();
        $kategoriList = Kategori::all();

        return Inertia::render('Tagihan/Index', [
            'tagihans' => $tagihans,
            'siswaList' => $siswaList,
            'kategoriList' => $kategoriList,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'kategori_id' => 'required|exists:kategoris,id',
            'total_tagihan' => 'required|numeric',
        ]);

        $siswa = Siswa::find($request->siswa_id);

        Tagihan::create([
            'siswa_id' => $siswa->id,
            'kelas_id' => $siswa->kelas_id,
            'kategori_id' => $request->kategori_id,
            'total_tagihan' => $request->total_tagihan,
            'sisa_tagihan' => $request->total_tagihan,
            'status' => 'belum_lunas',
        ]);

        return redirect()->route('tagihans.index');
    }

    public function update(Request $request, Tagihan $tagihan)
    {
        $request->validate([
            'total_tagihan' => 'required|numeric',
        ]);

        $tagihan->update([
            'total_tagihan' => $request->total_tagihan,
            'sisa_tagihan' => $request->sisa_tagihan ?? $tagihan->sisa_tagihan,
            'status' => $request->status ?? $tagihan->status,
        ]);

        return redirect()->route('tagihans.index');
    }

    public function destroy(Tagihan $tagihan)
    {
        $tagihan->delete();
        return response()->json(['message' => 'Tagihan berhasil dihapus']);
    }
}
