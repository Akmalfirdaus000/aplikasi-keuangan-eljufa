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
        // Ambil semua tagihan (kolom seperlunya)
        $tagihansRaw = Tagihan::query()
            ->select('id','siswa_id','kelas_id','kategori_id','deskripsi','total_tagihan','sisa_tagihan','status')
            ->get();

        // Kelompokkan per siswa untuk bikin tagihanMap
        $tagihanGrouped = $tagihansRaw->groupBy('siswa_id');

        // Ambil siswa + relasi yang dipakai FE
        $siswasRaw = Siswa::query()
            ->with([
                'kelas:id,nama_kelas,sekolah_id',
                'kelas.sekolah:id,nama_sekolah',
                // aktifkan jika memang ada relasi 'lokal':
                // 'lokal:id,nama_lokal',
            ])
            ->select('id','nama_siswa','kelas_id'/*,'lokal_id'*/)
            ->get();

        // KIRIM SEBAGAI ARRAY BERSIH + tanam tagihanMap
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
                    'status'        => $t->status, // 'belum_lunas' / 'lunas'
                ];
            }

            return [
                'id'         => $s->id,
                'nama_siswa' => $s->nama_siswa,
                'kelas'      => $s->kelas ? [
                    'id'          => $s->kelas->id,
                    'nama_kelas'  => $s->kelas->nama_kelas,
                    'sekolah'     => $s->kelas->sekolah ? [
                        'id'           => $s->kelas->sekolah->id,
                        'nama_sekolah' => $s->kelas->sekolah->nama_sekolah,
                    ] : null,
                ] : null,
                // 'lokal' => $s->lokal ? ['id'=>$s->lokal->id, 'nama_lokal'=>$s->lokal->nama_lokal] : null,
                'tagihanMap' => $map, // bisa kosong; FE punya fallback
            ];
        });

        $kategoris = Kategori::query()
            ->select('id','nama_kategori')
            ->get();

        // build_id buat ngetes cache backend di produksi
        return Inertia::render('Tagihan/Index', [
            'siswas'      => $siswas,
            'kategoris'   => $kategoris,
            'tagihansRaw' => $tagihansRaw, // Fallback FE kalau tagihanMap kosong
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
            $tagihan = Tagihan::findOrFail($id);
            $tagihan->delete();

            return redirect()->route('tagihans.index')
                ->with('success', 'Siswa berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->route('tagihans.index')
                ->with('error', 'Gagal menghapus siswa: ' . $e->getMessage());
        }
    }
}
