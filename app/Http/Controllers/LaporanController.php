<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Sekolah;
use App\Models\Kategori;
use App\Models\Pembayaran;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;

// Tambahan use untuk export
use PhpOffice\PhpSpreadsheet\Style\Border;
use Maatwebsite\Excel\Concerns\WithHeadings;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat; // ⬅️ tambahkan ini
use Maatwebsite\Excel\Concerns\WithColumnFormatting; // ⬅️ tambahkan ini

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        [$rows, $summaryKategori, $sekolahList, $kategoriList, $filters] = $this->buildRows($request);

        return Inertia::render('Laporan/Index', [
            'rows'         => $rows,
            'summary'      => $summaryKategori,
            'sekolahList'  => $sekolahList,
            'kategoriList' => $kategoriList,
            'filters'      => $filters,
            'build_id'     => now()->format('YmdHis'),
        ]);
    }

    /** =========================
     *  EXPORT: EXCEL
     *  ========================= */


// ...

public function exportExcel(Request $request)
{
    [$rows, , , , $filters] = $this->buildRows($request);

    // Susun heading & data (detail per baris)
    $headings = ['#','Tanggal','Nama Siswa','Sekolah','Kelas','Lokal','Kategori','Jumlah','Keterangan'];
    $data = [];
    $no = 1;
    $total = 0;

    foreach ($rows as $r) {
        $jumlah = (int)($r['jumlah'] ?? 0);

        $data[] = [
            $no++,
            $r['tanggal'] ?? '-',
            $r['siswa']['nama'] ?? '-',
            $r['sekolah']['nama'] ?? '-',
            $r['kelas']['nama'] ?? '-',
            $r['kelas']['lokal'] ?? '-',
            $r['kategori']['nama'] ?? '-',
            $jumlah, // biarkan numerik (jangan diformat string) agar Excel bisa formatkan
            (string)($r['keterangan'] ?? ''),
        ];
        $total += $jumlah;
    }

    // Tambah footer total (baris terakhir)
    if (!empty($rows)) {
        $data[] = ['', '', '', '', '', '', 'Jumlah Keseluruhan', $total, ''];
    }

    // Anonymous export class dengan style & number formatting
    $export = new class($headings, $data) implements
        FromArray, WithHeadings, WithStyles, WithColumnFormatting, ShouldAutoSize
    {
        public function __construct(private $headings, private $data) {}

        public function array(): array { return $this->data; }
        public function headings(): array { return $this->headings; }

        // Format kolom (H = Jumlah) -> Rupiah + ribuan
        public function columnFormats(): array
        {
            return [
                'H' => '"Rp" #,##0', // contoh: Rp 1.000
            ];
        }

        public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
        {
            $highestRow = $sheet->getHighestRow();
            $highestCol = $sheet->getHighestColumn();

            // Border semua sel
            $sheet->getStyle("A1:{$highestCol}{$highestRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => '000000'],
                    ],
                ],
            ]);

            // Heading bold & center
            $sheet->getStyle("A1:{$highestCol}1")->applyFromArray([
                'font' => ['bold' => true],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);

            // Kolom No center
            $sheet->getStyle("A2:A{$highestRow}")
                  ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Tanggal center biar rapi
            $sheet->getStyle("B2:B{$highestRow}")
                  ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Jumlah rata kanan (format angka sudah di columnFormats)
            $sheet->getStyle("H2:H{$highestRow}")
                  ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            // Tebalkan baris total terakhir jika ada
            if ($highestRow >= 2) {
                // Cari baris "Jumlah Keseluruhan" (baris terakhir jika ada total)
                $lastRowLabel = $sheet->getCell("G{$highestRow}")->getValue();
                if (is_string($lastRowLabel) && stripos($lastRowLabel, 'Jumlah Keseluruhan') !== false) {
                    $sheet->getStyle("A{$highestRow}:{$highestCol}{$highestRow}")->applyFromArray([
                        'font' => ['bold' => true],
                    ]);
                }
            }

            return [];
        }
    };

    $filename = 'laporan-keuangan-' . now()->format('Ymd_His') . '.xlsx';
    return Excel::download($export, $filename);
}



    /** =========================
     *  EXPORT: PDF
     *  ========================= */
