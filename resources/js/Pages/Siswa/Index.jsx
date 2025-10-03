"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, usePage, router } from "@inertiajs/react"
import { route } from "ziggy-js"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"

export default function SiswaIndex() {
  const { siswas, sekolahList } = usePage().props

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState(null)

  // Forms
  const createForm = useForm({ sekolah_id: "", kelas_id: "", lokal: "", nama_siswa: "" })
  const editForm = useForm({ id: "", sekolah_id: "", kelas_id: "", lokal: "", nama_siswa: "" })

  // Dependent options
  const [kelasOptionsCreate, setKelasOptionsCreate] = useState([])
  const [lokalOptionsCreate, setLokalOptionsCreate] = useState([])
  const [kelasOptionsEdit, setKelasOptionsEdit] = useState([])
  const [lokalOptionsEdit, setLokalOptionsEdit] = useState([])

  // Pagination
  const [page, setPage] = useState(1)
  const perPage = 5

  // --- CREATE DEPENDENCIES ---
  useEffect(() => {
    if (createForm.data.sekolah_id) {
      const s = sekolahList.find((x) => x.id === Number.parseInt(createForm.data.sekolah_id))
      setKelasOptionsCreate(s?.kelas || [])
      createForm.setData("kelas_id", "")
      setLokalOptionsCreate([])
      createForm.setData("lokal", "")
    }
  }, [createForm.data.sekolah_id])

  useEffect(() => {
    if (createForm.data.kelas_id) {
      const k = kelasOptionsCreate.find((x) => x.id === Number.parseInt(createForm.data.kelas_id))
      if (k) {
        if (k.tingkat === "TK") {
          setLokalOptionsCreate(["Umum"])
          createForm.setData("lokal", "Umum")
        } else {
          setLokalOptionsCreate(["A", "B", "C"])
          createForm.setData("lokal", "")
        }
      }
    }
  }, [createForm.data.kelas_id])

  // --- EDIT DEPENDENCIES ---
  useEffect(() => {
    if (editForm.data.sekolah_id) {
      const s = sekolahList.find((x) => x.id === Number.parseInt(editForm.data.sekolah_id))
      setKelasOptionsEdit(s?.kelas || [])
      editForm.setData("kelas_id", "")
      setLokalOptionsEdit([])
      editForm.setData("lokal", "")
    }
  }, [editForm.data.sekolah_id])

  useEffect(() => {
    if (editForm.data.kelas_id) {
      const k = kelasOptionsEdit.find((x) => x.id === Number.parseInt(editForm.data.kelas_id))
      if (k) {
        if (k.tingkat === "TK") {
          setLokalOptionsEdit(["Umum"])
          editForm.setData("lokal", "Umum")
        } else {
          setLokalOptionsEdit(["A", "B", "C"])
          editForm.setData("lokal", "")
        }
      }
    }
  }, [editForm.data.kelas_id])

  // CRUD Handlers
  const onCreate = (e) => {
    e.preventDefault()
    router.post(route("siswas.store"), createForm.data, {
      onSuccess: () => {
        setOpenCreate(false)
        createForm.reset()
      },
    })
  }

  const openEditDialog = (s) => {
    setEditing(s)
    editForm.setData({
      id: s.id,
      nama_siswa: s.nama_siswa,
      sekolah_id: s.kelas.sekolah.id,
      kelas_id: s.kelas.id,
      lokal: s.kelas.lokal,
    })
    setOpenEdit(true)
  }

  const onEdit = (e) => {
    e.preventDefault()
    router.put(route("siswas.update", editForm.data.id), editForm.data, {
      onSuccess: () => setOpenEdit(false),
    })
  }

  const onDelete = (id) => {
    if (!confirm("Yakin ingin menghapus siswa ini?")) return
    router.delete(route("siswas.destroy", id))
  }

  // --- FILTERS ---
  const [q, setQ] = useState("")
  const [filterSekolahId, setFilterSekolahId] = useState("")
  const [filterKelasId, setFilterKelasId] = useState("")
  const kelasOptionsFilter = useMemo(() => {
    if (!filterSekolahId) return []
    const s = sekolahList.find((x) => x.id === Number.parseInt(filterSekolahId))
    return s?.kelas || []
  }, [filterSekolahId, sekolahList])

  const filteredSiswas = useMemo(() => {
    let rows = siswas || []
    if (filterSekolahId) rows = rows.filter((r) => r.kelas.sekolah.id === Number.parseInt(filterSekolahId))
    if (filterKelasId) rows = rows.filter((r) => r.kelas.id === Number.parseInt(filterKelasId))
    if (q.trim()) {
      const term = q.toLowerCase()
      rows = rows.filter((r) => String(r.id).includes(term) || r.nama_siswa.toLowerCase().includes(term))
    }
    return rows
  }, [siswas, filterSekolahId, filterKelasId, q])

  const resetFilters = () => {
    setQ("")
    setFilterSekolahId("")
    setFilterKelasId("")
  }

  // --- PAGINATION ---
  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredSiswas.slice(start, start + perPage)
  }, [filteredSiswas, page])

  const totalPages = Math.ceil(filteredSiswas.length / perPage)

  return (
    <AuthenticatedLayout className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Master Data Siswa</CardTitle>
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
            <div className="flex gap-3 w-full">
              <Input placeholder="Cari ID/Nama" value={q} onChange={(e) => setQ(e.target.value)} />
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
              <Button onClick={() => setOpenCreate(true)}>Tambah Siswa</Button>
            </div>
            <div className="flex gap-3">
              <Select value={filterSekolahId} onValueChange={setFilterSekolahId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih Sekolah" />
                </SelectTrigger>
                <SelectContent>
                  {(sekolahList || []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nama_sekolah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterKelasId} onValueChange={setFilterKelasId} disabled={!kelasOptionsFilter.length}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasOptionsFilter.map((k) => (
                    <SelectItem key={k.id} value={String(k.id)}>
                      {k.nama_kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Sekolah</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Lokal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((s, idx) => (
                <TableRow key={s.id}>
                  <TableCell>{(page - 1) * perPage + idx + 1}</TableCell>
                  <TableCell className="font-medium">{s.nama_siswa}</TableCell>
                  <TableCell>{s.kelas.sekolah.nama_sekolah}</TableCell>
                  <TableCell>{s.kelas.nama_kelas}</TableCell>
                  <TableCell>{s.kelas.lokal}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(s)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(s.id)}>
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
                      <PaginationLink href="#" isActive={page === i + 1} onClick={() => setPage(i + 1)}>
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

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Siswa</DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreate} className="space-y-3">
            <div>
              <Label>Nama Siswa</Label>
              <Input value={createForm.data.nama_siswa} onChange={(e) => createForm.setData("nama_siswa", e.target.value)} />
            </div>
            <div>
              <Label>Sekolah</Label>
              <Select value={createForm.data.sekolah_id} onValueChange={(v) => createForm.setData("sekolah_id", v)}>
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
            </div>
            <div>
              <Label>Kelas</Label>
              <Select value={createForm.data.kelas_id} onValueChange={(v) => createForm.setData("kelas_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasOptionsCreate.map((k) => (
                    <SelectItem key={k.id} value={String(k.id)}>
                      {k.nama_kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lokal</Label>
              <Select value={createForm.data.lokal} onValueChange={(v) => createForm.setData("lokal", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Lokal" />
                </SelectTrigger>
                <SelectContent>
                  {lokalOptionsCreate.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
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
            <DialogTitle>Edit Siswa</DialogTitle>
          </DialogHeader>
          <form onSubmit={onEdit} className="space-y-3">
            <div>
              <Label>Nama Siswa</Label>
              <Input value={editForm.data.nama_siswa} onChange={(e) => editForm.setData("nama_siswa", e.target.value)} />
            </div>
            <div>
              <Label>Sekolah</Label>
              <Select value={editForm.data.sekolah_id} onValueChange={(v) => editForm.setData("sekolah_id", v)}>
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
            </div>
            <div>
              <Label>Kelas</Label>
              <Select value={editForm.data.kelas_id} onValueChange={(v) => editForm.setData("kelas_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasOptionsEdit.map((k) => (
                    <SelectItem key={k.id} value={String(k.id)}>
                      {k.nama_kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lokal</Label>
              <Select value={editForm.data.lokal} onValueChange={(v) => editForm.setData("lokal", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Lokal" />
                </SelectTrigger>
                <SelectContent>
                  {lokalOptionsEdit.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
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
