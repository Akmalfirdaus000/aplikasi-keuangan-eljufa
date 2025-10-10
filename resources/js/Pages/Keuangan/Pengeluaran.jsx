"use client"

import { useEffect, useMemo, useState } from "react"
import { usePage, router, Head } from "@inertiajs/react"
import { route } from "ziggy-js"

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
import {
  ArrowUpRight, ArrowDownRight, Plus, Wallet2, Calendar, ReceiptText,
  Banknote, CreditCard, Search, WalletMinimal, Filter, Inbox
} from "lucide-react"
import { cn } from "@/lib/utils"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"

export default function PengeluaranPage() {
  // === Ambil data real dari server
  const {
    rows = [],                      // daftar pengeluaran
    summary = {},                   // ringkasan & saldo per kategori
    errors = {},
  } = usePage().props

  const kasPerKategori = summary?.kas_per_kategori || [] // [{id, nama, saldo, income_total, out_total}]
  const incomeTotal    = Number(summary?.income_total || 0)
  const incomeMonth    = Number(summary?.income_month || 0)
  const outTotal       = Number(summary?.out_total || 0)
  const outMonth       = Number(summary?.out_month || 0)

  // === Form Tambah Pengeluaran
  const [open, setOpen] = useState(false)
  const [tanggal, setTanggal] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [nominalNum, setNominalNum] = useState(0)     // angka murni untuk submit
  const [nominalStr, setNominalStr] = useState("")    // tampilan "1.000"
  const [kategoriKasId, setKategoriKasId] = useState("")
  const [metode, setMetode] = useState("Tunai")

  // pilih kategori default ketika data datang
  useEffect(() => {
    if (!kategoriKasId && kasPerKategori.length) {
      setKategoriKasId(String(kasPerKategori[0].id))
    }
  }, [kasPerKategori, kategoriKasId])

  const saldoKategori = useMemo(() => {
    const found = kasPerKategori.find(k => String(k.id) === String(kategoriKasId))
    return Number(found?.saldo || 0)
  }, [kasPerKategori, kategoriKasId])

  // masker rupiah (tanpa "Rp")
  const onChangeNominal = (e) => {
    const digits = (e.target.value || "").replace(/\D/g, "")
    const val = digits ? parseInt(digits, 10) : 0
    setNominalNum(val)
    setNominalStr(val > 0 ? val.toLocaleString("id-ID") : "")
  }

  const canSubmit = saldoKategori > 0 && nominalNum > 0 && nominalNum <= saldoKategori && !!kategoriKasId && !!tanggal

  const submit = (e) => {
    e.preventDefault()
    if (!canSubmit) return

    router.post(
      route("pengeluaran.store"),
      {
        tanggal,
        deskripsi,
        nominal: nominalNum,        // kirim angka murni
        kategori_id: kategoriKasId, // penting: untuk saldo per kategori
        metode,
      },
      {
        preserveScroll: true,
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

  // === Filter & Cari (client-side dari data server)
  const [q, setQ] = useState("")
  const [filterKategori, setFilterKategori] = useState("all")
  const [filterMetode, setFilterMetode] = useState("all")

  const filteredRows = useMemo(() => {
    const ql = q.trim().toLowerCase()
    return (rows || []).filter(r => {
      const matchText =
        !ql ||
        (r.deskripsi || "").toLowerCase().includes(ql) ||
        (r.kategori_nama || r.kategori || "").toLowerCase().includes(ql) ||
        (r.user?.name || "").toLowerCase().includes(ql)
      const matchKategori = filterKategori === "all" || String(r.kategori_id) === String(filterKategori)
      const matchMetode = filterMetode === "all" || (r.metode || "") === filterMetode
      return matchText && matchKategori && matchMetode
    })
  }, [rows, q, filterKategori, filterMetode])

  const sumFiltered = useMemo(
    () => filteredRows.reduce((a, r) => a + Number(r.nominal || 0), 0),
    [filteredRows]
  )

  return (
    <AuthenticatedLayout>
      <Head title="Pengeluaran"/>
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-3">
              <Wallet2 className="h-7 w-7 text-primary" />
              Pengeluaran
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola pengeluaran, lihat ringkasan, dan catat transaksi baru dengan cepat.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm" disabled={!kasPerKategori.length}>
                <Plus className="h-4 w-4" />
                Tambah Pengeluaran
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-primary" />
                  Tambah Pengeluaran
                </DialogTitle>
              </DialogHeader>

              {/* Kategori & saldo berjalan */}
              <div className="rounded-md border p-3 mb-3 space-y-2 text-sm bg-card">
                <div>
                  <Label className="mb-1 block">Kategori Kas</Label>
                  <Select value={kategoriKasId} onValueChange={setKategoriKasId}>
                    <SelectTrigger className="w-full">
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
                <div className="flex items-center justify-between">
                  <span>Saldo kategori saat ini</span>
                  <span className={cn("font-semibold", saldoKategori > 0 ? "text-primary" : "text-destructive")}>
                    {rupiah(saldoKategori)}
                  </span>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Tanggal
                    </Label>
                    <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="mb-1 flex items-center gap-2">
                      <ReceiptText className="h-4 w-4 text-muted-foreground" />
                      Metode
                    </Label>
                    <Select value={metode} onValueChange={setMetode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tunai">Tunai</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                        <SelectItem value="Bank">Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-1 block">Deskripsi</Label>
                  <Input value={deskripsi} onChange={e => setDeskripsi(e.target.value)} placeholder="Misal: Beli ATK" />
                </div>

                <div>
                  <Label className="mb-1 block">Nominal</Label>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                      <Banknote className="h-4 w-4" />
                    </div>
                    <Input
                      inputMode="numeric"
                      value={nominalStr}
                      onChange={onChangeNominal}
                      placeholder="0"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {nominalNum > 0 ? `= ${rupiah(nominalNum)}` : "Masukkan jumlah pengeluaran"}
                  </p>
                  {saldoKategori <= 0 && (
                    <p className="text-xs text-destructive mt-1">Saldo kategori 0. Tambahkan pemasukan terlebih dahulu.</p>
                  )}
                  {nominalNum > saldoKategori && (
                    <p className="text-xs text-destructive mt-1">Nominal melebihi saldo kategori.</p>
                  )}
                  {errors?.nominal && <p className="text-xs text-destructive mt-1">{errors.nominal}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={!canSubmit}>Simpan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Ringkasan Grid 2 */}
        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                  Uang Masuk (Pembayaran)
                </CardTitle>
                <div className="inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                  <WalletMinimal className="h-3.5 w-3.5" /> {kasPerKategori.length} kategori
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <SummaryBox label="Total Semua" value={rupiah(incomeTotal)} tone="accent" Icon={ArrowUpRight} />
              <SummaryBox label="Bulan Ini" value={rupiah(incomeMonth)} tone="accent" Icon={ArrowUpRight} />
              <div className="col-span-2">
                <div className="text-sm font-medium mb-2">Saldo per Kategori</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {kasPerKategori.length ? kasPerKategori.map(k => (
                    <div key={k.id} className="rounded-md border p-3 text-sm flex items-center justify-between">
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-primary" />
                Uang Keluar (Pengeluaran)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <SummaryBox label="Total Semua" value={rupiah(outTotal)} tone="secondary" Icon={ArrowDownRight} />
              <SummaryBox label="Bulan Ini" value={rupiah(outMonth)} tone="secondary" Icon={ArrowDownRight} />
            </CardContent>
          </Card>
        </section>

        {/* Toolbar pencarian & filter */}
        <section className="sticky top-0 z-20 rounded-md border p-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Cari deskripsi, kategori, atau user..." value={q} onChange={e => setQ(e.target.value)} />
              </div>
              <div className="hidden md:block text-xs text-muted-foreground">{filteredRows.length} hasil</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterKategori} onValueChange={setFilterKategori}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {kasPerKategori.map(k => (
                      <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button size="sm" variant={filterMetode === "all" ? "default" : "secondary"} onClick={() => setFilterMetode("all")}>
                  Semua
                </Button>
                <Button size="sm" variant={filterMetode === "Tunai" ? "default" : "secondary"} onClick={() => setFilterMetode("Tunai")} className="gap-1.5">
                  <Banknote className="h-3.5 w-3.5" /> Tunai
                </Button>
                <Button size="sm" variant={filterMetode === "Transfer" ? "default" : "secondary"} onClick={() => setFilterMetode("Transfer")} className="gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" /> Transfer
                </Button>
                <Button size="sm" variant={filterMetode === "Bank" ? "default" : "secondary"} onClick={() => setFilterMetode("Bank")} className="gap-1.5">
                  <WalletMinimal className="h-3.5 w-3.5" /> Bank
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tabel pengeluaran */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-primary" />
              Daftar Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10 bg-card">#</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">Tanggal</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">Deskripsi</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">Kategori Kas</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">Metode</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card text-right">Nominal</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length ? (
                  filteredRows.map((r, i) => (
                    <TableRow key={r.id} className="hover:bg-muted/50 odd:bg-muted/30">
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{r.tanggal}</TableCell>
                      <TableCell className="max-w-[280px]">
                        <span className="line-clamp-2 text-pretty">{r.deskripsi}</span>
                      </TableCell>
                      <TableCell>{r.kategori_nama || r.kategori || "-"}</TableCell>
                      <TableCell><MethodBadge metode={r.metode} /></TableCell>
                      <TableCell className="text-right font-medium">{rupiah(r.nominal)}</TableCell>
                      <TableCell>{r.user?.name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                          <Inbox className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">Belum ada data</p>
                        <p className="text-xs text-muted-foreground">Coba ubah pencarian atau tambah pengeluaran baru.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {filteredRows.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-right text-sm font-medium">Total ditampilkan</TableCell>
                    <TableCell className="text-right font-semibold">{rupiah(sumFiltered)}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Tips: Gunakan pencarian dan filter kategori untuk menemukan transaksi dengan cepat.
        </p>
      </main>
    </div>
    </AuthenticatedLayout>

  )
}

// === Small components
function SummaryBox({ label, value, Icon, tone = "accent" }) {
  const toneCls = tone === "secondary" ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", toneCls)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}

function MethodBadge({ metode }) {
  const map = {
    Tunai:   { icon: Banknote,      label: "Tunai",    cls: "bg-secondary text-secondary-foreground" },
    Transfer:{ icon: CreditCard,    label: "Transfer", cls: "bg-accent text-accent-foreground" },
    Bank:    { icon: WalletMinimal, label: "Bank",     cls: "bg-muted text-muted-foreground" },
  }
  const M = map[metode] || map.Tunai
  const Icon = M.icon
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs", M.cls)}>
      <Icon className="h-3.5 w-3.5" />
      {M.label}
    </span>
  )
}

function rupiah(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    .format(Number(n || 0))
}
