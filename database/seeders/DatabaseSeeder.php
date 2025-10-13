<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Sekolah;
use App\Models\Kelas;
use App\Models\Kategori;
use App\Models\Siswa;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // === USER ADMIN ===
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin | Elvira Diana',
                'password' => Hash::make('qwerty_eljufa'),
            ]
        );

        // === SEKOLAH ===
        $tk = Sekolah::updateOrCreate(['nama_sekolah' => 'TK']);
        $sd = Sekolah::updateOrCreate(['nama_sekolah' => 'SD']);

        // === KELAS TK ===
        $tkKelas = Kelas::updateOrCreate([
            'sekolah_id' => $tk->id,
            'tingkat' => 'TK',
            'nama_kelas' => 'TK UMUM',
            'lokal' => 'UMUM',
        ]);

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

        // === DATA KELAS SD 1–4 ===
        $kelasData = [
            '1' => [
                'AL-FARABI' => [
                    'ADONIA NAJMA ORLIN', 'ALINEA BAHIRA', 'ALNINO MUSTAQY', 'ANNAYA FAHIYYATUL RAHMA',
                    'APRILLIA SABHIRA', 'ARFA MAULANA', 'ARKANA THUFAIL', 'ARSYALAN YAZID ABBASY',
                    'ARZAN KINZA RAVINDRA', 'ATHA FARIZ RADEYA ALZENA', 'ERDOGAN ABBASY', 'FAIZ SYAF PUTRA',
                    'FARIZ HAZMI RAFASYA', 'FATHIR ANANDA YOSYADE', 'HADISTY ALMUSSAQILLA KUSUMA', 'HAZEL HARIFI HUMAIRA',
                    'MILAN SAFWAN', 'MUHAMMAD AR RASYID', 'NABHAN MUHAMMAD ZAIDAN AL HANAN', 'NADA FITRIA',
                    'NADINE ZAILA AZZAHRA', 'NAWAF AL FARUQ', 'QURNIATUL KHAYIRA AHMAD', 'SAFRAN ALFAJRI'
                ],
                'AL-GHAZALI' => [
                    'AISYAH SHANUM AL QAIDA', 'AKSA AL GHIFARI', 'ANDHIKA SAPUTRA', 'ARSYANA SILKO', 'ARYA AGUSTIAN PUTRA',
                    'ASSYFA PUTRI AURA ZASKIA', 'AZILA AGUSTIA', 'CHAYRA FAZILA', 'FAYZAN JONATAN', 'INAYAH CAHYATUL IRSAD',
                    'MARYAM AZZAHRO', 'MIFTAHUL REFTY', 'MUHAMED VARANE RAMADHAN', 'MUHAMMAD ARKHA FARJANA',
                    'MUHAMMAD D ZIQRI', 'MUHAMMAD GIBRAN MAULANA', 'NADIF FUADI', 'NAFISA ZAHIRA',
                    'NUR ZAKIYYA MUTMAINNAH', 'RAZIQ MADANI'
                ],
                'AL-KHAWARIZMI' => [
                    'AKBAR MELWINDO', 'ALFINO ALGIFARI', 'AXSEL ZIKRA', 'AZZAM FURQAN', 'FANYA ELVINA NAZMI',
                    'HANAN ABDUL JABAR', 'MUHAMMAD GIBRAN', 'MUHAMMAD RAFKI FERLI', 'NAIRA AZZAHRA',
                    'QINARA ARRASY RAHMAD', 'RAFKA ABRIAN AMARIS', 'RATU AMELIA HAKIM', 'REGINA ADILA PUTRI',
                    'RESKI RAMADHAN', 'SYAFIQ YANDRI RAMADHAN', 'ZAHFRAN'
                ],
            ],
            '2' => [
                'AL-KINDI' => [
                    'AHMAD PAHLAM', 'ALBY GIOVANI', 'ALBY LUTHFI HERKA', 'ANAIRA GIFFY ABILLA', 'ARAF APRILIO',
                    'ARVINO ATTAR RAMADAN', 'ASHARUM WAFIQ RAMADHANI', 'ASHYFA LAILATUL ZAHRA', 'AZKA MUZAKI',
                    'AZLAN ZAYDAN', 'BAIHAQI KHAIZAN', 'GIBRAN ALFATHUR RIZKY', 'KIMBERLAN HAKIM', 'LATHIFA KHAIRANI',
                    'MICHIO RAYYAN ALBY', 'MUHAMMAD RAFA', 'NAUREN ALFATUNISA', 'NAZWA APRILIA', 'RAFIF ADITYA STEVANA',
                    'RAMADHANI WIJAYA KUSUMA', 'SYAKILLA FREDELA ADEMA', 'SYAQILA SAPUTRI', 'TAZKIYA NAYYIRAH'
                ],
                'AL-JAUHARI' => [
                    'ADAM JULIO HIDAYAT', 'ARKANA KENZO AL FARABI', 'ARSY CAHAYA RAMADHANI', 'ARUMI NASHA',
                    'ARVINO YAZID SHAPUTRA', 'DIFA KURNIA PUTRI', 'HAFIZAH YULIA P.', 'HANAFI ALDYANSAH',
                    'HAZEL SALSABILA NOFLA', 'MUHAMMAD AL GIBRAN', 'MUHAMMAD ALFARID', 'NABILLA AZZAHRA',
                    'NAYLA PUTRI', 'NUR HALIMAH', 'RAFKA FATIR MUTTAQIN', 'RAHMAT RIZKY ILLAHI', 'RYSZARD APRILIO AGAKI',
                    'SYAFI MUFTI ISMAIL', 'ZAFRAN ATHAYA AKBAR'
                ],
                'AL-BATTANI' => [
                    'ANIQ CAHAYA DEWI', 'AKHSAN ARCENIO ABIB', 'AQIVA RIZQYYA', 'FAHIM AIDIL PRADIPTA', 'FIGEL PRATAMA',
                    'HAFLANI ZAHSY', 'KAIF ALGHAZI SALAM', 'KHAIRA ABIBA EFENDI', 'KHAIRUL YUDA', 'MARVEL ADITYA JANSEN',
                    'METHA APRILIA', 'MUHAMAD YUSUF', 'MUHAMMAD AKBAR', 'MUHAMMAD ZAFRAN', 'PUTRI SYAKILA',
                    'RAFFASYA ATHAR GHIEJA', 'RAFIF MUZZAKI PURNAMA', 'ZHARIF MUNADHIL RASYID', 'ZHAFRAN PRASETYO'
                ],
            ],
            '3' => [
                'IBNU RUSYD' => [
                    'ALIFAN KURNIA FAJRI', 'ANNISA ZAHRATUL USRAH', 'AXEL JURO ROYFION', 'AYUDIA ADIBAH', 'AYUMI AZZAHRA',
                    'CALIEF AL ASFI', 'FADIL AKBAR MUBAROK', 'FAJRI PRATAMA ADRIS', 'HANUM AFIFA', 'HAZIZAH RESRIAN',
                    'KANIA PUTRI ADELIA', 'LUTHFI HASBI', 'M. ARYA FARHAN AGUSTA', 'MIFTAHUL NATIN JANNAH',
                    'MIKAYLA AUREL LATISHA', 'MUHAMMAD FURQON', 'MUHAMMAD RAHLIL', 'YASFA JIAN AQILAH',
                    'ZAM SYAZIA PUTRI'
                ],
                'IBNU SINA' => [
                    'ALIFAN KURNIA FAJRI', 'ANNISA ZAHRATUL USRAH', 'AXEL JURO ROYFION', 'AYUDIA ADIBAH', 'AYUMI AZZAHRA',
                    'CALIEF AL ASFI', 'FADIL AKBAR MUBAROK', 'FAJRI PRATAMA ADRIS', 'HANUM AFIFA', 'HAZIZAH RESRIAN',
                    'KANIA PUTRI ADELIA', 'LUTHFI HASBI', 'M. ARYA FARHAN AGUSTA', 'MIFTAHUL NATIN JANNAH',
                    'MIKAYLA AUREL LATISHA', 'MUHAMMAD FURQON', 'MUHAMMAD RAHLIL', 'YASFA JIAN AQILAH',
                    'ZAM SYAZIA PUTRI'
                ],
            ],
            '4' => [
                'IBNU THUFAIL' => [
                    'ADITYA RAHMADAN', 'AIRIN HIKMAH', 'ANINDYTA KESYA YULIKA', 'ARSYLA CLARISA ALFAS',
                    'HANIFAH KHAIRUNISA', 'ILHAMDI TAUFIK', 'MUHAMMAD DAFFA AL FATIH', 'M. SYAUQI ARJUNA',
                    'MUHAMMAD RAFATAR AYUKI', 'MOHAMMAD AL FATHIR', 'MUHAMAD HAIKAL', 'NAJLA SAUFA HUSNA',
                    'NAVIA GUSTIRA', 'QEYSHA D RAMADANI', 'RAFALDI PUTRA PRATAMA', 'RANIA ABIDAH', 'RAUDATUL NANSI',
                    'RIDHO AIDYL PUTRA', 'ROHIT ALBADILLAH REFYANI', 'SHANGGRA ARMABIYANDA', 'WILONA AZHAR',
                    'ZAFRAN DWI MIRTA'
                ]
            ],
        ];

        // === SIMPAN DATA KELAS & SISWA ===
        foreach ($kelasData as $tingkat => $lokalData) {
            foreach ($lokalData as $lokal => $siswaNamaList) {
               $kelas = Kelas::updateOrCreate(
    [
        'sekolah_id' => $sd->id,
        'lokal' => $lokal,
        'nama_kelas' => "{$tingkat} {$lokal}",
    ],
    [
        'tingkat' => $tingkat,
    ]
);


                foreach ($siswaNamaList as $nama) {
                    Siswa::updateOrCreate([
                        'kelas_id' => $kelas->id,
                        'nama_siswa' => trim($nama),
                    ]);
                }
            }
        }

        // === SISWA TK ===
        $tkSiswaList = [
            'ABIZAR AL GIFAHRI', 'AIRIN PUTRI FERDIANDA', 'AISYAH QURATUL AININ', 'ALVINO RADIKA IRLI',
            'ARFAN ABDUL HAFIZ', 'ARSYLA ALIFIA DINANTA', 'ARUMI ZAKIYAH', 'ATTARAUF SADDAM',
            'AYESHA IZZATUNNISA FAUZANA', 'AZZURA SAKELLA', 'DIRLAN EFRYAND', 'DZAKIRA AFTANI VETNO',
            'ERINKA AULIA SHAREEN', 'FATIMAH AZ ZAHRA', 'GAVIN FARESTA PURNAMA', 'GAVIN RAYYAN MUBARAK',
            'GHANI ARZIKI', 'HABIB RENANDA PRANAJA', 'HURRIYAH SHANUM H.', 'JEVO ELMER BATARA',
            'KAIF AKIO', 'KEYSHA HELDIRA', 'M GEZA VISHAKA AUMEL', 'MALPIN ARIAN RAMADHAN',
            'MUHAMMAD HABIB', 'MUHAMMAD JUNIOR AKBAR', 'MUHAMMAD SYAFIQ ALAMSYAH', 'MUHAMMAD WAFI',
            'MUHAMMAD YAHYA SALIM', 'NABILA HASNA AMIRA', 'NABILA RAMADHANI PUTRI', 'NAURA AZ ZAHRA',
            'NAURA ZALDI ANANDA', 'NAYSHIWA AMINA ILAHI', 'RAFA ADRIAN PRATAMA', 'RAFA NOVRYANTO',
            'RAFATAR APRILLIO', 'RAFIZKY GHIADRA ATHALA', 'RAJA SHIDQI ARSALAN', 'RAYYAN HIBRATUL ADZANI',
            'SHAKILA NUR FIKRAH', 'SHIRLY ALNAIRA', 'SIDIQ FATHAN ASNAWI', 'SYAHIRA FEBRIANA PUTRI',
            'VIONA IORI', 'ZAIDAN FAEYZA',
        ];

        foreach ($tkSiswaList as $nama) {
            Siswa::updateOrCreate([
                'kelas_id' => $tkKelas->id,
                'nama_siswa' => trim($nama),
            ]);
        }
    }
}
