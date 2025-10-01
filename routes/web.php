<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SekolahController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\KelasController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\TagihanController;
use App\Http\Controllers\PembayaranController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    /*
    |--------------------------------------------------------------------------
    | Master Data Sekolah
    |--------------------------------------------------------------------------
    */
    Route::get('/sekolahs', [SekolahController::class, 'index'])->name('sekolahs.index');
    Route::get('/sekolahs/create', [SekolahController::class, 'create'])->name('sekolahs.create');
    Route::post('/sekolahs', [SekolahController::class, 'store'])->name('sekolahs.store');
    Route::get('/sekolahs/{id}', [SekolahController::class, 'show'])->name('sekolahs.show');
    Route::get('/sekolahs/{id}/edit', [SekolahController::class, 'edit'])->name('sekolahs.edit');
    Route::put('/sekolahs/{id}', [SekolahController::class, 'update'])->name('sekolahs.update');
    Route::delete('/sekolahs/{id}', [SekolahController::class, 'destroy'])->name('sekolahs.destroy');

    /*
    |--------------------------------------------------------------------------
    | Master Data Siswa
    |--------------------------------------------------------------------------
    */
    Route::get('/siswas', [SiswaController::class, 'index'])->name('siswas.index');
    Route::get('/siswas/create', [SiswaController::class, 'create'])->name('siswas.create');
    Route::post('/siswas', [SiswaController::class, 'store'])->name('siswas.store');
    Route::get('/siswas/{id}', [SiswaController::class, 'show'])->name('siswa.show');
    Route::get('/siswas/{id}/edit', [SiswaController::class, 'edit'])->name('siswas.edit');
    Route::put('/siswas/{id}', [SiswaController::class, 'update'])->name('siswas.update');
    Route::delete('/siswas/{id}', [SiswaController::class, 'destroy'])->name('siswas.destroy');

    /*
    |--------------------------------------------------------------------------
    | Master Data Kelas
    |--------------------------------------------------------------------------
    */
    Route::get('/kelas', [KelasController::class, 'index'])->name('kelas.index');
    Route::get('/kelas/create', [KelasController::class, 'create'])->name('kelas.create');
    Route::post('/kelas', [KelasController::class, 'store'])->name('kelas.store');
    Route::get('/kelas/{id}', [KelasController::class, 'show'])->name('kelas.show');
    Route::get('/kelas/{id}/edit', [KelasController::class, 'edit'])->name('kelas.edit');
    Route::put('/kelas/{id}', [KelasController::class, 'update'])->name('kelas.update');
    Route::delete('/kelas/{id}', [KelasController::class, 'destroy'])->name('kelas.destroy');

    /*
    |--------------------------------------------------------------------------
    | Master Data Kategori
    |--------------------------------------------------------------------------
    */
    Route::get('/kategoris', [KategoriController::class, 'index'])->name('kategoris.index');
    Route::get('/kategoris/create', [KategoriController::class, 'create'])->name('kategoris.create');
    Route::post('/kategoris', [KategoriController::class, 'store'])->name('kategoris.store');
    Route::get('/kategoris/{id}', [KategoriController::class, 'show'])->name('kategoris.show');
    Route::get('/kategoris/{id}/edit', [KategoriController::class, 'edit'])->name('kategoris.edit');
    Route::put('/kategoris/{id}', [KategoriController::class, 'update'])->name('kategoris.update');
    Route::delete('/kategoris/{id}', [KategoriController::class, 'destroy'])->name('kategoris.destroy');

    /*
    |--------------------------------------------------------------------------
    | Transaksi Tagihan
    |--------------------------------------------------------------------------
    */
    Route::get('/tagihans', [TagihanController::class, 'index'])->name('tagihans.index');
    Route::get('/tagihans/create', [TagihanController::class, 'create'])->name('tagihans.create');
    Route::post('/tagihans', [TagihanController::class, 'store'])->name('tagihans.store');
    Route::get('/tagihans/{id}', [TagihanController::class, 'show'])->name('tagihans.show');
    Route::get('/tagihans/{id}/edit', [TagihanController::class, 'edit'])->name('tagihans.edit');
    Route::put('/tagihans/{id}', [TagihanController::class, 'update'])->name('tagihans.update');
    Route::delete('/tagihans/{id}', [TagihanController::class, 'destroy'])->name('tagihans.destroy');

    // Khusus TK & SD
    Route::get('/tagihans/tk', [TagihanController::class, 'indexTK'])->name('tagihans.tk');
    Route::get('/tagihans/sd', [TagihanController::class, 'indexSD'])->name('tagihans.sd');

    /*
    |--------------------------------------------------------------------------
    | Transaksi Pembayaran
    |--------------------------------------------------------------------------
    */
    Route::get('/pembayarans', [PembayaranController::class, 'index'])->name('pembayarans.index');
    Route::get('/pembayarans/create', [PembayaranController::class, 'create'])->name('pembayarans.create');
    Route::post('/pembayarans', [PembayaranController::class, 'store'])->name('pembayarans.store');
    Route::get('/pembayarans/{id}', [PembayaranController::class, 'show'])->name('pembayarans.show');
    Route::get('/pembayarans/{id}/edit', [PembayaranController::class, 'edit'])->name('pembayarans.edit');
    Route::put('/pembayarans/{id}', [PembayaranController::class, 'update'])->name('pembayarans.update');
    Route::delete('/pembayarans/{id}', [PembayaranController::class, 'destroy'])->name('pembayarans.destroy');

    // Tambahan post khusus (kalau perlu)
    Route::post('/pembayaran', [PembayaranController::class, 'store'])->name('pembayaran.store');
});

require __DIR__.'/auth.php';
