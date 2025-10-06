"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function FiltersCard({
  sekolahList = [],
  kelasOptions = [],
  lokalOptions = [],
  filterSekolah,
  setFilterSekolah,
  filterKelas,
  setFilterKelas,
  filterLokal,
  setFilterLokal,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  search,
  setSearch,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div>
          <Label>Sekolah</Label>
          <Select value={filterSekolah} onValueChange={setFilterSekolah}>
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
          <Select value={filterKelas} onValueChange={setFilterKelas}>
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
          <Select value={filterLokal} onValueChange={setFilterLokal}>
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

        {/* <div>
          <Label>Periode dari</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>

        <div>
          <Label>Periode sampai</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div> */}

        <div>
          <Label>Search</Label>
          <Input placeholder="Nama siswa, id, kelas..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </CardContent>
    </Card>
  )
}
