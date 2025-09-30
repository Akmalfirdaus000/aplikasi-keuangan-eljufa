<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PembayaranController extends Controller
{


    // INDEX
    public function index()
    {
        // Ambil semua pembayaran beserta relasi yang dibutuhkan
        $pembayarans = Pembayaran::with([
            'tagihan.siswa.kelas.sekolah',
            'tagihan.kategori'
        ])->get();

        // Ambil tagihan untuk form create
        $tagihans = Tagihan::with([
            'siswa.kelas.sekolah',
            'kategori'
        ])->get();

        return Inertia::render('Pembayaran/Index', [
            'pembayarans' => $pembayarans,
            'tagihans' => $tagihans,
        ]);
    }

    // STORE
   

    // EDIT (ambil data untuk modal)
    public function edit(Pembayaran $pembayaran)
    {
        $tagihans = Tagihan::with([
            'siswa.kelas.sekolah',
            'kategori'
        ])->get();

        return Inertia::render('Pembayaran/Edit', [
            'pembayaran' => $pembayaran,
            'tagihans' => $tagihans,
        ]);
    }

    // UPDATE
        public function store(Request $request)
    {
        $data = $request->validate([
            'tagihan_id' => 'required|exists:tagihans,id',
            'tanggal_bayar' => 'required|date',
            'nominal' => 'required|numeric|min:1',
            'metode' => 'required|string',
        ]);

        $pembayaran = Pembayaran::create($data);

        // Update sisa tagihan dan status
        $tagihan = Tagihan::find($data['tagihan_id']);
        $tagihan->sisa_tagihan -= $data['nominal'];
        $tagihan->status = $tagihan->sisa_tagihan <= 0 ? 'lunas' : 'belum_lunas';
        $tagihan->save();

        // Redirect ke halaman index (Inertia akan refresh)
        return redirect()->route('pembayarans.index');
    }

    public function update(Request $request, Pembayaran $pembayaran)
    {
        $data = $request->validate([
            'tagihan_id' => 'required|exists:tagihans,id',
            'tanggal_bayar' => 'required|date',
            'nominal' => 'required|numeric|min:1',
            'metode' => 'required|string',
        ]);

        // Restore sisa tagihan lama
        $oldNominal = $pembayaran->nominal;
        $tagihan = $pembayaran->tagihan;
        $tagihan->sisa_tagihan += $oldNominal;

        // Update pembayaran
        $pembayaran->update($data);

        // Update sisa tagihan baru
        $tagihan->sisa_tagihan -= $data['nominal'];
        $tagihan->status = $tagihan->sisa_tagihan <= 0 ? 'lunas' : 'belum_lunas';
        $tagihan->save();

        return redirect()->route('pembayarans.index');
    }
   

    // DESTROY
    public function destroy(Pembayaran $pembayaran)
    {
        // Kembalikan sisa_tagihan sebelum hapus
        $tagihan = Tagihan::find($pembayaran->tagihan_id);
        $tagihan->sisa_tagihan += $pembayaran->nominal;
        if ($tagihan->sisa_tagihan > $tagihan->total_tagihan) {
            $tagihan->sisa_tagihan = $tagihan->total_tagihan;
        }
        if ($tagihan->sisa_tagihan < $tagihan->total_tagihan) {
            $tagihan->status = 'belum_lunas';
        }
        $tagihan->save();

        $pembayaran->delete();

        return redirect()->route('pembayarans.index');
    }
}
