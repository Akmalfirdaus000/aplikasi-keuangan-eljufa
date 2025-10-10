<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Siswa;
use App\Models\Tagihan;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TagihanController extends Controller
{
public function index()
{
    $tagihansRaw = Tagihan::query()
        ->select('id','siswa_id','kelas_id','kategori_id','deskripsi','total_tagihan','sisa_tagihan','status')
        ->get();

    $tagihanGrouped = $tagihansRaw->groupBy('siswa_id');

    $siswasRaw = Siswa::query()
        ->with([
            // tambahkan kolom 'lokal' di select kelas
            'kelas:id,nama_kelas,sekolah_id,lokal',
            'kelas.sekolah:id,nama_sekolah',
        ])
        ->select('id','nama_siswa','kelas_id')
        ->get();

    $siswas = $siswasRaw->map(function ($s) use ($tagihanGrouped) {
        $map = [];
        foreach (($tagihanGrouped[$s->id] ?? []) as $t) {
            $map[$t->kategori_id] = [
                'id'            => $t->id,
                'siswa_id'      => $t->siswa_id,
                'kategori_id'   => $t->kategori_id,
                'deskripsi'     => $t->deskripsi,
                'total_tagihan' => $t->total_tagihan,
                'sisa_tagihan'  => $t->sisa_tagihan,
                'status'        => $t->status,
            ];
        }

        return [
            'id'         => $s->id,
            'nama_siswa' => $s->nama_siswa,
            'kelas'      => $s->kelas ? [
                'id'           => $s->kelas->id,
                'nama_kelas'   => $s->kelas->nama_kelas,
                'lokal'        => $s->kelas->lokal, // <<— ambil langsung dari kolom kelas.lokal
                'sekolah'      => $s->kelas->sekolah ? [
                    'id'           => $s->kelas->sekolah->id,
                    'nama_sekolah' => $s->kelas->sekolah->nama_sekolah,
                ] : null,
            ] : null,
            'tagihanMap' => $map,
        ];
    });

    $kategoris = Kategori::query()->select('id','nama_kategori')->get();

    return Inertia::render('Tagihan/Index', [
        'siswas'      => $siswas,
        'kategoris'   => $kategoris,
        'tagihansRaw' => $tagihansRaw,
        'build_id'    => now()->format('YmdHis'),
    ]);
}


    public function store(Request $request)
    {
        $validated = $request->validate([
            'siswa_id'      => 'required|exists:siswas,id',
            'kategori_id'   => 'required|exists:kategoris,id',
            'deskripsi'     => 'nullable|string',
            'total_tagihan' => 'required|numeric|min:0',
            'sisa_tagihan'  => 'nullable|numeric|min:0',
            'status'        => 'nullable|in:belum_lunas,lunas,Belum Lunas,Lunas',
        ]);

        $siswa = Siswa::select('id','kelas_id')->findOrFail($validated['siswa_id']);

        $status = $validated['status'] ?? 'belum_lunas';
        $status = $status === 'Belum Lunas' ? 'belum_lunas' : ($status === 'Lunas' ? 'lunas' : $status);

        $total = $validated['total_tagihan'];
        $sisa  = array_key_exists('sisa_tagihan', $validated) && $validated['sisa_tagihan'] !== null
            ? $validated['sisa_tagihan']
            : $total;

        Tagihan::create([
            'siswa_id'      => $siswa->id,
            'kelas_id'      => $siswa->kelas_id,
            'kategori_id'   => $validated['kategori_id'],
            'deskripsi'     => $validated['deskripsi'] ?? null,
            'total_tagihan' => $total,
            'sisa_tagihan'  => $sisa,
            'status'        => $status,
        ]);

        return redirect()->route('tagihans.index');
    }

    public function update(Request $request, Tagihan $tagihan)
    {
        $validated = $request->validate([
            'deskripsi'     => 'nullable|string',
            'total_tagihan' => 'required|numeric|min:0',
            'sisa_tagihan'  => 'nullable|numeric|min:0',
            'status'        => 'nullable|in:belum_lunas,lunas,Belum Lunas,Lunas',
        ]);

        $status = $validated['status'] ?? $tagihan->status;
        $status = $status === 'Belum Lunas' ? 'belum_lunas' : ($status === 'Lunas' ? 'lunas' : $status);

        $tagihan->update([
            'deskripsi'     => $validated['deskripsi'] ?? $tagihan->deskripsi,
            'total_tagihan' => $validated['total_tagihan'],
            'sisa_tagihan'  => array_key_exists('sisa_tagihan', $validated)
                ? $validated['sisa_tagihan']
                : $tagihan->sisa_tagihan,
            'status'        => $status,
        ]);

        return redirect()->route('tagihans.index');
    }

    // public function destroy(Tagihan $tagihan)
    // {
    //     $tagihan->delete();
    //     return response()->json(['message' => 'Tagihan berhasil dihapus']);
    // }
      public function destroy($id)
{
    try {
        DB::transaction(function () use ($id) {
            // 🔹 1. Ambil tagihan + pembayaran terkait
            $tagihan = Tagihan::with('pembayarans')->findOrFail($id);

            foreach ($tagihan->pembayarans as $pb) {
                $kategoriId = $tagihan->kategori_id;
                $nominal    = (int) $pb->nominal;

                // 🔹 2. Lock saldo kategori
                $saldo = \App\Models\KasSaldo::where('kategori_id', $kategoriId)->lockForUpdate()->first();
                if ($saldo) {
                    $saldoSebelum = (int) $saldo->saldo;
                    $saldoSetelah = $saldoSebelum - $nominal;

                    // 🔹 3. Catat reversal di kas_mutasis
                    \App\Models\KasMutasi::create([
                        'tanggal'        => now(),
                        'tipe'           => 'kredit', // uang keluar (reversal)
                        'kategori_id'    => $kategoriId,
                        'ref_type'       => 'pembayaran_void',
                        'ref_id'         => $pb->id,
                        'keterangan'     => 'Reversal pembayaran karena Tagihan dihapus',
                        'metode'         => $pb->metode ?? '-',
                        'kredit'         => $nominal,
                        'debit'          => 0,
                        'saldo_sebelum'  => $saldoSebelum,
                        'saldo_setelah'  => $saldoSetelah,
                        'user_id'        => auth()->id(),
                    ]);

                    // 🔹 4. Update saldo cache
                    $saldo->saldo = $saldoSetelah;
                    $saldo->save();
                }

                // 🔹 5. Hapus pembayaran (boleh pakai delete() agar event terpicu)
                $pb->delete();
            }

            // 🔹 6. Hapus tagihan setelah semua pembayaran diproses
            $tagihan->delete();
        });

        return redirect()->route('tagihans.index')
            ->with('success', 'Tagihan + pembayaran terkait berhasil dihapus & saldo diperbarui.');
    } catch (\Exception $e) {
        return redirect()->route('tagihans.index')
            ->with('error', 'Gagal menghapus tagihan: ' . $e->getMessage());
    }
}

}
