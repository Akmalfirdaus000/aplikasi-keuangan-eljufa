@php
    // Helper tampilan
    function idr($n) { return 'Rp ' . number_format((int)($n ?? 0), 0, ',', '.'); }
    $isPivot = empty(request('kategori')) || request('kategori') === 'all';
@endphp

<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Per Kategori</title>
    <style>
        * { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; }
        h1 { font-size: 16px; margin: 0 0 8px; }
        .muted { color: #666; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #888; padding: 6px 8px; }
        th { background: #f1f5f9; text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .nowrap { white-space: nowrap; }
        .total-row { font-weight: bold; background: #f8fafc; }
    </style>
</head>
<body>
    <h1>Laporan Per Kategori</h1>

    <div class="mb-3 muted">
        Periode: {{ $filters['from'] ?? '−' }} s/d {{ $filters['to'] ?? '−' }}<br>
        Sekolah: {{ $filters['sekolah'] ?? 'all' }} |
        Kelas: {{ $filters['kelas'] ?? 'all' }} |
        Lokal: {{ $filters['lokal'] ?? 'all' }}
    </div>

    @if ($isPivot)
        {{-- MODE PIVOT: Ringkasan per siswa dengan kolom dinamis dari kategoriList --}}
        @php
            // Bentuk daftar kategori (array of objects/arrays) apapun bentuknya, pakai Collection agar konsisten
            $cats = collect($kategoriList);
            // Map nama kategori -> index
            $catNames = $cats->pluck('nama_kategori')->values();

            // Susun pivot berdasarkan $rows
            $pivot = []; // [siswa_id => ['siswa' => ..., 'bycat' => [nama_kategori=>nominal], 'total'=>...]]
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

            // Hitung footer total per kategori
            $footer = [];
            foreach ($catNames as $cn) { $footer[$cn] = 0; }
            $grand = 0;
            foreach ($pivot as $row) {
                foreach ($catNames as $cn) {
                    $footer[$cn] += ($row['bycat'][$cn] ?? 0);
                }
                $grand += $row['total'];
            }
        @endphp

        <table>
            <thead>
                <tr>
                    <th>#</th>
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
                        <td>{{ $i++ }}</td>
                        <td>
                            <strong>{{ $row['siswa']['nama'] }}</strong><br>
                            <span class="muted">
                                {{ $row['siswa']['sekolah'] ? $row['siswa']['sekolah'] . ' • ' : '' }}
                                {{ $row['siswa']['kelas'] ?: '-' }}
                                {{ $row['siswa']['lokal'] ? ' • ' . $row['siswa']['lokal'] : '' }}
                            </span>
                        </td>
                        @foreach ($catNames as $cn)
                            <td class="text-right">{{ ($row['bycat'][$cn] ?? 0) ? idr($row['bycat'][$cn] ?? 0) : '-' }}</td>
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

    @else
        {{-- MODE DETAIL: Tabel baris transaksi --}}
        @php
            $total = array_sum(array_map(fn($r) => (int)($r['jumlah'] ?? 0), $rows));
        @endphp

        <table>
            <thead>
                <tr>
                    <th>#</th>
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
                        <td>{{ $i++ }}</td>
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
</body>
</html>
