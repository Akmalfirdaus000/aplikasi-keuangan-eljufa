<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sekolah extends Model
{
    use HasFactory;

    protected $fillable = ['nama_sekolah'];

    // Relasi: Sekolah punya banyak kelas
    public function kelas()
    {
        return $this->hasMany(Kelas::class);
    }
}
