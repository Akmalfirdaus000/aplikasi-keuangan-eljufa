<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    use HasFactory;

    protected $fillable = ['tagihan_id', 'tanggal_bayar', 'nominal', 'metode', 'keterangan'];

    protected $attributes = [
        'metode' => 'Tunai',
    ];

    // Relasi: Pembayaran milik tagihan
    public function tagihan()
    {
        return $this->belongsTo(Tagihan::class);
    }

    // Relasi: Pembayaran milik siswa lewat tagihan
    public function siswa()
    {
        return $this->hasOneThrough(
            Siswa::class,
            Tagihan::class,
            'id',        // id di Tagihan
            'id',        // id di Siswa
            'tagihan_id',// tagihan_id di Pembayaran
            'siswa_id'   // siswa_id di Tagihan
        );
    }
}
