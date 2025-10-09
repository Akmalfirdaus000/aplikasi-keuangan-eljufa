"use client"
import { Head, usePage } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

function idr(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(n || 0))
}

export default function KeuanganIndex() {
  const { stats, riwayat } = usePage().props

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight">Keuangan Sekolah</h2>}
    >
      <Head title="Keuangan" />

      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Ringkasan */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Total Tagihan</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-gray-700">
              {idr(stats.total_tagihan)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Uang Masuk</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-green-600">
              {idr(stats.total_uangmasuk)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Sisa Tagihan</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-red-600">
              {idr(stats.total_sisa)}
            </CardContent>
          </Card>
        </div>

        {/* Riwayat Pembayaran */}
        <Card>
          <CardHeader><CardTitle>Riwayat Pembayaran Terakhir</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riwayat.length ? riwayat.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.tanggal}</TableCell>
                      <TableCell>{r.siswa}</TableCell>
                      <TableCell>{r.kategori}</TableCell>
                      <TableCell>{r.metode}</TableCell>
                      <TableCell className="text-right font-semibold">{idr(r.nominal)}</TableCell>
                      <TableCell>{r.keterangan}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Tidak ada pembayaran
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
