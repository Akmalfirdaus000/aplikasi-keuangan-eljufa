<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    use HasFactory;

    protected $fillable = ['tagihan_id', 'tanggal_bayar', 'nominal', 'metode', 'keterangan'];

    // Relasi: Pembayaran milik tagihan
    public function tagihan()
    {
        return $this->belongsTo(Tagihan::class);
    }
}
