<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    use HasFactory;

    protected $fillable = ['kelas_id', 'nama_siswa'];

    // Relasi: Siswa milik kelas
    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    // Relasi: Siswa punya banyak tagihan
    public function tagihans()
    {
        return $this->hasMany(Tagihan::class);
    }
}
