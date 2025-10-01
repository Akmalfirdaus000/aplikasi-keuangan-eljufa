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

        // ✅ perbaiki route
        return redirect()->route('kategoris.index');
    }

  public function update(Request $request, $id)
{
    $request->validate([
        'nama_kategori' => 'required|string|max:255|unique:kategoris,nama_kategori,' . $id,
    ]);

    $kategori = Kategori::findOrFail($id);

    $kategori->update([
        'nama_kategori' => $request->nama_kategori,
    ]);

    return redirect()->route('kategoris.index')->with('success', 'Kategori berhasil diperbarui');
}


   public function destroy($id)
{
    try {
        $kategori = Kategori::findOrFail($id);
        $kategori->delete();

        return redirect()->route('kategoris.index')
            ->with('success', 'Kategori berhasil dihapus');
    } catch (\Exception $e) {
        return redirect()->route('kategoris.index')
            ->with('error', 'Gagal menghapus kategori: ' . $e->getMessage());
    }
}

}
