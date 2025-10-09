<?php
// app/Services/KasLedger.php
namespace App\Services;

use App\Models\KasMutasi;
use App\Models\KasSaldo;
use Illuminate\Support\Facades\DB;

class KasLedger
{
    /** Catat mutasi & update saldo. Wajib dipanggil dalam DB::transaction. */
    public static function catat(array $data): KasMutasi
    {
        // $data: ['tanggal','tipe','ref_type','ref_id','deskripsi','debit','kredit','user_id']
        return DB::transaction(function () use ($data) {
            // Lock row saldo tunggal untuk hindari race condition
            $saldoRow = KasSaldo::lockForUpdate()->first();
            if (!$saldoRow) {
                $saldoRow = KasSaldo::create(['saldo' => 0]);
            }

            $debit  = (float) ($data['debit']  ?? 0);
            $kredit = (float) ($data['kredit'] ?? 0);

            // Validasi tidak boleh minus
            $saldoBaru = (float) $saldoRow->saldo + $debit - $kredit;
            if ($saldoBaru < 0) {
                throw new \RuntimeException('Saldo kas tidak mencukupi.');
            }

            $mutasi = KasMutasi::create([
                'tanggal'       => $data['tanggal'] ?? now()->toDateString(),
                'tipe'          => $data['tipe'] ?? ($debit > 0 ? 'masuk' : 'keluar'),
                'ref_type'      => $data['ref_type'] ?? null,
                'ref_id'        => $data['ref_id'] ?? null,
                'deskripsi'     => $data['deskripsi'] ?? null,
                'debit'         => $debit,
                'kredit'        => $kredit,
                'saldo_setelah' => $saldoBaru,
                'user_id'       => $data['user_id'] ?? auth()->id(),
            ]);

            $saldoRow->update(['saldo' => $saldoBaru]);

            return $mutasi;
        });
    }

    /** Rebuild ulang dari data sumber (pembayaran & pengeluaran) bila perlu. */
    public static function rebuild(callable $sourceGenerator): void
    {
        DB::transaction(function () use ($sourceGenerator) {
            // hapus ledger & reset saldo
            DB::table('kas_mutasis')->delete();
            $saldoRow = KasSaldo::lockForUpdate()->first();
            $saldoRow->update(['saldo' => 0]);

            // $sourceGenerator harus yield item: ['tanggal','tipe','ref_type','ref_id','deskripsi','debit','kredit','user_id']
            foreach ($sourceGenerator() as $item) {
                self::catat($item);
            }
        });
    }
}
