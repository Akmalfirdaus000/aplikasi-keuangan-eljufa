"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function TunggakanSection({
  paginatedTunggakan,
  totalPagesTunggakan,
  pageTunggakan,
  setPageTunggakan,
  fmtID,
  router,
  routeHelper,
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Daftar Tunggakan</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" onClick={(e) => e.preventDefault()} />
          <Button size="sm" variant="outline" onClick={(e) => e.preventDefault()} />
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
                  const rowNo = (pageTunggakan - 1) * 10 + idx + 1
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
                            onClick={() => router.visit(routeHelper("pembayaran.create", { siswa_id: row.siswa.id }))}
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
  )
}