public function exportPdf(Request $request)
{
    // Ambil data yang sama dengan halaman index
    [$rows, $summaryKategori, $sekolahList, $kategoriList, $filters] = $this->buildRows($request);

    // Pastikan SEMUA data yang dikirim ke Blade berupa array murni
    $rowsArr        = $rows instanceof Collection ? $rows->toArray()        : (array) $rows;
    $summaryArr     = $summaryKategori instanceof Collection ? $summaryKategori->toArray() : (array) $summaryKategori;
    $sekolahListArr = $sekolahList instanceof Collection ? $sekolahList->toArray() : (array) $sekolahList;
    $kategoriListArr= $kategoriList instanceof Collection ? $kategoriList->toArray() : (array) $kategoriList;
    $filtersArr     = is_array($filters) ? $filters : (array) $filters;

    // Render ke view PDF
    $pdf = Pdf::loadView('laporan.pdf', [
        'rows'         => $rowsArr,
        'summary'      => $summaryArr,
        'sekolahList'  => $sekolahListArr,
        'kategoriList' => $kategoriListArr,
        'filters'      => $filtersArr,
        'generated_at' => now()->format('Y-m-d H:i:s'),
    ])->setPaper('a4', 'landscape');

    $filename = 'laporan-keuangan-' . now()->format('Ymd_His') . '.pdf';
    return $pdf->download($filename);
}

    /** =========================
     *  HELPER: Build rows, summary, dropdowns, filters
     *  ========================= */
    protected function buildRows(Request $request)
    {
        // Ambil query param polos
        $from       = trim((string) $request->input('from', ''));
        $to         = trim((string) $request->input('to', ''));
        $sekolah    = (string) $request->input('sekolah', 'all'); // nama sekolah
        $kelas      = (string) $request->input('kelas', 'all');   // nama kelas
        $lokal      = (string) $request->input('lokal', 'all');
        $kategoriId = (string) $request->input('kategori', 'all'); // id kategori
        $search     = (string) $request->input('search', '');

        $amountColumn = 'nominal';
        $dateColumn   = 'tanggal_bayar';

        $q = Pembayaran::query()
            ->with([
                'tagihan:id,siswa_id,kategori_id',
                'tagihan.kategori:id,nama_kategori',
                'tagihan.siswa:id,nama_siswa,kelas_id',
                'tagihan.siswa.kelas:id,nama_kelas,sekolah_id,lokal',
                'tagihan.siswa.kelas.sekolah:id,nama_sekolah',
            ])
            ->select(['id','tagihan_id',$amountColumn,$dateColumn,'keterangan','metode']);

        // Filter tanggal
        if ($from !== '' && $to !== '') {
            $q->whereBetween($dateColumn, [$from, $to]);
        } elseif ($from !== '') {
            $q->whereDate($dateColumn, '>=', $from);
        } elseif ($to !== '') {
            $q->whereDate($dateColumn, '<=', $to);
        }

        // Filter sekolah/kelas/lokal
        if ($sekolah !== 'all') {
            $q->whereHas('tagihan.siswa.kelas.sekolah', fn($qq) => $qq->where('nama_sekolah', $sekolah));
        }
        if ($kelas !== 'all') {
            $q->whereHas('tagihan.siswa.kelas', fn($qq) => $qq->where('nama_kelas', $kelas));
        }
        if ($lokal !== 'all') {
            $q->whereHas('tagihan.siswa.kelas', fn($qq) => $qq->where('lokal', $lokal));
        }

        // Filter kategori (by id)
        if ($kategoriId !== 'all' && $kategoriId !== '') {
            $q->whereHas('tagihan.kategori', fn($qq) => $qq->where('id', $kategoriId));
        }

        // Pencarian bebas
        if ($search !== '') {
            $term = mb_strtolower($search);
            $q->where(function($qq) use ($term) {
                $qq->whereHas('tagihan.siswa', fn($w) => $w->whereRaw('LOWER(nama_siswa) like ?', ["%{$term}%"]))
                  ->orWhereHas('tagihan.kategori', fn($w) => $w->whereRaw('LOWER(nama_kategori) like ?', ["%{$term}%"]))
                  ->orWhereRaw('LOWER(keterangan) like ?', ["%{$term}%"]);
            });
        }

        $rows = $q->get()->map(function($p) use ($amountColumn, $dateColumn) {
            $tgl = $p->{$dateColumn};
            if ($tgl instanceof \Carbon\CarbonInterface) $tgl = $tgl->format('Y-m-d');
            elseif ($tgl) $tgl = (string) $tgl;

            return [
                'id'        => $p->id,
                'tanggal'   => $tgl,
                'jumlah'    => (int) ($p->{$amountColumn} ?? 0),
                'keterangan'=> $p->keterangan,
                'metode'    => $p->metode,
                'siswa'     => [
                    'id'   => optional($p->tagihan?->siswa)->id,
                    'nama' => optional($p->tagihan?->siswa)->nama_siswa,
                ],
                'kelas'     => [
                    'id'   => optional($p->tagihan?->siswa?->kelas)->id,
                    'nama' => optional($p->tagihan?->siswa?->kelas)->nama_kelas,
                    'lokal'=> optional($p->tagihan?->siswa?->kelas)->lokal,
                ],
                'sekolah'   => [
                    'id'   => optional($p->tagihan?->siswa?->kelas?->sekolah)->id,
                    'nama' => optional($p->tagihan?->siswa?->kelas?->sekolah)->nama_sekolah,
                ],
                'kategori'  => [
                    'id'   => optional($p->tagihan?->kategori)->id,
                    'nama' => optional($p->tagihan?->kategori)->nama_kategori,
                ],
            ];
        })->values();

        // Ringkasan per kategori
        $byKategori = [];
        foreach ($rows as $r) {
            $key = $r['kategori']['nama'] ?? '(Tanpa Kategori)';
            $byKategori[$key] = ($byKategori[$key] ?? 0) + ($r['jumlah'] ?? 0);
        }
        $summaryKategori = [];
        foreach ($byKategori as $nama => $total) {
            $summaryKategori[] = ['nama' => $nama, 'total' => (int) $total];
        }
        usort($summaryKategori, fn($a,$b) => $b['total'] <=> $a['total']);

        // Dropdown sumber (sekolah & kelas)
        $sekolahList = Sekolah::query()
            ->with(['kelas:id,nama_kelas,sekolah_id,lokal,tingkat'])
            ->select('id','nama_sekolah')
            ->get()
            ->map(fn($s) => [
                'id'           => $s->id,
                'nama_sekolah' => $s->nama_sekolah,
                'kelas'        => $s->kelas->map(fn($k) => [
                    'id' => $k->id, 'nama_kelas' => $k->nama_kelas, 'lokal' => $k->lokal, 'tingkat' => $k->tingkat
                ])->values(),
            ]);

        $kategoriList = Kategori::select('id','nama_kategori')->orderBy('nama_kategori')->get();

        $filters = [
            'from'    => $from,
            'to'      => $to,
            'sekolah' => $sekolah,
            'kelas'   => $kelas,
            'lokal'   => $lokal,
            'kategori'=> $kategoriId,
            'search'  => $search,
        ];

        return [$rows, $summaryKategori, $sekolahList, $kategoriList, $filters];
    }

