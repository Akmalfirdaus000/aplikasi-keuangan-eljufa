<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kategori;

class KategoriSeeder extends Seeder
{
    public function run(): void
    {
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
    }
}
