<?php
// database/migrations/2025_01_01_000000_create_kas_per_kategori_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /**
         * Tabel mutasi kas per-kategori
         * - Semua pergerakan uang (masuk/keluar/adjust) dicatat di sini
         * - saldo_setelah = saldo kategori SETELAH mutasi ini
         */
        Schema::create('kas_mutasis', function (Blueprint $t) {
            $t->id();

            // Lebih presisi daripada DATE
            $t->dateTime('tanggal');

            // Standarisasi nilai tipe
            // gunakan enum jika DB mendukung; string tetap OK
            $t->enum('tipe', ['debit','kredit','adjustment']);

            // Wajib terkait kategori (jika kamu ingin “global adjustment”, jadikan nullable)
            $t->foreignId('kategori_id')
              ->constrained('kategoris')
              ->cascadeOnDelete();

            // Referensi sumber mutasi (opsional) -> pembayaran / pengeluaran / dll
            $t->string('ref_type')->nullable();     // 'pembayaran' | 'pengeluaran' | 'penyesuaian' | dll
            $t->unsignedBigInteger('ref_id')->nullable();

            $t->string('keterangan')->nullable();
            $t->string('metode', 50)->nullable();   // Tunai/Transfer/Bank/dll

            // Nominal + running balance per kategori
            $t->decimal('debit', 18, 2)->default(0);     // uang masuk
            $t->decimal('kredit', 18, 2)->default(0);    // uang keluar
            $t->decimal('saldo_sebelum', 18, 2)->default(0);
            $t->decimal('saldo_setelah', 18, 2)->default(0);

            // Audit
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $t->timestamps();

            // Indexing
            $t->index(['tanggal']);
            $t->index(['kategori_id','tanggal']);
            $t->index(['ref_type','ref_id']);
        });

        /**
         * Tabel saldo kas per-kategori
         * - Satu baris per kategori
         * - Dibuat dinamis saat pertama kali ada uang masuk kategori tsb
         */
        Schema::create('kas_saldos', function (Blueprint $t) {
            $t->id();

            $t->foreignId('kategori_id')
              ->unique()
              ->constrained('kategoris')
              ->cascadeOnDelete();

            $t->decimal('saldo', 18, 2)->default(0); // saldo terkini utk kategori ini
            $t->timestamps();
        });

        // Catatan:
        // Tidak ada seeding saldo awal. Baris kas_saldos dibuat dinamis saat ada uang masuk
        // (lihat logic di controller Pembayaran yang akan create jika belum ada).
    }

    public function down(): void
    {
        // Lepas FK yang menempel elegan
        Schema::table('kas_saldos', function (Blueprint $t) {
            if (Schema::hasColumn('kas_saldos', 'kategori_id')) {
                $t->dropConstrainedForeignId('kategori_id');
            }
        });

        Schema::table('kas_mutasis', function (Blueprint $t) {
            if (Schema::hasColumn('kas_mutasis', 'kategori_id')) {
                $t->dropConstrainedForeignId('kategori_id');
            }
            if (Schema::hasColumn('kas_mutasis', 'user_id')) {
                $t->dropConstrainedForeignId('user_id');
            }
        });

        Schema::dropIfExists('kas_saldos');
        Schema::dropIfExists('kas_mutasis');
    }
};