// laporam pengeluaran
public function pengeluaranIndex(Request $request)
{
    [$rows, $summaryKategori, $filters] = $this->buildPengeluaranRows($request);

    return Inertia::render('Laporan/Pengeluaran', [
        'rows'    => $rows,           // detail baris pengeluaran
        'summary' => $summaryKategori,// rekap per kategori
        'filters' => $filters,        // from/to/kategori/search/perPage
        'build_id'=> now()->format('YmdHis'),
    ]);
}
public function pengeluaranExportExcel(Request $request)
{
    [$rows, , $filters] = $this->buildPengeluaranRows($request);

    // Kolom: #, Tanggal, Kategori, Metode, Deskripsi, Jumlah, User
    $headings = ['#','Tanggal','Kategori','Metode','Deskripsi','Jumlah','User'];
    $data = [];
    $no = 1;
    $total = 0;

    foreach ($rows as $r) {
        $jumlah = (int)($r['jumlah'] ?? 0);
        $data[] = [
            $no++,
            $r['tanggal'] ?? '-',
            $r['kategori']['nama'] ?? '-',
            $r['metode'] ?? '-',
            (string)($r['keterangan'] ?? ''),
            $jumlah, // numerik biar Excel bisa format
            $r['user']['name'] ?? '-',
        ];
        $total += $jumlah;
    }

    if (!empty($rows)) {
        // Footer total
        $data[] = ['', '', '', '', 'Jumlah Keseluruhan', $total, ''];
    }

    $export = new class($headings, $data) implements
        \Maatwebsite\Excel\Concerns\FromArray,
        \Maatwebsite\Excel\Concerns\WithHeadings,
        \Maatwebsite\Excel\Concerns\WithStyles,
        \Maatwebsite\Excel\Concerns\WithColumnFormatting,
        \Maatwebsite\Excel\Concerns\ShouldAutoSize
    {
        public function __construct(private $headings, private $data) {}

        public function array(): array { return $this->data; }
        public function headings(): array { return $this->headings; }

        // Kolom F = Jumlah
        public function columnFormats(): array
        {
            return ['F' => '"Rp" #,##0'];
        }

        public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
        {
            $highestRow = $sheet->getHighestRow();
            $highestCol = $sheet->getHighestColumn();

            // Border
            $sheet->getStyle("A1:{$highestCol}{$highestRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        'color' => ['argb' => '000000'],
                    ],
                ],
            ]);

            // Heading bold center
            $sheet->getStyle("A1:{$highestCol}1")->applyFromArray([
                'font' => ['bold' => true],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    'vertical'   => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                ],
            ]);

            // No & Tanggal center
            $sheet->getStyle("A2:A{$highestRow}")
                  ->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B2:B{$highestRow}")
                  ->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

            // Jumlah right
            $sheet->getStyle("F2:F{$highestRow}")
                  ->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT);

            // Tebalkan baris total (jika ada)
            if ($highestRow >= 2) {
                $lastRowLabel = $sheet->getCell("E{$highestRow}")->getValue();
                if (is_string($lastRowLabel) && stripos($lastRowLabel, 'Jumlah Keseluruhan') !== false) {
                    $sheet->getStyle("A{$highestRow}:{$highestCol}{$highestRow}")
                          ->applyFromArray(['font' => ['bold' => true]]);
                }
            }

            return [];
        }
    };

    $filename = 'laporan-pengeluaran-' . now()->format('Ymd_His') . '.xlsx';
    return \Maatwebsite\Excel\Facades\Excel::download($export, $filename);
}
protected function buildPengeluaranRows(Request $request)
{
    $from     = trim((string) $request->input('from', ''));
    $to       = trim((string) $request->input('to', ''));
    $kategori = (string) $request->input('kategori', 'all'); // id kategori
    $search   = (string) $request->input('search', '');
    $perPage  = (int)($request->input('perPage', 0)) ?: 0;   // optional, kalau mau pagination di FE

    $dateCol  = 'tanggal';

    $q = Pengeluaran::query()
        ->with([
            'user:id,name,email',
            'kategori:id,nama_kategori',
        ])
        ->select('id', $dateCol, 'deskripsi', 'nominal', 'metode', 'user_id', 'kategori_id')
        ->orderByDesc($dateCol)
        ->orderByDesc('id');

    // Filter tanggal inklusif
    if ($from !== '' && $to !== '') {
        $q->whereBetween($dateCol, [$from.' 00:00:00', $to.' 23:59:59']);
    } elseif ($from !== '') {
        $q->where($dateCol, '>=', $from.' 00:00:00');
    } elseif ($to !== '') {
        $q->where($dateCol, '<=', $to.' 23:59:59');
    }

    // Filter kategori by ID
    if ($kategori !== 'all' && $kategori !== '') {
        $q->where('kategori_id', (int) $kategori);
    }

    // Search bebas: deskripsi / metode / kategori.nama / user.name
    if ($search !== '') {
        $term = mb_strtolower($search);
        $q->where(function ($w) use ($term) {
            $w->whereRaw('LOWER(deskripsi) like ?', ["%{$term}%"])
              ->orWhereRaw('LOWER(metode) like ?', ["%{$term}%"])
              ->orWhereHas('kategori', fn($wk) => $wk->whereRaw('LOWER(nama_kategori) like ?', ["%{$term}%"]))
              ->orWhereHas('user', fn($wu) => $wu->whereRaw('LOWER(name) like ?', ["%{$term}%"]));
        });
    }

    $items = $q->get();

    // Normalisasi rows (array) untuk FE & export
    $rows = $items->map(function ($p) use ($dateCol) {
        $tgl = $p->{$dateCol};
        if ($tgl instanceof \Carbon\CarbonInterface) $tgl = $tgl->format('Y-m-d');
        elseif ($tgl) $tgl = (string) $tgl;

        return [
            'id'        => $p->id,
            'tanggal'   => $tgl,
            'jumlah'    => (int) $p->nominal,
            'keterangan'=> $p->deskripsi,
            'metode'    => $p->metode,
            'kategori'  => [
                'id'   => optional($p->kategori)->id,
                'nama' => optional($p->kategori)->nama_kategori,
            ],
            'user'      => [
                'id'   => optional($p->user)->id,
                'name' => optional($p->user)->name,
            ],
        ];
    })->values()->all();

    // Rekap per kategori
    $agg = [];
    foreach ($rows as $r) {
        $key = $r['kategori']['nama'] ?? '(Tanpa Kategori)';
        $agg[$key] = ($agg[$key] ?? 0) + ($r['jumlah'] ?? 0);
    }
    $summaryKategori = [];
    foreach ($agg as $nama => $total) {
        $summaryKategori[] = ['nama' => $nama, 'total' => (int) $total];
    }
    usort($summaryKategori, fn($a,$b) => $b['total'] <=> $a['total']);

    $filters = [
        'from'     => $from,
        'to'       => $to,
        'kategori' => $kategori,
        'search'   => $search,
        'perPage'  => $perPage,
    ];

    return [$rows, $summaryKategori, $filters];
}

public function pengeluaranExportPdf(Request $request)
{
    [$rows, $summary, $filters] = $this->buildPengeluaranRows($request);

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('laporan.pengeluaran-pdf', [
        'rows'        => is_array($rows) ? $rows : (array) $rows,
        'summary'     => is_array($summary) ? $summary : (array) $summary,
        'filters'     => is_array($filters) ? $filters : (array) $filters,
        'generated_at'=> now()->format('Y-m-d H:i:s'),
    ])->setPaper('a4', 'landscape');

    $filename = 'laporan-pengeluaran-' . now()->format('Ymd_His') . '.pdf';
    return $pdf->download($filename);
}


}
