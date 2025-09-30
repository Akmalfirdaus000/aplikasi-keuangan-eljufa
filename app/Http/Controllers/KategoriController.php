<?php
namespace App\Http\Controllers;

use App\Models\Kategori;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KategoriController extends Controller
{
    public function index()
    {
        $kategoriList = Kategori::all();

        return Inertia::render('Kategori/Index', [
            'kategoriList' => $kategoriList,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|unique:kategoris,nama_kategori',
        ]);

        Kategori::create($request->all());

        return redirect()->route('kategori.index');
    }

    public function update(Request $request, Kategori $kategori)
    {
        $request->validate([
            'nama_kategori' => 'required|unique:kategoris,nama_kategori,' . $kategori->id,
        ]);

        $kategori->update($request->all());
        return redirect()->route('kategori.index');
    }

    public function destroy(Kategori $kategori)
    {
        $kategori->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }
}
