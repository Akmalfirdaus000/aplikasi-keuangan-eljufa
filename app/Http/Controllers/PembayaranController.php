<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PembayaranController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tagihan_id' => 'required|exists:tagihans,id',
            'nominal' => 'required|numeric|min:1',
            'keterangan' => 'nullable|string',
            'metode' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $tagihan = Tagihan::findOrFail($validated['tagihan_id']);

            // simpan pembayaran
            Pembayaran::create([
                'tagihan_id'    => $tagihan->id,
                'nominal'       => $validated['nominal'],
                'tanggal_bayar' => now(),
                'keterangan'    => $validated['keterangan'] ?? '-',
                'metode'        => $validated['metode'] ?? 'Tunai', // ✅ default "Tunai"
            ]);

            // update sisa tagihan
            $tagihan->sisa_tagihan -= $validated['nominal'];
            if ($tagihan->sisa_tagihan <= 0) {
                $tagihan->sisa_tagihan = 0;
                $tagihan->status = 'lunas';
            }
            $tagihan->save();
        });

        return back()->with('success', 'Pembayaran berhasil ditambahkan.');
    }
}
