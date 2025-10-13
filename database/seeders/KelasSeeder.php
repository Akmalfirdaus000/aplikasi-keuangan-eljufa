<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sekolah;
use App\Models\Kelas;

class KelasSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil data sekolah
        $tk = Sekolah::where('nama_sekolah', 'TK')->first();
        $sd = Sekolah::where('nama_sekolah', 'SD')->first();

        if (!$tk || !$sd) {
            $this->command->error('❌ Data sekolah belum ada. Jalankan SekolahSeeder terlebih dahulu.');
            return;
        }

        // === KELAS TK ===
        Kelas::updateOrCreate(
            [
                'sekolah_id' => $tk->id,
                'lokal' => 'UMUM',
            ],
            [
                'tingkat' => 'TK',
                'nama_kelas' => 'TK UMUM',
            ]
        );

        // === KELAS SD ===
        $kelasData = [
            '1' => ['AL-FARABI', 'AL-GHAZALI', 'AL-KHAWARIZMI'],
            '2' => ['AL-KINDI', 'AL-JAUHARI', 'AL-BATTANI'],
            '3' => ['IBNU RUSYD', 'IBNU SINA'],
            '4' => ['IBNU THUFAIL'],
            '5' => [], // disiapkan untuk nanti
            '6' => [], // disiapkan untuk nanti
        ];

        foreach ($kelasData as $tingkat => $lokalList) {
            foreach ($lokalList as $lokal) {
                Kelas::updateOrCreate(
                    [
                        'sekolah_id' => $sd->id,
                        'lokal' => $lokal,
                    ],
                    [
                        'tingkat' => strval($tingkat), // pastikan string
                        'nama_kelas' => "{$tingkat} {$lokal}",
                    ]
                );
            }
        }

        $this->command->info('✅ Data kelas TK dan SD berhasil disimpan.');
    }
}
