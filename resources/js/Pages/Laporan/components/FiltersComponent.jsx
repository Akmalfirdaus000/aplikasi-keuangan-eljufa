"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function FiltersCardKategori({
  sekolahList = [],
  kategoriList = [],
  kelasOptions = [],
  lokalOptions = [],
  filterSekolah, setFilterSekolah,
  filterKelas, setFilterKelas,
  filterLokal, setFilterLokal,
  filterKategori, setFilterKategori,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  search, setSearch,
  onApplyServer,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter</CardTitle>
      </CardHeader>
      <CardContent className="grid  md:grid-cols-4 gap-3">
           <div>
          <Label>Cari</Label>
          <Input placeholder="Nama siswa..." value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
        <div>
          <Label>Sekolah</Label>
          <Select value={filterSekolah} onValueChange={(v)=>{setFilterSekolah(v); setFilterKelas("all"); setFilterLokal("all")}}>
            <SelectTrigger><SelectValue placeholder="Semua Sekolah" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sekolah</SelectItem>
              {sekolahList.map((s) => (
                <SelectItem key={s.id} value={s.nama_sekolah}>{s.nama_sekolah}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Kelas</Label>
          <Select value={filterKelas} onValueChange={setFilterKelas} disabled={filterSekolah === "all"}>
            <SelectTrigger><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {kelasOptions.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Lokal</Label>
          <Select value={filterLokal} onValueChange={setFilterLokal} disabled={filterSekolah === "all"}>
            <SelectTrigger><SelectValue placeholder="Semua Lokal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokal</SelectItem>
              {lokalOptions.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Kategori</Label>
          <Select value={filterKategori} onValueChange={setFilterKategori}>
            <SelectTrigger><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {kategoriList.map((k) => (
                <SelectItem key={k.id} value={String(k.id)}>{k.nama_kategori}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Dari Tanggal</Label>
          <Input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
        </div>

        <div>
          <Label>Sampai Tanggal</Label>
          <Input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        </div>

     


      </CardContent>
    </Card>
  )
}
