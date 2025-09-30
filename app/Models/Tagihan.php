<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    use HasFactory;

    protected $fillable = [
        'siswa_id', 'kelas_id', 'kategori_id', 'deskripsi', 'total_tagihan', 'sisa_tagihan', 'status'
    ];

    // Relasi: Tagihan milik siswa
    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }

    // Relasi: Tagihan milik kelas
    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    // Relasi: Tagihan milik kategori
    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    // Relasi: Tagihan punya banyak pembayaran
    public function pembayarans()
    {
        return $this->hasMany(Pembayaran::class);
    }
}
