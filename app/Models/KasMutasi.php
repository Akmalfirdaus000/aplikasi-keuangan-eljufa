<?php
// app/Models/KasMutasi.php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class KasMutasi extends Model {
  protected $fillable = [
    'tanggal','kategori_id','tipe','ref_type','ref_id','deskripsi','debit','kredit','saldo_setelah','user_id'
  ];
  protected $casts = [
    'tanggal' => 'date',
    'debit' => 'decimal:2',
    'kredit' => 'decimal:2',
    'saldo_setelah' => 'decimal:2',
  ];
  public function user(){ return $this->belongsTo(User::class); }
}


