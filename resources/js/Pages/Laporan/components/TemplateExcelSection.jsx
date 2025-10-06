"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function TemplateExcelSection({
  templateType,
  setTemplateType,
  monthsSY,
  filteredSiswa,
  sumByMonthAndKategori,
  sumByKategoriList,
  fmtID,
  matchKategoriIdByNameIncludes,
  filterPaymentsByDate,
  getDate,
  pembayarans,
  tagihans,
}) {
  return (
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
                        <TableCell className="text-right">{cols.spp_juli ? fmtID(cols.spp_juli) : "-"}</TableCell>
                        <TableCell className="text-right">{cols.makan_juli ? fmtID(cols.makan_juli) : "-"}</TableCell>
                        <TableCell className="text-right">{cols.sosial_juli ? fmtID(cols.sosial_juli) : "-"}</TableCell>
                        <TableCell className="text-right">{cols.alat_tulis ? fmtID(cols.alat_tulis) : "-"}</TableCell>
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
                        (p) => Number(p.siswa_id) === Number(s.id) && (!kid || Number(p.kategori_id) === Number(kid)),
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
  )
}
