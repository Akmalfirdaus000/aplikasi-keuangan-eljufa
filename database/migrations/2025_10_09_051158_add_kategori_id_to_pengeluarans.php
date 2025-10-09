<?php
// database/migrations/2025_10_09_000001_add_kategori_id_to_pengeluarans.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::table('pengeluarans', function (Blueprint $t) {
      // kalau kolom 'kategori' (string) lama masih ada, BIARKAN dulu agar data lama aman
      $t->unsignedBigInteger('kategori_id')->nullable()->after('nominal');
      $t->foreign('kategori_id')->references('id')->on('kategoris')->nullOnDelete();
    });
  }

  public function down(): void {
    Schema::table('pengeluarans', function (Blueprint $t) {
      if (Schema::hasColumn('pengeluarans','kategori_id')) {
        $t->dropForeign(['kategori_id']);
        $t->dropColumn('kategori_id');
      }
    });
  }
};
