"use client"

import { useMemo, useState, useEffect } from "react"
import { usePage, router } from "@inertiajs/react"
import { route } from "ziggy-js"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import FiltersCard from "./components/FiltersComponent"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationPrevious, PaginationNext, PaginationEllipsis,
} from "@/components/ui/pagination"

export default function LaporanPerKategoriIndex() {
  const { rows = [], sekolahList = [], kategoriList = [], filters = {} } = usePage().props

  // Filter state (default dari server dipakai bila ada)
  const [filterSekolah, setFilterSekolah]   = useState(filters.sekolah || "all")   // pakai nama sekolah
  const [filterKelas, setFilterKelas]       = useState(filters.kelas || "all")     // pakai nama kelas
  const [filterLokal, setFilterLokal]       = useState(filters.lokal || "all")
  const [filterKategori, setFilterKategori] = useState(filters.kategori || "all")  // pakai id kategori (string)
  const [dateFrom, setDateFrom]             = useState(filters.from || "")
  const [dateTo, setDateTo]                 = useState(filters.to || "")
  const [search, setSearch]                 = useState(filters.search || "")

  // Dependent options untuk Select kelas & lokal pada filter bar
  const kelasOptions = useMemo(() => {
    if (filterSekolah === "all") return []
    const s = (sekolahList || []).find(x => x.nama_sekolah === filterSekolah)
    return (s?.kelas || []).map(k => k.nama_kelas)
  }, [filterSekolah, sekolahList])

  const lokalOptions = useMemo(() => {
    if (filterSekolah === "all") return []
    const s = (sekolahList || []).find(x => x.nama_sekolah === filterSekolah)
    const set = new Set((s?.kelas || []).map(k => k.lokal).filter(Boolean))
    return Array.from(set)
  }, [filterSekolah, sekolahList])

  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
      .format(Number(n || 0))

  // Normalisasi rows agar aman: tanggal, nama kategori, jumlah
  const normalized = useMemo(() => {
    return (rows || []).map(r => ({
      ...r,
      tanggal: r.tanggal || r.tanggal_bayar || null,
      jumlah: Number(r.jumlah ?? r.nominal ?? 0),
      kategori: r.kategori || (r.kategori_nama ? { id: r.kategori_id, nama: r.kategori_nama } : null),
      siswa: r.siswa || (r.siswa_nama ? { id: r.siswa_id, nama: r.siswa_nama } : null),
      sekolah: r.sekolah || (r.sekolah_nama ? { id: r.sekolah_id, nama: r.sekolah_nama } : null),
      kelas: r.kelas || (r.kelas_nama ? { id: r.kelas_id, nama: r.kelas_nama, lokal: r.lokal } : null),
    }))
  }, [rows])

  // Client-side filtering
  const filtered = useMemo(() => {
    let data = normalized

    // Tanggal (inklusif)
    if (dateFrom) {
      const from = new Date(dateFrom)
      data = data.filter(r => r.tanggal && new Date(r.tanggal) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      // tambah 1 hari agar inklusif harian
      const toPlus = new Date(to)
      toPlus.setDate(toPlus.getDate() + 1)
      data = data.filter(r => r.tanggal && new Date(r.tanggal) < toPlus)
    }

    // Filter sekolah/kelas/lokal
    if (filterSekolah !== "all") data = data.filter(r => r.sekolah?.nama === filterSekolah)
    if (filterKelas !== "all")   data = data.filter(r => r.kelas?.nama === filterKelas)
    if (filterLokal !== "all")   data = data.filter(r => (r.kelas?.lokal || "") === filterLokal)

    // Filter kategori (berbasis id)
    if (filterKategori !== "all" && filterKategori !== "") {
      data = data.filter(r => String(r.kategori?.id || "") === String(filterKategori))
    }

    // Search
    const q = search.trim().toLowerCase()
    if (q) {
      data = data.filter(r => {
        const s = (r.siswa?.nama || "").toLowerCase()
        const k = (r.kategori?.nama || "").toLowerCase()
        const ket = (r.keterangan || "").toLowerCase()
        const kl = (r.kelas?.nama || "").toLowerCase()
        const sk = (r.sekolah?.nama || "").toLowerCase()
        return s.includes(q) || k.includes(q) || ket.includes(q) || kl.includes(q) || sk.includes(q)
      })
    }

    return data
  }, [normalized, dateFrom, dateTo, filterSekolah, filterKelas, filterLokal, filterKategori, search])

  // Ringkasan total nominal (untuk header)
  const totalNominal = useMemo(() => filtered.reduce((a, b) => a + (b.jumlah || 0), 0), [filtered])

  // Pagination state untuk tabel di bawah
  const [page, setPage] = useState(1)
  const perPage = 20
  useEffect(() => {
    setPage(1)
  }, [filterSekolah, filterKelas, filterLokal, filterKategori, dateFrom, dateTo, search])

  // =======================
  // MODE 1: PIVOT (ALL CAT)
  // =======================
  const CATEGORY_ORDER = useMemo(() => ([
    { key: "uang_masuk",   label: "Uang Masuk",   match: (n) => /uang\s*masuk/i.test(n) },
    { key: "daftar_ulang", label: "Daftar Ulang", match: (n) => /daftar\s*ulang/i.test(n) },
    { key: "spp",          label: "SPP",          match: (n) => /^spp$/i.test(n) || /\bspp\b/i.test(n) },
    { key: "sosial",       label: "Sosial",       match: (n) => /sosial/i.test(n) },
    { key: "antar_jemput", label: "Antar Jemput", match: (n) => /antar\s*jemput/i.test(n) },
    { key: "buku_paket",   label: "Buku Paket",   match: (n) => /buku\s*paket/i.test(n) },
    { key: "makan_siang",  label: "Makan Siang",  match: (n) => /makan\s*siang/i.test(n) },
  ]), [])

  const slotByKategoriId = useMemo(() => {
    const m = new Map()
    ;(kategoriList || []).forEach(k => {
      const name = String(k.nama_kategori || "")
      const slot = CATEGORY_ORDER.findIndex(s => s.match(name))
      if (slot >= 0) m.set(String(k.id), CATEGORY_ORDER[slot].key)
    })
    return m
  }, [kategoriList, CATEGORY_ORDER])

  const pivotRows = useMemo(() => {
    if (filterKategori !== "all" && filterKategori !== "") return [] // bukan mode pivot
    const map = new Map()
    for (const r of filtered) {
      const sid = r.siswa?.id
      if (!sid) continue
      if (!map.has(sid)) {
        map.set(sid, {
          siswa: {
            id: sid,
            nama: r.siswa?.nama || "-",
            sekolah: r.sekolah?.nama || "",
            kelas: r.kelas?.nama || "",
            lokal: r.kelas?.lokal || "",
          },
          cols: {
            uang_masuk: 0, daftar_ulang: 0, spp: 0, sosial: 0, antar_jemput: 0, buku_paket: 0, makan_siang: 0,
          },
          total: 0,
        })
      }
      const row = map.get(sid)
      const catId = String(r.kategori?.id || "")
      const slotKey = slotByKategoriId.get(catId)
      const amount = Number(r.jumlah || 0)
      if (slotKey) {
        row.cols[slotKey] += amount
        row.total += amount
      }
    }
    // Hanya siswa yang punya nilai > 0
    return Array.from(map.values()).filter(r => r.total > 0)
  }, [filtered, slotByKategoriId, filterKategori])

  const pivotFooter = useMemo(() => {
    const f = CATEGORY_ORDER.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {})
    let total = 0
    for (const r of pivotRows) {
      CATEGORY_ORDER.forEach(s => { f[s.key] += r.cols[s.key] || 0 })
      total += r.total || 0
    }
    return { byCol: f, total }
  }, [pivotRows, CATEGORY_ORDER])

  // Pagination utk pivot/detail
  const isPivot = (filterKategori === "all" || filterKategori === "")
  const totalRows = isPivot ? pivotRows.length : filtered.length
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage))
  const currentPage = Math.min(page, totalPages)
  const pageOffset = (currentPage - 1) * perPage
  const pageNumbers = useMemo(() => {
    const total = totalPages, curr = currentPage
    const range = []
    const start = Math.max(1, curr - 2)
    const end   = Math.min(total, curr + 2)
    for (let i = start; i <= end; i++) range.push(i)
    if (!range.includes(1)) range.unshift(1, "start-ellipsis")
    if (!range.includes(total)) range.push("end-ellipsis", total)
    return range
  }, [currentPage, totalPages])

  const pageData = useMemo(() => {
    const data = isPivot ? pivotRows : filtered
    return data.slice(pageOffset, pageOffset + perPage)
  }, [isPivot, pivotRows, filtered, pageOffset, perPage])

  // Apply filter ke server (opsional)
  const applyServer = () => {
    router.get(route("laporan.perkategori.index"), {
      sekolah: filterSekolah,
      kelas: filterKelas,
      lokal: filterLokal,
      kategori: filterKategori,
      from: dateFrom,
      to: dateTo,
      search,
    }, { preserveScroll: true, preserveState: true })
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Laporan Per Kategori</h1>
          <p className="text-sm text-muted-foreground">Rekap dan detail transaksi dari Pembayaran, bisa pivot per siswa atau per kategori.</p>
        </div>
      }
    >
      <div className="grid gap-4">
        <FiltersCard
          sekolahList={sekolahList}
          kategoriList={kategoriList}
          kelasOptions={kelasOptions}
          lokalOptions={lokalOptions}
          filterSekolah={filterSekolah} setFilterSekolah={setFilterSekolah}
          filterKelas={filterKelas} setFilterKelas={setFilterKelas}
          filterLokal={filterLokal} setFilterLokal={setFilterLokal}
          filterKategori={filterKategori} setFilterKategori={setFilterKategori}
          dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo}
          search={search} setSearch={setSearch}
          onApplyServer={applyServer}
        />



        {/* ===================== */}
        {/* TABEL: PIVOT vs DETAIL */}
        {/* ===================== */}
        {isPivot ? (
          // PIVOT
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Rekap Per Siswa (Semua Kategori)</CardTitle>
              <div className="text-sm text-muted-foreground">
                Total siswa tampil: {pivotRows.length} • Total nominal: {formatRupiah(pivotFooter.total)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      {CATEGORY_ORDER.map(s => (
                        <TableHead key={s.key} className="whitespace-nowrap">{s.label}</TableHead>
                      ))}
                      <TableHead className="text-right whitespace-nowrap">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageData.length ? pageData.map((r, i) => (
                      <TableRow key={r.siswa.id}>
                        <TableCell>{pageOffset + i + 1}</TableCell>
                        <TableCell className="min-w-[220px]">
                          <div className="flex flex-col">
                            <span className="font-medium">{r.siswa.nama}</span>
                            <span className="text-xs text-muted-foreground">
                              {r.siswa.sekolah ? `${r.siswa.sekolah} • ` : ""}{r.siswa.kelas || "-"}{r.siswa.lokal ? ` • ${r.siswa.lokal}` : ""}
                            </span>
                          </div>
                        </TableCell>
                        {CATEGORY_ORDER.map(s => (
                          <TableCell key={s.key} className="text-right">
                            {r.cols[s.key] ? formatRupiah(r.cols[s.key]) : "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold">{formatRupiah(r.total)}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={2 + CATEGORY_ORDER.length + 1} className="text-center">
                          Tidak ada data untuk filter ini
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Footer total */}
                    {pivotRows.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-semibold">Jumlah Keseluruhan</TableCell>
                        {CATEGORY_ORDER.map(s => (
                          <TableCell key={`ft-${s.key}`} className="text-right font-semibold">
                            {pivotFooter.byCol[s.key] ? formatRupiah(pivotFooter.byCol[s.key]) : "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-extrabold">{formatRupiah(pivotFooter.total)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          aria-disabled={currentPage <= 1}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {pageNumbers.map((p, i) =>
                        typeof p === "number" ? (
                          <PaginationItem key={p}>
                            <PaginationLink isActive={p === currentPage} onClick={() => setPage(p)}>{p}</PaginationLink>
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={`${p}-${i}`}><PaginationEllipsis /></PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          aria-disabled={currentPage >= totalPages}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // DETAIL PER KATEGORI
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Detail Transaksi (Per Kategori)</CardTitle>
              <div className="flex gap-2">
                <div className="text-sm text-muted-foreground">
                  Total data: {filtered.length} • Total nominal: {formatRupiah(totalNominal)}
                </div>
                <Button variant="outline" onClick={applyServer}>Terapkan di Server</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Sekolah</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Lokal</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageData.length ? pageData.map((r, i) => (
                      <TableRow key={`${r.id}-${i}`}>
                        <TableCell>{pageOffset + i + 1}</TableCell>
                        <TableCell className="whitespace-nowrap">{r.tanggal || "-"}</TableCell>
                        <TableCell>{r.siswa?.nama || "-"}</TableCell>
                        <TableCell>{r.sekolah?.nama || "-"}</TableCell>
                        <TableCell>{r.kelas?.nama || "-"}</TableCell>
                        <TableCell>{r.kelas?.lokal || "-"}</TableCell>
                        <TableCell>{r.kategori?.nama || "-"}</TableCell>
                        <TableCell className="text-right">{formatRupiah(r.jumlah)}</TableCell>
                        <TableCell className="max-w-[260px] truncate" title={r.keterangan || ""}>
                          {r.keterangan || "-"}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">Tidak ada data untuk filter ini</TableCell>
                      </TableRow>
                    )}

                    {/* Footer total */}
                    {filtered.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-right font-semibold">Jumlah Keseluruhan</TableCell>
                        <TableCell className="text-right font-extrabold">{formatRupiah(totalNominal)}</TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          aria-disabled={currentPage <= 1}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {pageNumbers.map((p, i) =>
                        typeof p === "number" ? (
                          <PaginationItem key={p}>
                            <PaginationLink isActive={p === currentPage} onClick={() => setPage(p)}>{p}</PaginationLink>
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={`${p}-${i}`}><PaginationEllipsis /></PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          aria-disabled={currentPage >= totalPages}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
