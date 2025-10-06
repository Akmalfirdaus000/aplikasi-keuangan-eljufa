"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

export default function RekapSection({ rekapData = [], fmtID, handleExport }) {
  return (
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
  )
}
