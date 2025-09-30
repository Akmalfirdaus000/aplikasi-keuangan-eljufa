"use client"

import { useMemo, useState, useEffect } from "react"
import { useForm, usePage, router } from "@inertiajs/react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"

const TINGKAT_OPTIONS = ["TK", "1", "2", "3", "4", "5", "6"]

export default function KelasIndex() {
  const { kelasList, sekolahList } = usePage().props

  // Toolbar state
  const [q, setQ] = useState("")
  const [sekolahId, setSekolahId] = useState("")
  const [tingkat, setTingkat] = useState("")
  const [lokal, setLokal] = useState("")

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
    let rows = kelasList || []
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
  }, [kelasList, sekolahId, tingkat, lokal, q])

  // 🔥 Grouping: Sekolah > Tingkat > Lokal
  const groupedKelas = useMemo(() => {
    const result = {}
    filteredKelas.forEach((k) => {
      if (!result[k.sekolah.id]) {
        result[k.sekolah.id] = {
          sekolah: k.sekolah,
          tingkat: {},
        }
      }
      if (!result[k.sekolah.id].tingkat[k.tingkat]) {
        result[k.sekolah.id].tingkat[k.tingkat] = {}
      }
      if (!result[k.sekolah.id].tingkat[k.tingkat][k.lokal]) {
        result[k.sekolah.id].tingkat[k.tingkat][k.lokal] = []
      }
      result[k.sekolah.id].tingkat[k.tingkat][k.lokal].push(k)
    })
    return result
  }, [filteredKelas])

  // === Create/Edit forms
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState(null)

  const createForm = useForm({ sekolah_id: "", tingkat: "", nama_kelas: "", lokal: "" })
  const editForm = useForm({ id: "", sekolah_id: "", tingkat: "", nama_kelas: "", lokal: "" })

  const [lokalCreateOpts, setLokalCreateOpts] = useState([])
  const [lokalEditOpts, setLokalEditOpts] = useState([])

  useEffect(() => {
    if (createForm.data.tingkat === "TK") {
      setLokalCreateOpts(["Umum"])
      createForm.setData("lokal", "Umum")
    } else if (createForm.data.tingkat) {
      setLokalCreateOpts(["A", "B", "C"])
      if (!["A", "B", "C"].includes(createForm.data.lokal)) createForm.setData("lokal", "")
    } else {
      setLokalCreateOpts([])
      createForm.setData("lokal", "")
    }
  }, [createForm.data.tingkat])

  useEffect(() => {
    if (editForm.data.tingkat === "TK") {
      setLokalEditOpts(["Umum"])
      editForm.setData("lokal", "Umum")
    } else if (editForm.data.tingkat) {
      setLokalEditOpts(["A", "B", "C"])
      if (!["A", "B", "C"].includes(editForm.data.lokal)) editForm.setData("lokal", "")
    } else {
      setLokalEditOpts([])
      editForm.setData("lokal", "")
    }
  }, [editForm.data.tingkat])

  const onCreate = (e) => {
    e.preventDefault()
    router.post("/kelas", createForm.data, {
      onSuccess: () => {
        setOpenCreate(false)
        createForm.reset()
      },
    })
  }

  const openEditDialog = (k) => {
    setEditing(k)
    editForm.setData({
      id: k.id,
      sekolah_id: String(k.sekolah.id),
      tingkat: k.tingkat,
      nama_kelas: k.nama_kelas,
      lokal: k.lokal,
    })
    setOpenEdit(true)
  }

  const onEdit = (e) => {
    e.preventDefault()
    router.put(`/kelas/${editForm.data.id}`, editForm.data, {
      onSuccess: () => setOpenEdit(false),
    })
  }

   const onDelete = (id) => {
     if (!confirm("Yakin ingin menghapus sekolah ini?")) return
     router.delete(route("kelas.destroy", id))
   }

  const lihatSiswa = (k) => {
    router.get(`/siswas?kelas_id=${k.id}`)
  }

  return (
    <AuthenticatedLayout>
      <main className="p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle>Master Data Kelas</CardTitle>
              <Button onClick={() => setOpenCreate(true)}>Tambah Kelas</Button>
            </div>
            {/* Toolbar filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input placeholder="Cari ..." value={q} onChange={(e) => setQ(e.target.value)} />
              <Select value={sekolahId} onValueChange={setSekolahId}>
                <SelectTrigger>
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
              <Select value={tingkat} onValueChange={setTingkat}>
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
              <Select value={lokal} onValueChange={setLokal} disabled={!lokalOptionsByTingkat.length}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Lokal" />
                </SelectTrigger>
                <SelectContent>
                  {lokalOptionsByTingkat.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* 🔥 Grouped Table */}
          <CardContent className="overflow-x-auto">
            {Object.values(groupedKelas).map((sGroup, sIdx) => (
              <div key={sGroup.sekolah.id} className="mb-6">
                <h2 className="font-bold text-lg mb-2">
                  {sIdx + 1}. {sGroup.sekolah.nama_sekolah}
                </h2>
                {Object.keys(sGroup.tingkat).map((t) => (
                  <div key={t} className="ml-4 mb-4">
                    <h3 className="font-semibold">Kelas {t}</h3>
                    {Object.keys(sGroup.tingkat[t]).map((l) => (
                      <div key={l} className="ml-6 mb-2">
                        <h4 className="font-medium">Lokal {l}</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Nama Kelas</TableHead>
                              <TableHead>Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sGroup.tingkat[t][l].map((k, idx) => (
                              <TableRow key={k.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{k.nama_kelas}</TableCell>
                                <TableCell className="space-x-2">
                                  <Button size="sm" variant="secondary" onClick={() => lihatSiswa(k)}>
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
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* === Create Dialog === */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kelas</DialogTitle>
            </DialogHeader>
            <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label>Tingkat</Label>
                <Select value={createForm.data.tingkat} onValueChange={(v) => createForm.setData("tingkat", v)}>
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
              </div>
              <div className="md:col-span-2">
                <Label>Nama Kelas</Label>
                <Input
                  placeholder="Nama Kelas"
                  value={createForm.data.nama_kelas}
                  onChange={(e) => createForm.setData("nama_kelas", e.target.value)}
                />
              </div>
              <div>
                <Label>Lokal</Label>
                <Select
                  value={createForm.data.lokal}
                  onValueChange={(v) => createForm.setData("lokal", v)}
                  disabled={!createForm.data.tingkat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Lokal" />
                  </SelectTrigger>
                  <SelectContent>
                    {lokalCreateOpts.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={createForm.processing}>
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* === Edit Dialog === */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Kelas</DialogTitle>
            </DialogHeader>
            <form onSubmit={onEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label>Tingkat</Label>
                <Select value={editForm.data.tingkat} onValueChange={(v) => editForm.setData("tingkat", v)}>
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
              </div>
              <div className="md:col-span-2">
                <Label>Nama Kelas</Label>
                <Input
                  value={editForm.data.nama_kelas}
                  onChange={(e) => editForm.setData("nama_kelas", e.target.value)}
                />
              </div>
              <div>
                <Label>Lokal</Label>
                <Select
                  value={editForm.data.lokal}
                  onValueChange={(v) => editForm.setData("lokal", v)}
                  disabled={!editForm.data.tingkat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Lokal" />
                  </SelectTrigger>
                  <SelectContent>
                    {lokalEditOpts.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={editForm.processing}>
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </AuthenticatedLayout>
  )
}
