"use client"

import { useMemo, useState, useEffect } from "react"
import { usePage, router } from "@inertiajs/react"
import { route } from "ziggy-js"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { useToast } from "@/hooks/use-toast"

const TINGKAT_OPTIONS = ["TK", "1", "2", "3", "4", "5", "6"]

export default function KelasIndex() {
  const { kelasList, sekolahList } = usePage().props
  const { toast } = useToast()

  const [kelasData, setKelasData] = useState(kelasList || [])
  const [q, setQ] = useState("")
  const [sekolahId, setSekolahId] = useState("")
  const [tingkat, setTingkat] = useState("")
  const [lokal, setLokal] = useState("")

  // Pagination
  const [page, setPage] = useState(1)
  const perPage = 5

  // Dialogs
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editItem, setEditItem] = useState(null)

  // Form Create
  const [formCreate, setFormCreate] = useState({
    nama_kelas: "",
    sekolah_id: "",
    tingkat: "",
    lokal: "",
  })

  // Form Edit
  const [formEdit, setFormEdit] = useState({
    id: "",
    nama_kelas: "",
    sekolah_id: "",
    tingkat: "",
    lokal: "",
  })

  const resetFilters = () => {
    setQ("")
    setSekolahId("")
    setTingkat("")
    setLokal("")
  }

  const lokalOptionsByTingkat = useMemo(() => {
    if (tingkat === "TK") return ["Umum"]
    if (!tingkat) return ["A", "B", "C", "Umum"]
    return ["A", "B", "C"]
  }, [tingkat])

  const filteredKelas = useMemo(() => {
    let rows = kelasData || []
    if (sekolahId) rows = rows.filter((r) => r.sekolah.id === Number.parseInt(sekolahId))
    if (tingkat) rows = rows.filter((r) => r.tingkat === tingkat)
    if (lokal) rows = rows.filter((r) => r.lokal === lokal)
    if (q.trim()) {
      const term = q.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.nama_kelas.toLowerCase().includes(term) ||
          (r.sekolah?.nama_sekolah || "").toLowerCase().includes(term) ||
          r.tingkat.toLowerCase().includes(term) ||
          r.lokal.toLowerCase().includes(term),
      )
    }
    return rows
  }, [kelasData, sekolahId, tingkat, lokal, q])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredKelas.slice(start, start + perPage)
  }, [filteredKelas, page])

  const totalPages = Math.ceil(filteredKelas.length / perPage)

  const onCreate = (e) => {
    e.preventDefault()
    router.post(route("kelas.store"), formCreate, {
      onSuccess: () => {
        setKelasData([...kelasData, { ...formCreate, id: Date.now(), sekolah: sekolahList.find(s => s.id == formCreate.sekolah_id) }])
        setOpenCreate(false)
        setFormCreate({ nama_kelas: "", sekolah_id: "", tingkat: "", lokal: "" })
        toast({ title: "Kelas berhasil ditambahkan", variant: "success" })
      },
      onError: () => {
        toast({ title: "Gagal menambahkan kelas", variant: "destructive" })
      }
    })
  }

  const onEdit = (e) => {
    e.preventDefault()
    router.put(route("kelas.update", formEdit.id), formEdit, {
      onSuccess: () => {
        setKelasData(prev =>
          prev.map(k => (k.id === formEdit.id ? { ...formEdit, sekolah: sekolahList.find(s => s.id == formEdit.sekolah_id) } : k))
        )
        setOpenEdit(false)
        toast({ title: "Kelas berhasil diupdate", variant: "success" })
      },
      onError: () => {
        toast({ title: "Gagal update kelas", variant: "destructive" })
      }
    })
  }

  const onDelete = (id) => {
    if (!confirm("Yakin ingin menghapus kelas ini?")) return
    router.delete(route("kelas.destroy", id), {
      onSuccess: () => {
        setKelasData((prev) => prev.filter((k) => k.id !== id))
        toast({ title: "Kelas berhasil dihapus", variant: "success" })
      },
      onError: () => {
        toast({ title: "Gagal menghapus kelas", variant: "destructive" })
      },
    })
  }

  const openEditDialog = (k) => {
    setFormEdit({
      id: k.id,
      nama_kelas: k.nama_kelas,
      sekolah_id: k.sekolah.id,
      tingkat: k.tingkat,
      lokal: k.lokal,
    })
    setOpenEdit(true)
  }

  return (
    <AuthenticatedLayout
          header={
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Master Data kelas</h1>
          <p className="text-sm text-muted-foreground">Kelola data siswa berdasarkan sekolah, kelas, dan lokal.</p>
        </div>
      }>
      <main className="p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle>Master Data Kelas</CardTitle>
              <Button onClick={() => setOpenCreate(true)}>Tambah Kelas</Button>
            </div>
            {/* Filter */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Cari nama, sekolah, tingkat, lokal..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Select value={sekolahId} onValueChange={(v) => setSekolahId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Sekolah" />
                </SelectTrigger>
                <SelectContent>
                  {sekolahList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nama_sekolah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tingkat} onValueChange={(v) => setTingkat(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tingkat" />
                </SelectTrigger>
                <SelectContent>
                  {TINGKAT_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={lokal} onValueChange={(v) => setLokal(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Lokal" />
                </SelectTrigger>
                <SelectContent>
                  {(tingkat === "TK" ? ["Umum"] : ["A", "B", "C"]).map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filter
              </Button>
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            {paginatedData.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada data kelas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Nama Kelas</TableHead>
                    <TableHead>Sekolah</TableHead>
                    <TableHead>Tingkat</TableHead>
                    <TableHead>Lokal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((k, idx) => (
                    <TableRow key={k.id}>
                      <TableCell>{(page - 1) * perPage + idx + 1}</TableCell>
                      <TableCell>{k.nama_kelas}</TableCell>
                      <TableCell>{k.sekolah.nama_sekolah}</TableCell>
                      <TableCell>{k.tingkat}</TableCell>
                      <TableCell>{k.lokal}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => alert("Lihat siswa")}>
                          Lihat Siswa
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(k)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(k.id)}>
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        aria-disabled={page === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={page === i + 1}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        aria-disabled={page === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kelas</DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreate} className="space-y-3">
            <div>
              <Label>Nama Kelas</Label>
              <Input value={formCreate.nama_kelas} onChange={(e) => setFormCreate({ ...formCreate, nama_kelas: e.target.value })} />
            </div>
            <div>
              <Label>Sekolah</Label>
              <Select value={formCreate.sekolah_id} onValueChange={(v) => setFormCreate({ ...formCreate, sekolah_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih Sekolah" /></SelectTrigger>
                <SelectContent>
                  {sekolahList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.nama_sekolah}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tingkat</Label>
              <Select value={formCreate.tingkat} onValueChange={(v) => setFormCreate({ ...formCreate, tingkat: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger>
                <SelectContent>
                  {TINGKAT_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lokal</Label>
              <Select value={formCreate.lokal} onValueChange={(v) => setFormCreate({ ...formCreate, lokal: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih Lokal" /></SelectTrigger>
                <SelectContent>
                  {(formCreate.tingkat === "TK" ? ["Umum"] : ["A", "B", "C"]).map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Simpan</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kelas</DialogTitle>
          </DialogHeader>
          <form onSubmit={onEdit} className="space-y-3">
            <div>
              <Label>Nama Kelas</Label>
              <Input value={formEdit.nama_kelas} onChange={(e) => setFormEdit({ ...formEdit, nama_kelas: e.target.value })} />
            </div>
            <div>
              <Label>Sekolah</Label>
              <Select value={String(formEdit.sekolah_id)} onValueChange={(v) => setFormEdit({ ...formEdit, sekolah_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih Sekolah" /></SelectTrigger>
                <SelectContent>
                  {sekolahList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.nama_sekolah}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tingkat</Label>
              <Select value={formEdit.tingkat} onValueChange={(v) => setFormEdit({ ...formEdit, tingkat: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger>
                <SelectContent>
                  {TINGKAT_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lokal</Label>
              <Select value={formEdit.lokal} onValueChange={(v) => setFormEdit({ ...formEdit, lokal: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih Lokal" /></SelectTrigger>
                <SelectContent>
                  {(formEdit.tingkat === "TK" ? ["Umum"] : ["A", "B", "C"]).map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Update</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  )
}
