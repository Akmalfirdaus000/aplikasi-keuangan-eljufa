<?php

namespace App\Http\Controllers;

use App\Models\Sekolah;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SekolahController extends Controller
{
    public function index()
    {
        $sekolahs = Sekolah::all();
        return Inertia::render('Sekolah/Index', compact('sekolahs'));
    }

    public function create()
    {
        return Inertia::render('Sekolah/Create');
    }

    public function store(Request $request)
    {
        $request->validate(['nama_sekolah' => 'required|string|max:255']);
        Sekolah::create($request->all());
        return redirect()->route('sekolahs.index');
    }

    public function edit(Sekolah $sekolah)
    {
        return Inertia::render('Sekolah/Edit', compact('sekolah'));
    }

    public function update(Request $request, Sekolah $sekolah)
    {
        $request->validate(['nama_sekolah' => 'required|string|max:255']);
        $sekolah->update($request->all());
        return redirect()->route('sekolahs.index');
    }

   public function destroy(Sekolah $sekolah)
{
    try {
        $sekolah->delete();

        // Jika request via Inertia/JS, kita bisa kirim response JSON
        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Sekolah berhasil dihapus',
                'status' => 'success',
            ]);
        }

        // Redirect biasa jika request non-AJAX
        return redirect()->route('sekolahs.index')->with('success', 'Sekolah berhasil dihapus');
    } catch (\Exception $e) {
        return redirect()->route('sekolahs.index')->with('error', 'Gagal menghapus sekolah: '.$e->getMessage());
    }
}

}
