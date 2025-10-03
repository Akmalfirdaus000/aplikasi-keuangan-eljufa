<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    use HasFactory;

    protected $fillable = ['kelas_id', 'nama_siswa'];

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function tagihans()
    {
        return $this->hasMany(Tagihan::class);
    }

    // Shortcut: ambil nama sekolah langsung dari siswa
    public function getSekolahAttribute()
    {
        return $this->kelas?->sekolah?->nama_sekolah;
    }

    // Shortcut: ambil lokal dari kelas
    public function getLokalAttribute()
    {
        return $this->kelas?->lokal;
    }
}
