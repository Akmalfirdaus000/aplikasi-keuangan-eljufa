<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    use HasFactory;

    protected $fillable = ['nama_kelas', 'sekolah_id', 'tingkat', 'lokal'];

    // Relasi: Kelas milik sekolah
    public function sekolah()
    {
        return $this->belongsTo(Sekolah::class);
    }

    // Relasi: Kelas punya banyak siswa
    public function siswas()
    {
        return $this->hasMany(Siswa::class);
    }

    // Relasi: Kelas punya banyak tagihan
    public function tagihans()
    {
        return $this->hasMany(Tagihan::class);
    }
}
