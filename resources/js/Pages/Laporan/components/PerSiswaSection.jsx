"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function PerSiswaSection({
  filteredCount,
  paginatedSiswa,
  pagePerSiswa,
  setPagePerSiswa,
  totalPagesPerSiswa,
  pageSizePerSiswa,
  selectedKategori,
  setSelectedKategori,
  kategoris,
  fmtID,
  tagihans,
  pembayarans,
  filterPaymentsByDate,
  handleExport,
}) {
  // hitung total keseluruhan untuk summary
  const summary = {
    tagihan: 0,
    bayar: 0,
    sisa: 0,
    perKategori: {},
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Rekap Per Siswa</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={selectedKategori} onValueChange={setSelectedKategori}>
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

                {selectedKategori === "all" ? (
                  <>
                    {kategoris.map((k) => (
                      <TableHead key={k.id} className="text-right">
                        {k.nama_kategori}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Grand Total</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-right">Total Tagihan</TableHead>
                    <TableHead className="text-right">Total Dibayar</TableHead>
                    <TableHead className="text-right">Sisa</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCount ? (
                paginatedSiswa.map((s, idx) => {
                  const rowNo = (pagePerSiswa - 1) * pageSizePerSiswa + idx + 1

                  if (selectedKategori === "all") {
                    // tampilkan semua kategori
                    let grandTotal = 0
                    return (
                      <TableRow key={s.id}>
                        <TableCell>{rowNo}</TableCell>
                        <TableCell>{s.nama_siswa}</TableCell>
                        <TableCell>{s.kelas?.nama_kelas || "-"}</TableCell>
                        <TableCell>{s.sekolah?.nama_sekolah || "-"}</TableCell>
                        {kategoris.map((k) => {
                          const t = (tagihans || []).find((t) => t.siswa_id === s.id && t.kategori_id === k.id)
                          const val = Number(t?.total_tagihan || 0)
                          summary.perKategori[k.id] = (summary.perKategori[k.id] || 0) + val
                          grandTotal += val
                          return (
                            <TableCell key={k.id} className="text-right">
                              {fmtID(val)}
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-right font-bold">{fmtID(grandTotal)}</TableCell>
                      </TableRow>
                    )
                  } else {
                    // tampilkan hanya kategori yg dipilih
                    const kategoriIds = [Number(selectedKategori)]
                    const tList = (tagihans || []).filter(
                      (t) => t.siswa_id === s.id && kategoriIds.includes(t.kategori_id),
                    )
                    const totalTagihan = tList.reduce((acc, t) => acc + Number(t.total_tagihan || 0), 0)
                    const totalSisa = tList.reduce((acc, t) => acc + Number(t.sisa_tagihan || 0), 0)

                    const payments = filterPaymentsByDate(pembayarans || []).filter(
                      (p) => p.siswa_id === s.id && kategoriIds.includes(p.kategori_id),
                    )
                    const totalPaid = payments.reduce((acc, p) => acc + Number(p.nominal || 0), 0)

                    summary.tagihan += totalTagihan
                    summary.bayar += totalPaid
                    summary.sisa += totalSisa

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
                  }
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Tidak ada data siswa
                  </TableCell>
                </TableRow>
              )}

              {/* summary row */}
              {filteredCount > 0 && (
                <TableRow className="font-bold bg-muted">
                  <TableCell colSpan={selectedKategori === "all" ? 4 : 4} className="text-right">
                    Total
                  </TableCell>
                  {selectedKategori === "all" ? (
                    <>
                      {kategoris.map((k) => (
                        <TableCell key={k.id} className="text-right">
                          {fmtID(summary.perKategori[k.id] || 0)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        {fmtID(Object.values(summary.perKategori).reduce((a, b) => a + b, 0))}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-right">{fmtID(summary.tagihan)}</TableCell>
                      <TableCell className="text-right">{fmtID(summary.bayar)}</TableCell>
                      <TableCell className="text-right">{fmtID(summary.sisa)}</TableCell>
                    </>
                  )}
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
  )
}
