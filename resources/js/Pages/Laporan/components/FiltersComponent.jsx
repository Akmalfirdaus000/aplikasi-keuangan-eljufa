"use client"

import { useMemo, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function FiltersCardKategori({
  // data master dari server
  sekolahList = [],  // [{id,nama_sekolah, kelas:[{id,nama_kelas,lokal,tingkat}]}]
  kategoriList = [], // [{id,nama_kategori}]

  // state & setter dikontrol parent (index)
  filterSekolahId, setFilterSekolahId, // string|number|"all"
  filterKelasId,   setFilterKelasId,   // string|number|"all"
  filterLokal,     setFilterLokal,     // string|"all"
  filterKategoriId,setFilterKategoriId,// string|number|"all"
  dateFrom,        setDateFrom,        // "YYYY-MM-DD"|""
  dateTo,          setDateTo,          // "YYYY-MM-DD"|""
  search,          setSearch,          // string

  onApplyServer,                       // () => void
  onReset,                            // () => void (opsional)
  autoApply = false,                  // true: apply otomatis saat ganti filter (seperti di Tagihan)
}) {
  // opsi kelas & lokal mengikuti sekolah terpilih
  const kelasOptions = useMemo(() => {
    if (filterSekolahId === "all" || !sekolahList?.length) return []
    const s = sekolahList.find(x => String(x.id) === String(filterSekolahId))
    return (s?.kelas || []).map(k => ({ id: String(k.id), label: k.nama_kelas }))
  }, [filterSekolahId, sekolahList])

  const lokalOptions = useMemo(() => {
    if (filterSekolahId === "all" || !sekolahList?.length) return []
    const s = sekolahList.find(x => String(x.id) === String(filterSekolahId))
    const set = new Set((s?.kelas || []).map(k => k.lokal).filter(Boolean))
    return Array.from(set)
  }, [filterSekolahId, sekolahList])

  // reset anak saat induk berubah
  useEffect(() => {
    // ketika ganti sekolah → reset kelas & lokal
    setFilterKelasId("all")
    setFilterLokal("all")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSekolahId])

  // optional: auto-apply seperti Tagihan (kecuali input search & tanggal biar tidak spam)
  const didMount = useRef(false)
  useEffect(() => {
    if (!autoApply) return
    if (!didMount.current) { didMount.current = true; return }
    onApplyServer?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSekolahId, filterKelasId, filterLokal, filterKategoriId])

  const onKeyDownEnter = (e) => {
    if (e.key === "Enter") onApplyServer?.()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filter</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        {/* Cari */}
        <div className="md:col-span-2">
          <Label htmlFor="f-cari">Cari</Label>
          <Input
            id="f-cari"
            placeholder="Nama siswa / keterangan…"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            onKeyDown={onKeyDownEnter}
          />
        </div>

        {/* Sekolah */}
        <div>
          <Label>Sekolah</Label>
          <Select
            value={String(filterSekolahId ?? "all")}
            onValueChange={(v)=>setFilterSekolahId(v)}
          >
            <SelectTrigger><SelectValue placeholder="Semua Sekolah" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sekolah</SelectItem>
              {sekolahList.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.nama_sekolah}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kelas */}
        <div>
          <Label>Kelas</Label>
          <Select
            value={String(filterKelasId ?? "all")}
            onValueChange={setFilterKelasId}
            disabled={filterSekolahId === "all"}
          >
            <SelectTrigger><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {kelasOptions.map((k) => (
                <SelectItem key={k.id} value={k.id}>{k.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lokal */}
        <div>
          <Label>Lokal</Label>
          <Select
            value={String(filterLokal ?? "all")}
            onValueChange={setFilterLokal}
            disabled={filterSekolahId === "all"}
          >
            <SelectTrigger><SelectValue placeholder="Semua Lokal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokal</SelectItem>
              {lokalOptions.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Kategori */}
        <div>
          <Label>Kategori</Label>
          <Select
            value={String(filterKategoriId ?? "all")}
            onValueChange={setFilterKategoriId}
          >
            <SelectTrigger><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {kategoriList.map((k) => (
                <SelectItem key={k.id} value={String(k.id)}>{k.nama_kategori}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tanggal */}
        <div>
          <Label>Dari Tanggal</Label>
          <Input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} onKeyDown={onKeyDownEnter} />
        </div>
        <div>
          <Label>Sampai Tanggal</Label>
          <Input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} onKeyDown={onKeyDownEnter} />
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex gap-2 items-end">
          <Button onClick={onApplyServer}>Terapkan</Button>
          <Button type="button" variant="outline" onClick={onReset}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  )
}
