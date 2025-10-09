"use client"

import { useEffect, useMemo, useState } from "react"
import { usePage, router, Head } from "@inertiajs/react"
import { route } from "ziggy-js"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function PengeluaranIndex() {
  const { rows = [], meta = {}, filters = {}, kategoriOptions = [], summary = {}, errors = {} } = usePage().props

  // ===== Helpers =====
  const rupiah = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
      .format(Number(n || 0))

  const kasPerKategori = summary?.kas_per_kategori || [] // [{id, nama, saldo, income_total, out_total}]
  const incomeTotal   = Number(summary?.income_total || 0)
  const incomeMonth   = Number(summary?.income_month || 0)
  const outTotal      = Number(summary?.out_total || 0)
  const outMonth      = Number(summary?.out_month || 0)

  // ===== Form state =====
  const [open, setOpen] = useState(false)
  const [tanggal, setTanggal] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [nominalNum, setNominalNum] = useState(0)      // angka murni untuk submit
  const [nominalStr, setNominalStr] = useState("")     // tampilan rupiah saat ketik
  const [kategoriKasId, setKategoriKasId] = useState("")

  const [metode, setMetode] = useState("Tunai")

  // default pilih kategori pertama kalau ada
  useEffect(() => {
    if (!kategoriKasId && kasPerKategori.length) {
      setKategoriKasId(String(kasPerKategori[0].id))
    }
  }, [kasPerKategori, kategoriKasId])

  // saldo kategori terpilih
  const saldoKategori = useMemo(() => {
    const found = kasPerKategori.find(k => String(k.id) === String(kategoriKasId))
    return Number(found?.saldo || 0)
  }, [kasPerKategori, kategoriKasId])

  // input masker rupiah
  const onChangeNominal = (e) => {
    const raw = e.target.value || ""
    // ambil digit saja
    const digits = raw.replace(/\D/g, "")
    const val = digits ? parseInt(digits, 10) : 0
    setNominalNum(val)
    // tampilkan 1.000 dst (tanpa "Rp")
    setNominalStr(
      val > 0 ? val.toLocaleString("id-ID") : ""
    )
  }

  const canSubmit = saldoKategori > 0 && nominalNum > 0 && nominalNum <= saldoKategori && kategoriKasId

  const handleSubmit = (e) => {
    e.preventDefault()
    router.post(
      route("pengeluaran.store"),
      {
        tanggal,
        deskripsi,
        nominal: nominalNum,           // kirim angka murni
        kategori_id: kategoriKasId,    // -> wajib kirim ke backend untuk kurangi saldo kategori
        metode,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setTanggal("")
          setDeskripsi("")
          setNominalNum(0)
          setNominalStr("")
          setMetode("Tunai")
        },
      }
    )
  }

  return (
    <AuthenticatedLayout>
      <Head title="Pengeluaran" />
      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* ====== Ringkasan Uang Masuk vs Uang Keluar (Grid 2) ====== */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* Uang Masuk (dari Pembayaran / kas per kategori dijumlahkan) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Uang Masuk (Pembayaran)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Semua</p>
                <p className="text-lg font-semibold">{rupiah(incomeTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bulan Ini</p>
                <p className="text-lg font-semibold">{rupiah(incomeMonth)}</p>
              </div>

              {/* breakdown saldo per kategori (opsional, tampilkan kalau ada) */}
              <div className="col-span-2">
                <div className="text-sm font-medium mb-1">Saldo per Kategori</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {kasPerKategori.length ? kasPerKategori.map(k => (
                    <div key={k.id} className="rounded border p-2 text-sm flex items-center justify-between">
                      <span className="truncate">{k.nama}</span>
                      <span className="font-semibold">{rupiah(k.saldo)}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-muted-foreground">Belum ada kategori kas</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uang Keluar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Uang Keluar (Pengeluaran)</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    {/* tombol tambah akan nonaktif kalau belum ada saldo kategori terpilih */}
                    <Button variant="outline" disabled={saldoKategori <= 0 || !kategoriKasId}>+ Tambah</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Pengeluaran</DialogTitle>
                    </DialogHeader>

                    {/* Info kategori & saldo berjalan */}
                    <div className="rounded-md border p-3 mb-3 space-y-2 text-sm">
                      <div>
                        <Label className="mb-1 block">Kategori Kas</Label>
                        <Select value={kategoriKasId} onValueChange={setKategoriKasId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori kas" />
                          </SelectTrigger>
                          <SelectContent>
                            {kasPerKategori.map(k => (
                              <SelectItem key={k.id} value={String(k.id)}>
                                {k.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-between">
                        <span>Saldo kategori saat ini</span>
                        <span className={`font-semibold ${saldoKategori > 0 ? "text-green-600" : "text-red-600"}`}>
                          {rupiah(saldoKategori)}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label>Tanggal</Label>
                        <Input type="date" value={tanggal} onChange={(e)=>setTanggal(e.target.value)} required />
                      </div>

                      <div>
                        <Label>Deskripsi</Label>
                        <Input value={deskripsi} onChange={(e)=>setDeskripsi(e.target.value)} placeholder="Misal: Beli ATK" />
                      </div>

                      <div>
                        <Label>Nominal</Label>
                        <Input
                          inputMode="numeric"
                          value={nominalStr}
                          onChange={onChangeNominal}
                          placeholder="0"
                          required
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {nominalNum > 0 ? `= ${rupiah(nominalNum)}` : "Masukkan jumlah pengeluaran"}
                        </p>
                        {saldoKategori <= 0 && (
                          <p className="text-xs text-red-600 mt-1">Saldo kategori 0. Tambahkan pembayaran terlebih dahulu.</p>
                        )}
                        {nominalNum > saldoKategori && (
                          <p className="text-xs text-red-600 mt-1">Nominal melebihi saldo kategori.</p>
                        )}
                        {errors?.nominal && (
                          <p className="text-xs text-red-600 mt-1">{errors.nominal}</p>
                        )}
                      </div>

                      <div>
                        <Label>Metode</Label>
                        <Select value={metode} onValueChange={setMetode}>
                          <SelectTrigger><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tunai">Tunai</SelectItem>
                            <SelectItem value="Transfer">Transfer</SelectItem>
                            <SelectItem value="Bank">Bank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" disabled={!canSubmit}>Simpan</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Semua</p>
                <p className="text-lg font-semibold">{rupiah(outTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bulan Ini</p>
                <p className="text-lg font-semibold">{rupiah(outMonth)}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ====== Tabel Pengeluaran ====== */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Kategori Kas</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? rows.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell>{i+1}</TableCell>
                    <TableCell>{r.tanggal}</TableCell>
                    <TableCell>{r.deskripsi}</TableCell>
                    <TableCell>{r.kategori_nama || r.kategori || "-"}</TableCell>
                    <TableCell>{r.metode}</TableCell>
                    <TableCell className="text-right">{rupiah(r.nominal)}</TableCell>
                    <TableCell>{r.user?.name}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">Belum ada data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </AuthenticatedLayout>
  )
}
