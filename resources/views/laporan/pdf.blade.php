@php
    // ===== Helper tampilan =====
    function idr($n) { return 'Rp ' . number_format((int)($n ?? 0), 0, ',', '.'); }
    $isPivot = empty($filters['kategori']) || $filters['kategori'] === 'all';

    // ===== Data kop (fallback jika tidak dikirim dari controller) =====
    $kop = $kop ?? [
        'nama_yayasan'   => 'YAYASAN EL-JUFA LEGUM',
        'nama_sekolah'   => 'SEKOLAH SD–TK EL-JUFA',
        'alamat'         => 'Alamat: Komplek Pendidikan Yayasan El-Jufa Legum, Jorong Taratak Galundi, Kec. Lembah Gumanti, Kab. Solok',
        'kontak'         => 'HP. 082269430499',
        'kepala'         => 'Dr. JUNSEL FRIADE ALSTRA, S.H.I., M.H.',
        'nip'            => 'NIP. 1234567890',
        'kota'           => 'Alahan Panjang',
        'logo_kiri'      => 'logo-kop-eljufa.png',
        'logo_kanan'     => '',

        // >>> Tambahan untuk blok tanda tangan
        'pengelola_jabatan' => 'Pengelola Keuangan',
        'pengelola_nama'    => ' Elvira Diana S, M.Pd',
        'pengelola_nip'     => 'NIP. 123456789',
        // Jika ingin label kanan selain “Mengetahui, Kepala Sekolah”, bisa override:
        'mengetahui_label'  => 'Mengetahui, Ketua Yayasan',
    ];

    // ===== Pastikan path logo absolut (Dompdf butuh path file sistem yang valid) =====
    $tryPath = function ($p) {
        if (!$p) return null;
        if (is_file($p)) return $p;
        $pub = public_path($p);
        if (is_file($pub)) return $pub;
        $stor = storage_path('app/public/'.$p);
        if (is_file($stor)) return $stor;
        return null;
    };
    $logoLeftPath  = $tryPath($kop['logo_kiri']  ?? null);
    $logoRightPath = $tryPath($kop['logo_kanan'] ?? null);
@endphp

