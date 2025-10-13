<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sekolah;

class SekolahSeeder extends Seeder
{
    public function run(): void
    {
        Sekolah::updateOrCreate(['nama_sekolah' => 'TK']);
        Sekolah::updateOrCreate(['nama_sekolah' => 'SD']);
    }
}
