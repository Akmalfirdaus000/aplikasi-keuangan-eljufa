"use client"

import { useMemo, useState, useEffect } from "react"
import { usePage, router,Head } from "@inertiajs/react"
import { route } from "ziggy-js"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationPrevious, PaginationNext, PaginationEllipsis,
} from "@/components/ui/pagination"

export default function PembayaranIndex() {
  const { rows = [], meta = {}, filters = {} } = usePage().props

  const [from, setFrom] = useState(filters.from || "")
  const [to, setTo] = useState(filters.to || "")
  const [search, setSearch] = useState(filters.search || "")
  const [perPage, setPerPage] = useState(filters.perPage || 20)

  // rupiah
  const idr = (n) => new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(Number(n||0))

  const apply = (page = 1) => {
    router.get(route("pembayarans.index"), { from, to, search, perPage, page }, { preserveScroll:true, preserveState:true })
  }

  // enter to search
  const onKey = (e) => { if (e.key === "Enter") apply() }

  const currentPage = meta.current_page || 1
  const lastPage = meta.last_page || 1

  // pagination numbers (ringkas)
  const pageNumbers = useMemo(() => {
    const range = []
    const start = Math.max(1, currentPage - 2)
    const end   = Math.min(lastPage, currentPage + 2)
    for (let i = start; i <= end; i++) range.push(i)
    if (!range.includes(1)) range.unshift(1, "start-ellipsis")
    if (!range.includes(lastPage)) range.push("end-ellipsis", lastPage)
    return range
  }, [currentPage, lastPage])

  return (
    <AuthenticatedLayout
      header={<div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">Riwayat Pembayaran</h1>
        <p className="text-sm text-muted-foreground">Filter berdasarkan tanggal & nama siswa.</p>
      </div>}
    >
      <Head title="Riwayat Pembayaran"/>
      <div className="grid gap-4">
        {/* Filter Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Filter</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Dari Tanggal</label>
              <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Sampai Tanggal</label>
              <Input type="date" value={to} onChange={e=>setTo(e.target.value)} />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Cari Nama Siswa</label>
              <Input placeholder="Ketik nama siswa..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={onKey} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Baris / Hal.</label>
              <Input type="number" min={5} max={100} value={perPage} onChange={e=>setPerPage(e.target.value)} />
            </div>
            <Button onClick={()=>apply()}>Terapkan</Button>
          </CardContent>
        </Card>

        {/* Tabel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daftar Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Sekolah</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Lokal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Metode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length ? rows.map((r, i)=>(
                    <TableRow key={r.id}>
                      <TableCell>{(meta.per_page || 20) * ((currentPage-1)) + i + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.tanggal || '-'}</TableCell>
                      <TableCell>{r.siswa?.nama || '-'}</TableCell>
                      <TableCell>{r.sekolah?.nama || '-'}</TableCell>
                      <TableCell>{r.kelas?.nama || '-'}</TableCell>
                      <TableCell>{r.kelas?.lokal || '-'}</TableCell>
                      <TableCell>{r.kategori?.nama || '-'}</TableCell>
                      <TableCell className="text-right">{idr(r.jumlah)}</TableCell>
                      <TableCell className="max-w-[260px] truncate" title={r.keterangan || ''}>{r.keterangan || '-'}</TableCell>
                      <TableCell>{r.metode || '-'}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center">Tidak ada data</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={()=> apply(Math.max(1, currentPage-1))}
                        aria-disabled={currentPage<=1}
                        className={currentPage<=1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {pageNumbers.map((p, idx) =>
                      typeof p === "number" ? (
                        <PaginationItem key={p}>
                          <PaginationLink isActive={p===currentPage} onClick={()=>apply(p)}>{p}</PaginationLink>
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={`${p}-${idx}`}><PaginationEllipsis /></PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={()=> apply(Math.min(lastPage, currentPage+1))}
                        aria-disabled={currentPage>=lastPage}
                        className={currentPage>=lastPage ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
