<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'tanggal',
        'deskripsi',
        'nominal',
        // 'kategori',
        'kategori_id',
        'metode',
        'user_id',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'nominal' => 'decimal:2',
    ];

    // Relasi opsional ke user pencatat
    public function user()
    {
        return $this->belongsTo(User::class);
    }
     public function kategori()
    {
        return $this->belongsTo(\App\Models\Kategori::class, 'kategori_id');
    }
}
