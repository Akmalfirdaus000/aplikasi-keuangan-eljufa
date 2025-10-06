"use client"

import { useMemo, useState, useEffect } from "react"
import { usePage, router } from "@inertiajs/react"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Button,
  Input,
  Badge,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  ScrollArea, // jangan lupa
} from "@/Components/ui"



const routeHelper = (name, params = {}) => {
  // Ziggy window.route fallback
  if (typeof window !== "undefined" && window.route) return window.route(name, params)
  return name
}

export default function LaporanIndex() {
  const { siswas = [], tagihans = [], pembayarans = [], kategoris = [], sekolahList = [] } = usePage().props

  // activeTab: 'per_siswa' | 'rekap' | 'tunggakan' | 'template'
  const [activeTab, setActiveTab] = useState("per_siswa")

  // common filters
  const [filterSekolah, setFilterSekolah] = useState("all")
  const [filterKelas, setFilterKelas] = useState("all")
  const [filterLokal, setFilterLokal] = useState("all")
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Per-siswa specific
  const [selectedKategori, setSelectedKategori] = useState("all")

  // Pagination states for long tables
  const [pagePerSiswa, setPagePerSiswa] = useState(1)
  const pageSizePerSiswa = 10
  const [pageTunggakan, setPageTunggakan] = useState(1)
  const pageSizeTunggakan = 10

  // Template report selection
  const [templateType, setTemplateType] = useState("spp") // 'spp' | 'sosial' | 'daftar_ulang' | 'buku_paket'

  // small helpers: derive distinct kelas & lokal from siswas
  const kelasOptions = useMemo(() => {
    const s = new Set(siswas.map((x) => x.kelas?.nama_kelas).filter(Boolean))
    return Array.from(s)
  }, [siswas])

  const lokalOptions = useMemo(() => {
    const s = new Set(siswas.map((x) => x.lokal?.nama_lokal).filter(Boolean))
    return Array.from(s)
  }, [siswas])

  // filter siswa table (used by per_siswa and tunggakan)
  const filteredSiswa = useMemo(() => {
    const q = search.trim().toLowerCase()
    return siswas.filter((s) => {
      if (filterSekolah !== "all" && (s.sekolah?.nama_sekolah || "") !== filterSekolah) return false
      if (filterKelas !== "all" && (s.kelas?.nama_kelas || "") !== filterKelas) return false
      if (filterLokal !== "all" && (s.lokal?.nama_lokal || "") !== filterLokal) return false

      if (!q) return true
      return (
        (s.nama_siswa || "").toLowerCase().includes(q) ||
        (s.kelas?.nama_kelas || "").toLowerCase().includes(q) ||
        String(s.id).includes(q)
      )
    })
  }, [siswas, filterSekolah, filterKelas, filterLokal, search])

  // map tagihan per siswa per kategori for quick lookup
  const siswaTagihanMap = useMemo(() => {
    const map = {}
    siswas.forEach((s) => {
      map[s.id] = {}
      kategoris.forEach((k) => {
        const t = tagihans.find((tg) => tg.siswa_id === s.id && tg.kategori_id === k.id)
        map[s.id][k.id] = t || null
      })
    })
    return map
  }, [siswas, tagihans, kategoris])

  // filter pembayarans by date range util
  const filterPaymentsByDate = (items) => {
    if (!dateFrom && !dateTo) return items
    const from = dateFrom ? new Date(dateFrom) : null
    const to = dateTo ? new Date(dateTo) : null
    return items.filter((p) => {
      const d = new Date(p.tanggal_bayar || p.created_at || p.tanggal || null)
      if (!d || isNaN(d)) return false
      if (from && d < from) return false
      if (to && d > to) return false
      return true
    })
  }

  // REKAP: compute totals per month or overall
  const rekapData = useMemo(() => {
    // We'll produce simple totals per month-year (YYYY-MM)
    const payments = filterPaymentsByDate(pembayarans || [])
    const totals = {}
    payments.forEach((p) => {
      const d = new Date(p.tanggal_bayar || p.created_at || p.tanggal || null)
      if (isNaN(d)) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      totals[key] = (totals[key] || 0) + Number(p.nominal || 0)
    })
    // convert to array sorted desc
    const arr = Object.keys(totals)
      .map((k) => ({ period: k, total: totals[k] }))
      .sort((a, b) => (a.period < b.period ? 1 : -1))
    return arr
  }, [pembayarans, dateFrom, dateTo])

  // TUNGGAKAN: list siswa who have tagihan with sisa>0 (respect filters)
  const tunggakanList = useMemo(() => {
    const rows = []
    filteredSiswa.forEach((s) => {
      const tList = (tagihans || []).filter((t) => t.siswa_id === s.id && Number(t.sisa_tagihan || 0) > 0)
      if (tList.length > 0) {
        rows.push({ siswa: s, tagihans: tList })
      }
    })
    return rows
  }, [filteredSiswa, tagihans])

  // helper format IDR
  const fmtID = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
      Number(n || 0),
    )

  // EXPORT handlers (placeholder) -> call backend route that returns file
  const handleExport = (type) => {
    // type: "per_siswa" | "rekap" | "tunggakan" | "template"
    // prepare params
    const params = {
      sekolah: filterSekolah !== "all" ? filterSekolah : undefined,
      kelas: filterKelas !== "all" ? filterKelas : undefined,
      lokal: filterLokal !== "all" ? filterLokal : undefined,
      kategori: selectedKategori !== "all" ? selectedKategori : undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
      q: search || undefined,
      format: "csv",
    }
    // call route (sesuaikan nama route server)
    const routeName =
      type === "per_siswa"
        ? "laporan.per_siswa.export"
        : type === "rekap"
          ? "laporan.rekap.export"
          : type === "tunggakan"
            ? "laporan.tunggakan.export"
            : "laporan.template.export"

    // Use router.visit to download (backend should return file response)
    try {
      router.visit(routeHelper(routeName, params), {
        method: "get",
        preserveScroll: true,
      })
    } catch (err) {
      console.error("Export failed", err)
    }
  }

  useEffect(() => {
    setPagePerSiswa(1)
    setPageTunggakan(1)
  }, [filterSekolah, filterKelas, filterLokal, search, dateFrom, dateTo, selectedKategori])

  const paginatedSiswa = useMemo(() => {
    const start = (pagePerSiswa - 1) * pageSizePerSiswa
    return filteredSiswa.slice(start, start + pageSizePerSiswa)
  }, [filteredSiswa, pagePerSiswa])

  const totalPagesPerSiswa = useMemo(
    () => Math.max(1, Math.ceil(filteredSiswa.length / pageSizePerSiswa)),
    [filteredSiswa],
  )

  const paginatedTunggakan = useMemo(() => {
    const start = (pageTunggakan - 1) * pageSizeTunggakan
    return tunggakanList.slice(start, start + pageSizeTunggakan)
  }, [tunggakanList, pageTunggakan])

  const totalPagesTunggakan = useMemo(
    () => Math.max(1, Math.ceil(tunggakanList.length / pageSizeTunggakan)),
    [tunggakanList],
  )

  const monthsSY = useMemo(
    () => [
      { label: "AGUS 25", m: 8, y: 2025 },
      { label: "SEP 25", m: 9, y: 2025 },
      { label: "OKT 25", m: 10, y: 2025 },
      { label: "NOV 25", m: 11, y: 2025 },
      { label: "DES 25", m: 12, y: 2025 },
      { label: "JAN 26", m: 1, y: 2026 },
      { label: "FEB 26", m: 2, y: 2026 },
      { label: "MAR 26", m: 3, y: 2026 },
      { label: "APR 26", m: 4, y: 2026 },
      { label: "MEI 26", m: 5, y: 2026 },
      { label: "JUN 26", m: 6, y: 2026 },
    ],
    [],
  )

  const matchKategoriIdByNameIncludes = (nameIncludes) => {
    const key = String(nameIncludes || "").toLowerCase()
    const k = (kategoris || []).find((x) => (x.nama_kategori || "").toLowerCase().includes(key))
    return k?.id
  }

  const getDate = (p) => new Date(p.tanggal_bayar || p.created_at || p.tanggal || "")

  const sumByMonthAndKategori = (siswaId, y, m, nameIncludes) => {
    const kid = matchKategoriIdByNameIncludes(nameIncludes)
    const payments = filterPaymentsByDate(pembayarans || []).filter((p) => {
      if (Number(p.siswa_id) !== Number(siswaId)) return false
      if (kid && Number(p.kategori_id) !== Number(kid)) return false
      const d = getDate(p)
      if (isNaN(d)) return false
      return d.getFullYear() === y && d.getMonth() + 1 === m
    })
    return payments.reduce((acc, p) => acc + Number(p.nominal || 0), 0)
  }

  const sumByKategoriList = (siswaId, kategoriNames = []) => {
    const kids = kategoriNames
      .map((n) => matchKategoriIdByNameIncludes(n))
      .filter(Boolean)
      .map(Number)
    const payments = filterPaymentsByDate(pembayarans || []).filter(
      (p) => Number(p.siswa_id) === Number(siswaId) && (kids.length ? kids.includes(Number(p.kategori_id)) : true),
    )
    return payments.reduce((acc, p) => acc + Number(p.nominal || 0), 0)
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Laporan</h1>
          <p className="text-sm text-muted-foreground">Lihat rekap, tagihan & riwayat pembayaran siswa</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <Button variant={activeTab === "per_siswa" ? "default" : "ghost"} onClick={() => setActiveTab("per_siswa")}>
            Per Siswa
          </Button>
          <Button variant={activeTab === "rekap" ? "default" : "ghost"} onClick={() => setActiveTab("rekap")}>
            Rekap Keuangan
          </Button>
          <Button variant={activeTab === "tunggakan" ? "default" : "ghost"} onClick={() => setActiveTab("tunggakan")}>
            Tunggakan
          </Button>
          {/* Template Excel tab */}
          <Button variant={activeTab === "template" ? "default" : "ghost"} onClick={() => setActiveTab("template")}>
            Template Excel
          </Button>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDateFrom("")
                setDateTo("")
                setSearch("")
                setFilterSekolah("all")
                setFilterKelas("all")
                setFilterLokal("all")
              }}
            >
              Reset Filters
            </Button>
            <Button size="sm" onClick={() => handleExport(activeTab)}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Shared Filter Card */}
        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div>
              <Label>Sekolah</Label>
              <Select value={filterSekolah} onValueChange={(v) => setFilterSekolah(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Sekolah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sekolah</SelectItem>
                  {sekolahList.map((s) => (
                    <SelectItem key={s.id} value={s.nama_sekolah}>
                      {s.nama_sekolah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Kelas</Label>
              <Select value={filterKelas} onValueChange={(v) => setFilterKelas(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasOptions.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lokal</Label>
              <Select value={filterLokal} onValueChange={(v) => setFilterLokal(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Lokal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lokal</SelectItem>
                  {lokalOptions.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Periode dari</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div>
              <Label>Periode sampai</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div>
              <Label>Search</Label>
              <Input
                placeholder="Nama siswa, id, kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tab content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex gap-2">
            <TabsTrigger value="per_siswa">Per Siswa</TabsTrigger>
            <TabsTrigger value="rekap">Rekap Keuangan</TabsTrigger>
            <TabsTrigger value="tunggakan">Tunggakan</TabsTrigger>
            <TabsTrigger value="template">Template Excel</TabsTrigger>
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDateFrom("")
                  setDateTo("")
                  setSearch("")
                  setFilterSekolah("all")
                  setFilterKelas("all")
                  setFilterLokal("all")
                }}
              >
                Reset Filters
              </Button>
              <Button size="sm" onClick={() => handleExport(activeTab)}>
                Export CSV
              </Button>
            </div>
          </TabsList>

          <TabsContent value="per_siswa">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Rekap Per Siswa</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedKategori} onValueChange={(v) => setSelectedKategori(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {kategoris.map((k) => (
                        <SelectItem key={k.id} value={String(k.id)}>
                          {k.nama_kategori}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => handleExport("per_siswa")}>
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Sekolah</TableHead>
                        <TableHead className="text-right">Total Tagihan</TableHead>
                        <TableHead className="text-right">Total Dibayar</TableHead>
                        <TableHead className="text-right">Sisa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSiswa.length ? (
                        paginatedSiswa.map((s, idx) => {
                          // compute totals per siswa (respect selectedKategori and date range)
                          const kategoriIds =
                            selectedKategori === "all" ? kategoris.map((k) => k.id) : [Number(selectedKategori)]
                          const tList = (tagihans || []).filter(
                            (t) => t.siswa_id === s.id && kategoriIds.includes(t.kategori_id),
                          )
                          const totalTagihan = tList.reduce((acc, t) => acc + Number(t.total_tagihan || 0), 0)
                          const totalSisa = tList.reduce((acc, t) => acc + Number(t.sisa_tagihan || 0), 0)

                          // total pembayaran (filter by date)
                          const payments = filterPaymentsByDate(pembayarans || []).filter((p) => p.siswa_id === s.id)
                          const totalPaid = payments.reduce((acc, p) => acc + Number(p.nominal || 0), 0)
                          const rowNo = (pagePerSiswa - 1) * pageSizePerSiswa + idx + 1

                          return (
                            <TableRow key={s.id}>
                              <TableCell>{rowNo}</TableCell>
                              <TableCell>{s.nama_siswa}</TableCell>
                              <TableCell>{s.kelas?.nama_kelas || "-"}</TableCell>
                              <TableCell>{s.sekolah?.nama_sekolah || "-"}</TableCell>
                              <TableCell className="text-right">{fmtID(totalTagihan)}</TableCell>
                              <TableCell className="text-right">{fmtID(totalPaid)}</TableCell>
                              <TableCell className="text-right">{fmtID(totalSisa)}</TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Tidak ada data siswa
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPagesPerSiswa > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setPagePerSiswa((p) => Math.max(1, p - 1))
                            }}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPagesPerSiswa }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={i + 1 === pagePerSiswa}
                              onClick={(e) => {
                                e.preventDefault()
                                setPagePerSiswa(i + 1)
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setPagePerSiswa((p) => Math.min(totalPagesPerSiswa, p + 1))
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rekap">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Rekap Keuangan (Per Periode)</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleExport("rekap")}>
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periode (YYYY-MM)</TableHead>
                        <TableHead className="text-right">Total Pemasukan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rekapData.length ? (
                        rekapData.map((r) => (
                          <TableRow key={r.period}>
                            <TableCell>{r.period}</TableCell>
                            <TableCell className="text-right">{fmtID(r.total)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            Belum ada pembayaran pada periode ini
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tunggakan">
            {activeTab === "tunggakan" && (
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Daftar Tunggakan</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                      }}
                    ></Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                      }}
                    ></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Nama Siswa</TableHead>
                          <TableHead>Kelas</TableHead>
                          <TableHead>Sekolah</TableHead>
                          <TableHead className="text-right">Jumlah Tunggakan</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTunggakan.length ? (
                          paginatedTunggakan.map((row, idx) => {
                            const totalSisa = row.tagihans.reduce((acc, t) => acc + Number(t.sisa_tagihan || 0), 0)
                            const rowNo = (pageTunggakan - 1) * pageSizeTunggakan + idx + 1
                            return (
                              <TableRow key={row.siswa.id}>
                                <TableCell>{rowNo}</TableCell>
                                <TableCell>{row.siswa.nama_siswa}</TableCell>
                                <TableCell>{row.siswa.kelas?.nama_kelas || "-"}</TableCell>
                                <TableCell>{row.siswa.sekolah?.nama_sekolah || "-"}</TableCell>
                                <TableCell className="text-right">{fmtID(totalSisa)}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => router.visit(routeHelper("siswa.show", { id: row.siswa.id }))}
                                    >
                                      Detail
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        router.visit(routeHelper("pembayaran.create", { siswa_id: row.siswa.id }))
                                      }
                                    >
                                      Bayar
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              Tidak ada tunggakan
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPagesTunggakan > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPageTunggakan((p) => Math.max(1, p - 1))
                              }}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPagesTunggakan }).map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                href="#"
                                isActive={i + 1 === pageTunggakan}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setPageTunggakan(i + 1)
                                }}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPageTunggakan((p) => Math.min(totalPagesTunggakan, p + 1))
                              }}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="template">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Laporan Template Excel</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={templateType} onValueChange={setTemplateType}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Pilih Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spp">SPP Bulanan</SelectItem>
                      <SelectItem value="sosial">Uang Sosial Bulanan</SelectItem>
                      <SelectItem value="daftar_ulang">Daftar Ulang</SelectItem>
                      <SelectItem value="buku_paket">Buku Paket (Tahap)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="hidden md:inline-flex">
                    Bentuk kolom mengikuti contoh Excel
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  {(templateType === "spp" || templateType === "sosial") && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>NO</TableHead>
                          <TableHead>NAMA</TableHead>
                          {monthsSY.map((m) => (
                            <TableHead key={m.label} className="text-center">
                              {m.label}
                            </TableHead>
                          ))}
                          <TableHead className="text-right">JUMLAH</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSiswa.length ? (
                          filteredSiswa.map((s, idx) => {
                            const cells = monthsSY.map((mm) =>
                              sumByMonthAndKategori(s.id, mm.y, mm.m, templateType === "spp" ? "spp" : "sosial"),
                            )
                            const total = cells.reduce((a, b) => a + b, 0)
                            return (
                              <TableRow key={s.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="whitespace-nowrap">{s.nama_siswa}</TableCell>
                                {cells.map((v, i) => (
                                  <TableCell key={i} className="text-right">
                                    {v ? fmtID(v) : "-"}
                                  </TableCell>
                                ))}
                                <TableCell className="text-right font-medium">{fmtID(total)}</TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={monthsSY.length + 3} className="text-center">
                              Tidak ada data siswa
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}

                  {templateType === "daftar_ulang" && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>NO</TableHead>
                          <TableHead>NAMA</TableHead>
                          <TableHead className="text-right">Uang Baju Seragam</TableHead>
                          <TableHead className="text-right">Uang Pengembangan Pendidikan</TableHead>
                          <TableHead className="text-right">SPP Juli 2025</TableHead>
                          <TableHead className="text-right">Uang Makan Siang Juli 2025</TableHead>
                          <TableHead className="text-right">Uang Sosial Juli 2025</TableHead>
                          <TableHead className="text-right">Uang Alat Tulis</TableHead>
                          <TableHead className="text-right">Jumlah Pembayaran Seharusnya</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="text-right">Sisa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSiswa.length ? (
                          filteredSiswa.map((s, idx) => {
                            const cols = {
                              seragam: sumByKategoriList(s.id, ["seragam"]),
                              pengembangan: sumByKategoriList(s.id, ["pengembangan"]),
                              spp_juli: sumByKategoriList(s.id, ["spp juli"]),
                              makan_juli: sumByKategoriList(s.id, ["makan juli"]),
                              sosial_juli: sumByKategoriList(s.id, ["sosial juli"]),
                              alat_tulis: sumByKategoriList(s.id, ["alat tulis"]),
                            }
                            const required = Object.values(cols).reduce((a, b) => a + b, 0)
                            // gunakan total sisa dari semua tagihan siswa jika tersedia
                            const allT = (tagihans || []).filter((t) => t.siswa_id === s.id)
                            const sisaTotal = allT.reduce((acc, t) => acc + Number(t.sisa_tagihan || 0), 0)
                            const ket = sisaTotal > 0 ? `-Rp ${fmtID(sisaTotal).replace("Rp", "").trim()}` : "Rp 0"

                            return (
                              <TableRow key={s.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="whitespace-nowrap">{s.nama_siswa}</TableCell>
                                <TableCell className="text-right">{cols.seragam ? fmtID(cols.seragam) : "-"}</TableCell>
                                <TableCell className="text-right">
                                  {cols.pengembangan ? fmtID(cols.pengembangan) : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {cols.spp_juli ? fmtID(cols.spp_juli) : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {cols.makan_juli ? fmtID(cols.makan_juli) : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {cols.sosial_juli ? fmtID(cols.sosial_juli) : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {cols.alat_tulis ? fmtID(cols.alat_tulis) : "-"}
                                </TableCell>
                                <TableCell className="text-right font-medium">{fmtID(required)}</TableCell>
                                <TableCell>{ket}</TableCell>
                                <TableCell className="text-right">{fmtID(sisaTotal)}</TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center">
                              Tidak ada data siswa
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}

                  {templateType === "buku_paket" && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>NO</TableHead>
                          <TableHead>NAMA</TableHead>
                          <TableHead className="text-center">TAHAP 1</TableHead>
                          <TableHead className="text-center">TAHAP 2</TableHead>
                          <TableHead className="text-center">TAHAP 3</TableHead>
                          <TableHead className="text-right">JUMLAH</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSiswa.length ? (
                          filteredSiswa.map((s, idx) => {
                            const kid = matchKategoriIdByNameIncludes("buku")
                            const pays = filterPaymentsByDate(pembayarans || [])
                              .filter(
                                (p) =>
                                  Number(p.siswa_id) === Number(s.id) &&
                                  (!kid || Number(p.kategori_id) === Number(kid)),
                              )
                              .sort((a, b) => {
                                const da = getDate(a),
                                  db = getDate(b)
                                return da - db
                              })
                            const tahap1 = pays[0]?.nominal ? Number(pays[0].nominal) : 0
                            const tahap2 = pays[1]?.nominal ? Number(pays[1].nominal) : 0
                            const tahap3 = pays[2]?.nominal ? Number(pays[2].nominal) : 0
                            const total = tahap1 + tahap2 + tahap3

                            return (
                              <TableRow key={s.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="whitespace-nowrap">{s.nama_siswa}</TableCell>
                                <TableCell className="text-right">{tahap1 ? fmtID(tahap1) : "-"}</TableCell>
                                <TableCell className="text-right">{tahap2 ? fmtID(tahap2) : "-"}</TableCell>
                                <TableCell className="text-right">{tahap3 ? fmtID(tahap3) : "-"}</TableCell>
                                <TableCell className="text-right font-medium">{fmtID(total)}</TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              Tidak ada data siswa
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}
