<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
     Schema::create('tagihans', function (Blueprint $table) {
    $table->id();
    $table->foreignId('siswa_id')->constrained('siswas')->onDelete('cascade');
    $table->foreignId('kelas_id')->constrained('kelas')->onDelete('cascade');
    $table->foreignId('kategori_id')->constrained('kategoris')->onDelete('cascade');
    $table->string('deskripsi')->nullable();
    $table->bigInteger('total_tagihan');
    $table->bigInteger('sisa_tagihan'); // <-- tambahkan ini
    $table->enum('status', ['belum_lunas', 'lunas'])->default('belum_lunas');
    $table->timestamps();
});


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tagihans');
    }
};
