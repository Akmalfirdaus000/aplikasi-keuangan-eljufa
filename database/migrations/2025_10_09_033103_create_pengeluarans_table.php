<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengeluarans', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->default(now()); // tanggal pengeluaran
            $table->string('deskripsi')->nullable(); // keterangan pengeluaran
            $table->decimal('nominal', 15, 2)->default(0); // jumlah keluar
            $table->string('kategori')->nullable(); // misal: gaji, operasional, ATK, dsb
            $table->string('metode')->nullable();   // tunai, transfer, dll
            $table->unsignedBigInteger('user_id')->nullable(); // siapa yang input
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengeluarans');
    }
};
