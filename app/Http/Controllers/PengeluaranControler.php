<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\KasSaldo;
use App\Models\Kategori;
use App\Models\KasMutasi;
use App\Models\Pembayaran;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PengeluaranControler extends Controller
{
 public function index(Request $request)
    {
        $from     = trim((string) $request->input('from', ''));
        $to       = trim((string) $request->input('to', ''));
        $search   = trim((string) $request->input('search', ''));
        $kategori = trim((string) $request->input('kategori', ''));        // boleh kirim id kategori
        $perPage  = (int) ($request->input('perPage', 20)) ?: 20;

        // =========================
        // Query daftar pengeluaran
        // =========================
        $q = Pengeluaran::query()
            ->with([
                'user:id,name,email',
                'kategori:id,nama_kategori', // pastikan kolom ini ada di tabel kategoris
            ])
            ->select('id','tanggal','deskripsi','nominal','metode','user_id','kategori_id')
            ->orderByDesc('tanggal')
            ->orderByDesc('id');

        // Filter tanggal (inklusif sampai 23:59:59)
        if ($from !== '' && $to !== '') {
            $q->whereBetween('tanggal', [$from.' 00:00:00', $to.' 23:59:59']);
        } elseif ($from !== '') {
            $q->where('tanggal', '>=', $from.' 00:00:00');
        } elseif ($to !== '') {
            $q->where('tanggal', '<=', $to.' 23:59:59');
        }

        // Filter kategori_id (kalau FE kirim id string "3", dll)
        if ($kategori !== '' && $kategori !== 'all') {
            $q->where('kategori_id', (int) $kategori);
        }

        // Search (deskripsi / metode / kategori.nama / user.name)
        if ($search !== '') {
            $term = mb_strtolower($search);
            $q->where(function ($w) use ($term) {
                $w->whereRaw('LOWER(deskripsi) like ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(metode) like ?', ["%{$term}%"])
                  ->orWhereHas('kategori', function ($wk) use ($term) {
                      $wk->whereRaw('LOWER(nama_kategori) like ?', ["%{$term}%"]);
                  })
                  ->orWhereHas('user', function ($wu) use ($term) {
                      $wu->whereRaw('LOWER(name) like ?', ["%{$term}%"]);
                  });
            });
        }

        $paginator = $q->paginate($perPage)->appends($request->query());

        // Normalisasi rows untuk FE
        $rows = collect($paginator->items())->map(function ($p) {
            $tgl = $p->tanggal;
            if ($tgl instanceof \Carbon\CarbonInterface) $tgl = $tgl->format('Y-m-d');
            elseif ($tgl) $tgl = (string) $tgl;

            return [
                'id'          => $p->id,
                'tanggal'     => $tgl,
                'deskripsi'   => $p->deskripsi,
                'nominal'     => (float) $p->nominal,
                'metode'      => $p->metode,
                'kategori_id' => $p->kategori_id,
                'kategori_nama' => optional($p->kategori)->nama_kategori,
                'user'        => [
                    'id'    => optional($p->user)->id,
                    'name'  => optional($p->user)->name,
                    'email' => optional($p->user)->email,
                ],
            ];
        });

        // =========================
        // Dropdown kategori (opsi)
        // =========================
        // Ambil dari tabel kategoris supaya stabil (bukan distinct string)
        $kategoriOptions = Kategori::query()
            ->select('id','nama_kategori')
            ->orderBy('nama_kategori')
            ->get();

        // ===========================================
        // RINGKASAN: Uang Masuk/Keluar & Kas per Kategori
        // ===========================================
        // Total pembayaran (income) & pengeluaran (out)
        $incomeTotal = (float) Pembayaran::sum('nominal');
        $incomeMonth = (float) Pembayaran::whereYear('tanggal_bayar', now()->year)
                        ->whereMonth('tanggal_bayar', now()->month)
                        ->sum('nominal');

        $outTotal = (float) Pengeluaran::sum('nominal');
        $outMonth = (float) Pengeluaran::whereYear('tanggal', now()->year)
                        ->whereMonth('tanggal', now()->month)
                        ->sum('nominal');

        // Saldo global (legacy) — masih dikirim untuk kompatibilitas,
        // meskipun sekarang kamu pakai saldo per-kategori.
        $saldoTotal = $incomeTotal - $outTotal;
        $saldoMonth = $incomeMonth - $outMonth;

        // Kas per kategori: ambil dari kas_saldos + nama kategori
        // plus breakdown mutasi (optional)
       // Kas per kategori: ambil saldo + ringkas debit/kredit
$kasPerKategori = \App\Models\KasSaldo::query()
    ->join('kategoris','kategoris.id','=','kas_saldos.kategori_id')
    ->leftJoin('kas_mutasis','kas_mutasis.kategori_id','=','kas_saldos.kategori_id')
    ->groupBy('kas_saldos.kategori_id','kategoris.nama_kategori','kas_saldos.saldo')
    ->orderBy('kategoris.nama_kategori')
    ->get([
        'kas_saldos.kategori_id as id',
        'kategoris.nama_kategori as nama',
        'kas_saldos.saldo',
        DB::raw("COALESCE(SUM(CASE WHEN kas_mutasis.tipe='debit'  THEN kas_mutasis.debit  ELSE 0 END),0)  as income_total"),
        DB::raw("COALESCE(SUM(CASE WHEN kas_mutasis.tipe='credit' THEN kas_mutasis.kredit ELSE 0 END),0)  as out_total"),
    ])
    ->map(function ($r) {
        return [
            'id'           => (int) $r->id,
            'nama'         => (string) $r->nama,
            'saldo'        => (float) $r->saldo,
            'income_total' => (float) $r->income_total,
            'out_total'    => (float) $r->out_total,
        ];
    });

        return Inertia::render('Keuangan/Pengeluaran', [
            'rows' => $rows,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
            'filters' => [
                'from'     => $from,
                'to'       => $to,
                'search'   => $search,
                'kategori' => $kategori,  // kirim balik supaya FE bisa prefill
                'perPage'  => $perPage,
            ],
            'kategoriOptions' => $kategoriOptions,  // [{id, nama_kategori}]
            'summary' => [
                // Uang Masuk (global)
                'income_total' => $incomeTotal,
                'income_month' => $incomeMonth,

                // Uang Keluar (global)
                'out_total'    => $outTotal,
                'out_month'    => $outMonth,

                // Saldo (global)
                'saldo_total'  => $saldoTotal,
                'saldo_month'  => $saldoMonth,

                // PER KATEGORI (dipakai FE untuk tombol Tambah & saldo kategori)
                'kas_per_kategori' => $kasPerKategori,
            ],
        ]);
    }

  public function store(Request $request)
    {
        // Izinkan input "1.000.000"
        $rawNominal   = (string) $request->input('nominal', '');
        $cleanNominal = (int) preg_replace('/[^\d]/', '', $rawNominal);

        $validated = $request->validate([
            'tanggal'     => 'required|date',
            'deskripsi'   => 'nullable|string|max:255',
            'kategori_id' => 'required|exists:kategoris,id',
            'metode'      => 'nullable|string|max:50',
        ]);

        if ($cleanNominal < 1) {
            throw ValidationException::withMessages([
                'nominal' => 'Nominal tidak valid.',
            ]);
        }

        DB::transaction(function () use ($validated, $cleanNominal, $request) {
            $kategoriId = (int) $validated['kategori_id'];

            // 1) Kunci saldo kategori
            $saldo = KasSaldo::where('kategori_id', $kategoriId)->lockForUpdate()->first();
            if (!$saldo) {
                // Tidak ada uang masuk untuk kategori ini → tidak boleh keluar
                throw ValidationException::withMessages([
                    'nominal' => 'Saldo kategori belum tersedia (belum ada uang masuk pada kategori ini).',
                ]);
            }

            $saldoSebelum = (int) $saldo->saldo;
            if ($saldoSebelum <= 0) {
                throw ValidationException::withMessages([
                    'nominal' => 'Saldo kategori 0. Tambahkan pembayaran (uang masuk) pada kategori ini.',
                ]);
            }
            if ($cleanNominal > $saldoSebelum) {
                throw ValidationException::withMessages([
                    'nominal' => 'Nominal melebihi saldo kategori saat ini ('.number_format($saldoSebelum,0,',','.').').',
                ]);
            }

            // 2) Simpan pengeluaran
            $pengeluaran = Pengeluaran::create([
                'tanggal'     => $request->date('tanggal'),
                'deskripsi'   => $validated['deskripsi'] ?? null,
                'nominal'     => $cleanNominal,
                'kategori_id' => $kategoriId,         // ← simpan kategori
                'metode'      => $validated['metode'] ?? 'Tunai',
                'user_id'     => auth()->id(),
            ]);

            // 3) Ledger: credit kategori + update saldo
            $saldoSetelah = $saldoSebelum - $cleanNominal;

            KasMutasi::create([
                'tanggal'        => $request->date('tanggal'),
                'tipe'           => 'kredit',
                'kategori_id'    => $kategoriId,
                'nominal'        => $cleanNominal,
                'saldo_sebelum'  => $saldoSebelum,
                'saldo_setelah'  => $saldoSetelah,
                'sumber'         => 'pengeluaran',
                'referensi_id'   => $pengeluaran->id,
                'keterangan'     => $validated['deskripsi'] ?? 'Pengeluaran kas',
                'metode'         => $validated['metode'] ?? 'Tunai',
                'user_id'        => auth()->id(),
            ]);

            $saldo->saldo = $saldoSetelah;
            $saldo->save();
        });

        return back()->with('success', 'Pengeluaran berhasil ditambahkan. Saldo kategori diperbarui.');
    }

    public function show(Pengeluaran $pengeluaran)
    {
        return response()->json($pengeluaran->load('user:id,name,email'));
    }

    public function update(Request $request, Pengeluaran $pengeluaran)
    {
        $data = $request->validate([
            'tanggal'   => 'required|date',
            'deskripsi' => 'nullable|string|max:255',
            'nominal'   => 'required|numeric|min:0.01',
            'kategori'  => 'nullable|string|max:100',
            'metode'    => 'nullable|string|max:50',
        ]);

        // Cek saldo saat update (saldo + nominal_lama) agar tidak minus
        $incomeTotal = (float) Pembayaran::sum('nominal');
        $outTotal    = (float) Pengeluaran::where('id','!=',$pengeluaran->id)->sum('nominal');
        $saldoAvail  = $incomeTotal - $outTotal; // saldo yang tersedia bila record ini diubah

        if ($data['nominal'] > $saldoAvail) {
            return back()->withErrors([
                'nominal' => 'Nominal melebihi saldo kas saat ini ('.number_format($saldoAvail,0,',','.').').',
            ])->withInput();
        }

        $pengeluaran->update($data);

        return back()->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function destroy(Pengeluaran $pengeluaran)
    {
        $pengeluaran->delete();
        return back()->with('success', 'Pengeluaran berhasil dihapus.');
    }
}
