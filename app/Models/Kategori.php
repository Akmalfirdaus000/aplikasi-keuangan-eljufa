<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    use HasFactory;

    protected $fillable = ['nama_kategori', 'sifat'];

    // Relasi: Kategori punya banyak tagihan
    public function tagihans()
    {
        return $this->hasMany(Tagihan::class);
    }
}
