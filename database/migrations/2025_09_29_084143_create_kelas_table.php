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
    Schema::create('kelas', function (Blueprint $table) {
    $table->id();
    $table->string('nama_kelas');
    $table->foreignId('sekolah_id')->constrained('sekolahs')->onDelete('cascade');
    $table->enum('tingkat', ['TK', '1', '2', '3', '4', '5', '6']); // <- tambahkan 'TK'
              $table->string('lokal', 100)->nullable();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};
