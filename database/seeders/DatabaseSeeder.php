<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Sekolah;
use App\Models\Kelas;
use App\Models\Kategori;
use App\Models\Siswa;
use App\Models\Tagihan;
use App\Models\Pembayaran;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // === USER ADMIN ===
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('123'),
            ]
        );

        // === SEKOLAH ===
        $tk = Sekolah::updateOrCreate(['nama_sekolah' => 'TK']);
        $sd = Sekolah::updateOrCreate(['nama_sekolah' => 'SD']);

        // === KELAS TK ===
        $tkKelas = Kelas::updateOrCreate([
            'sekolah_id' => $tk->id,
            'tingkat' => 'TK',
            'nama_kelas' => 'Umum',
            'lokal' => 'Umum',
        ]);

        // === KELAS SD 1–6 A/B/C ===
        $lokal = ['A','B','C'];
        $kelasSDList = [];
        for ($tingkat = 1; $tingkat <= 6; $tingkat++) {
            foreach ($lokal as $l) {
                $kelas = Kelas::updateOrCreate([
                    'sekolah_id' => $sd->id,
                    'tingkat' => (string)$tingkat,
                    'nama_kelas' => (string)$tingkat, // Nama kelas = angka 1–6
                    'lokal' => $l,
                ]);
                $kelasSDList[] = $kelas;
            }
        }

        // === KATEGORI ===
        $kategoriList = [
            'Uang Masuk',
            'Daftar Ulang',
            'SPP',
            'Sosial',
            'Antar Jemput',
            'Buku Paket',
            'Makan Siang',
        ];
        foreach ($kategoriList as $kategori) {
            Kategori::updateOrCreate(['nama_kategori' => $kategori]);
        }
        $sppKategori = Kategori::where('nama_kategori', 'SPP')->first();

        // === SISWA DEMO ===
        $siswaList = [];

        // 1 siswa TK
        $siswaList[] = Siswa::updateOrCreate([
            'kelas_id' => $tkKelas->id,
            'nama_siswa' => 'Siswa TK Umum',
        ]);

        // 1 siswa per kelas SD (ambil semua lokal A/B/C)
        foreach ($kelasSDList as $kelas) {
            $siswaList[] = Siswa::updateOrCreate([
                'kelas_id' => $kelas->id,
                'nama_siswa' => "Siswa SD {$kelas->tingkat}{$kelas->lokal}",
            ]);
        }

        // === TAGIHAN & PEMBAYARAN DEMO ===
        foreach ($siswaList as $siswa) {
            $tagihan = Tagihan::create([
                'siswa_id' => $siswa->id,
                'kelas_id' => $siswa->kelas_id,
                'kategori_id' => $sppKategori->id,
                'total_tagihan' => 1000000,
                'sisa_tagihan' => 1000000,
                'status' => 'belum_lunas',
            ]);

            // Bayar 250k
            Pembayaran::create([
                'tagihan_id' => $tagihan->id,
                'tanggal_bayar' => now(),
                'nominal' => 250000,
                'metode' => 'Tunai',
            ]);

            // Update sisa tagihan
            $tagihan->sisa_tagihan -= 250000;
            if ($tagihan->sisa_tagihan <= 0) {
                $tagihan->status = 'lunas';
            }
            $tagihan->save();
        }
    }
}