<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Per Kategori</title>
    <style>
        /* ===== Base ===== */
        * { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; }
        h1 { font-size: 16px; margin: 0 0 8px; }
        .muted { color: #374151; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .nowrap { white-space: nowrap; }

        /* ===== Table utama ===== */
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #888; padding: 6px 8px; }
        th { background: #f1f5f9; text-align: left; }
        .total-row { font-weight: bold; background: #f8fafc; }

        /* ===== Non-border (kop & tanda tangan) ===== */
        .no-border, .no-border td { border: none !important; }

        /* ===== Kop surat styles (dompdf-friendly) ===== */
        .kop-wrap   { width:100%; }
        .kop-table  { width:100%; border-collapse:collapse; }
        .kop-table td { border:none !important; vertical-align:middle; }

        .logo-box   { width: 130px; }
        .logo-img   { height: 95px; width:auto; object-fit: contain; }

        .kop-center { text-align:center; }
        .kop-left   { text-align:left; }
        .kop-right  { text-align:right; }

        .kop-title-1 { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; }
        .kop-title-2 { font-size: 14px; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
        .kop-title-3 { font-size: 13px; font-weight: 700; text-transform: uppercase; margin-top: 1px; }
        .kop-sub     { font-size: 11px; color:#374151; margin-top: 4px; line-height: 1.45; }

        .kop-hr-1   { border:0; border-top:3px solid #000; margin: 6px 0 2px; }
        .kop-hr-2   { border:0; border-top:1px solid #000; margin: 0 0 14px; }

        /* ===== Signature block ===== */
        .sign-table { width:100%; border-collapse:collapse; }
        .sign-table td { border:none !important; vertical-align:top; }
        .sign-box   { width:50%; }
        .sign-gap   { height: 70px; } /* ruang untuk tanda tangan */
        .uline      { text-decoration: underline; }
        .fw-bold    { font-weight: 700; }
         .sign-table   { width:100%; border-collapse:collapse; table-layout:fixed; }
  .sign-table td{ border:none !important; vertical-align:top; }
  .sign-role    { font-weight:600; margin-bottom:6px; }
  .sign-space   { height:80px; }       /* ruang untuk paraf/tanda tangan */
  .sign-name    { text-decoration:underline; font-weight:700; display:inline-block; }
  .sign-meta    { margin-top:4px; }
  .text-center  { text-align:center; }
    </style>
</head>
<body>

    {{-- ========== KOP SURAT ========== --}}
    <div class="kop-wrap">
        <table class="kop-table">
            <tr>
                <td class="kop-left logo-box">
                    @if ($logoLeftPath)
                        <img src="{{ $logoLeftPath }}" class="logo-img" alt="Logo Kiri">
                    @endif
                </td>

                <td class="kop-center">
                    <div class="kop-title-1">{{ $kop['nama_yayasan'] }}</div>
                    <div class="kop-title-2">KENAGARIAN ALAHAN PANJANG</div>
                    <div class="kop-title-3">KEC. LEMBAH GUMANTI {{ strtoupper($kop['kota'] ?? 'KAB. SOLOK') }}</div>
                    <div class="kop-sub">
                        {{ $kop['alamat'] }}<br>
                        {{ $kop['kontak'] }}
                    </div>
                </td>

                <td class="kop-right logo-box">
                    @if ($logoRightPath)
                        <img src="{{ $logoRightPath }}" class="logo-img" alt="Logo Kanan">
                    @endif
                </td>
            </tr>
        </table>

        <hr class="kop-hr-1">
        <hr class="kop-hr-2">
    </div>

    <h1 class="text-center" style="margin-bottom:4px;">Laporan Per Kategori</h1>
    <div class="text-center" style="font-size:13px; font-weight:600; margin-bottom:6px;">
        {{ $kop['nama_sekolah'] }}
    </div>

    <div class="mb-3 muted text-center">
        Periode: {{ $filters['from'] ?? '−' }} s/d {{ $filters['to'] ?? '−' }} &middot;
        Sekolah: {{ $filters['sekolah'] ?? 'all' }} &middot;
        Kelas: {{ $filters['kelas'] ?? 'all' }} &middot;
        Lokal: {{ $filters['lokal'] ?? 'all' }}
    </div>

    {{-- ======================== --}}
    {{-- MODE PIVOT (Semua Kategori) --}}
    {{-- ======================== --}}
    @if ($isPivot)
        @php
            $cats = collect($kategoriList);
            $catNames = $cats->pluck('nama_kategori')->values();

            $pivot = [];
            foreach ($rows as $r) {
                $sid = $r['siswa']['id'] ?? null;
                if (!$sid) continue;

                if (!isset($pivot[$sid])) {
                    $pivot[$sid] = [
                        'siswa' => [
                            'nama'    => $r['siswa']['nama'] ?? '-',
                            'sekolah' => $r['sekolah']['nama'] ?? '',
                            'kelas'   => $r['kelas']['nama'] ?? '',
                            'lokal'   => $r['kelas']['lokal'] ?? '',
                        ],
                        'bycat' => [],
                        'total' => 0,
                    ];
                }

                $cat = $r['kategori']['nama'] ?? '(Tanpa Kategori)';
                $amt = (int)($r['jumlah'] ?? 0);
                $pivot[$sid]['bycat'][$cat] = ($pivot[$sid]['bycat'][$cat] ?? 0) + $amt;
                $pivot[$sid]['total'] += $amt;
            }

            $footer = [];
            foreach ($catNames as $cn) { $footer[$cn] = 0; }
            $grand = 0;
            foreach ($pivot as $row) {
                foreach ($catNames as $cn) $footer[$cn] += ($row['bycat'][$cn] ?? 0);
                $grand += $row['total'];
            }
        @endphp

        <table>
            <thead>
                <tr>
                    <th style="width: 28px;" class="text-center">#</th>
                    <th>Nama Siswa</th>
                    @foreach ($catNames as $cn)
                        <th class="nowrap">{{ $cn }}</th>
                    @endforeach
                    <th class="text-right nowrap">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @php $i=1; @endphp
                @forelse ($pivot as $row)
                    <tr>
                        <td class="text-center">{{ $i++ }}</td>
                        <td>
                            <strong>{{ $row['siswa']['nama'] }}</strong><br>
                            <span class="muted">
                                {{ $row['siswa']['sekolah'] ? $row['siswa']['sekolah'] . ' • ' : '' }}
                                {{ $row['siswa']['kelas'] ?: '-' }}
                                {{ $row['siswa']['lokal'] ? ' • ' . $row['siswa']['lokal'] : '' }}
                            </span>
                        </td>
                        @foreach ($catNames as $cn)
                            <td class="text-right">{{ ($row['bycat'][$cn] ?? 0) ? idr($row['bycat'][$cn]) : '-' }}</td>
                        @endforeach
                        <td class="text-right">{{ idr($row['total']) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ 2 + count($catNames) + 1 }}" class="text-center">Tidak ada data</td>
                    </tr>
                @endforelse

                @if (!empty($pivot))
                    <tr class="total-row">
                        <td colspan="2" class="text-right">Jumlah Keseluruhan</td>
                        @foreach ($catNames as $cn)
                            <td class="text-right">{{ $footer[$cn] ? idr($footer[$cn]) : '-' }}</td>
                        @endforeach
                        <td class="text-right">{{ idr($grand) }}</td>
                    </tr>
                @endif
            </tbody>
        </table>

    {{-- ======================== --}}
    {{-- MODE DETAIL (Per Kategori) --}}
    {{-- ======================== --}}
    @else
        @php
            $total = array_sum(array_map(fn($r) => (int)($r['jumlah'] ?? 0), $rows));
        @endphp

        <table>
            <thead>
                <tr>
                    <th style="width: 28px;" class="text-center">#</th>
                    <th class="nowrap">Tanggal</th>
                    <th>Nama Siswa</th>
                    <th>Sekolah</th>
                    <th>Kelas</th>
                    <th>Lokal</th>
                    <th>Kategori</th>
                    <th class="text-right">Jumlah</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @php $i=1; @endphp
                @forelse ($rows as $r)
                    <tr>
                        <td class="text-center">{{ $i++ }}</td>
                        <td class="nowrap">{{ $r['tanggal'] ?? '-' }}</td>
                        <td>{{ $r['siswa']['nama'] ?? '-' }}</td>
                        <td>{{ $r['sekolah']['nama'] ?? '-' }}</td>
                        <td>{{ $r['kelas']['nama'] ?? '-' }}</td>
                        <td>{{ $r['kelas']['lokal'] ?? '-' }}</td>
                        <td>{{ $r['kategori']['nama'] ?? '-' }}</td>
                        <td class="text-right">{{ idr($r['jumlah'] ?? 0) }}</td>
                        <td>{{ $r['keterangan'] ?? '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="9" class="text-center">Tidak ada data</td>
                    </tr>
                @endforelse

                @if (!empty($rows))
                    <tr class="total-row">
                        <td colspan="7" class="text-right">Jumlah Keseluruhan</td>
                        <td class="text-right">{{ idr($total) }}</td>
                        <td></td>
                    </tr>
                @endif
            </tbody>
        </table>
    @endif

    {{-- ========== TANDA TANGAN (2 kolom) ========== --}}
  {{-- ========== TANDA TANGAN (2 kolom rapi) ========== --}}
<table class="no-border sign-table" style="margin-top:28px;">
  <colgroup>
    <col style="width:45%;">
    <col style="width:10%;">  {{-- spacer agar jarak tengah konsisten --}}
    <col style="width:45%;">
  </colgroup>
  <tbody>
    <tr>
      <!-- Kiri -->
      <td class="text-center">
          {{ $kop['kota'] ?? 'Kab. Solok' }}, {{ now()->translatedFormat('d F Y') }}

        <div class="sign-role">{{ $kop['pengelola_jabatan'] ?? 'Pengelola Keuangan' }}</div>
        <div class="sign-space"></div>
        <div class="sign-name">{{ $kop['pengelola_nama'] ?? 'Nama Pengelola' }}</div>
        <div class="sign-meta">{{ $kop['pengelola_nip'] ?? 'NIP. —' }}</div>
      </td>

      <!-- Spacer -->
      <td></td>

      <!-- Kanan -->
      <td class="text-center">
        <div class="sign-role">
          <br>{{ $kop['mengetahui_label'] ?? 'Mengetahui, Kepala Sekolah' }}
        </div>
        <div class="sign-space"></div>
        <div class="sign-name">{{ $kop['kepala'] ?? '' }}</div>
        <div class="sign-meta">{{ $kop['nip'] ?? '' }}</div>
      </td>
    </tr>
  </tbody>
</table>

</body>
</html>
