<?php
// app/Models/KasSaldo.php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class KasSaldo extends Model {
  protected $fillable = ['saldo ', 'kategori_id'];
  protected $casts = ['saldo' => 'decimal:2'];
}