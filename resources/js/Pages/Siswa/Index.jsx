"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, usePage, router } from "@inertiajs/react"
import { route } from "ziggy-js"
import { useToast } from "@/hooks/use-toast"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"

import {
  Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  PaginationEllipsis,
} from "@/components/ui/pagination"

export default function SiswaIndex() {
  const { siswas = [], sekolahList = [], flash } = usePage().props
  const { toast } = useToast()

  // Dialog states
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)

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
  const perPage = 10

  // Flash -> toast
  useEffect(() => {
    if (flash?.success) toast({ title: "Sukses", description: flash.success })
    if (flash?.error) toast({ title: "Gagal", description: flash.error, variant: "destructive" })
  }, [flash])

  /* =========================
     CREATE: dependent selects
     ========================= */
  useEffect(() => {
    const sid = Number.parseInt(createForm.data.sekolah_id)
    const s = sekolahList.find((x) => x.id === sid)
    setKelasOptionsCreate(s?.kelas || [])
    // reset bawah
    createForm.setData("kelas_id", "")
    setLokalOptionsCreate([])
    createForm.setData("lokal", "")
  }, [createForm.data.sekolah_id])

  useEffect(() => {
    const kid = Number.parseInt(createForm.data.kelas_id)
    const k = kelasOptionsCreate.find((x) => x.id === kid)
    if (!k) {
      setLokalOptionsCreate([])
      createForm.setData("lokal", "")
      return
    }
    // Aturan lokal sesuai contohmu
    if (k.tingkat === "TK") {
      setLokalOptionsCreate(["Umum"])
      createForm.setData("lokal", "Umum")
    } else {
      setLokalOptionsCreate(["A", "B", "C"])
      createForm.setData("lokal", "")
    }
  }, [createForm.data.kelas_id])

  /* =======================
     EDIT: dependent selects
     ======================= */
  useEffect(() => {
    const sid = Number.parseInt(editForm.data.sekolah_id)
    const s = sekolahList.find((x) => x.id === sid)
    setKelasOptionsEdit(s?.kelas || [])
    // jangan reset kalau sedang load dari openEditDialog
    if (openEdit) {
      // biarkan kelas & lokal seperti di data edit
    } else {
      editForm.setData("kelas_id", "")
      setLokalOptionsEdit([])
      editForm.setData("lokal", "")
    }
  }, [editForm.data.sekolah_id])

  useEffect(() => {
    const kid = Number.parseInt(editForm.data.kelas_id)
    const k = kelasOptionsEdit.find((x) => x.id === kid)
    if (!k) {
      setLokalOptionsEdit([])
      editForm.setData("lokal", "")
      return
    }
    if (k.tingkat === "TK") {
      setLokalOptionsEdit(["Umum"])
      if (!editForm.data.lokal) editForm.setData("lokal", "Umum")
    } else {
      setLokalOptionsEdit(["A", "B", "C"])
      // biarkan user memilih
    }
  }, [editForm.data.kelas_id])

  /* ======= CRUD ======= */
  const onCreate = (e) => {
    e.preventDefault()
    router.post(route("siswas.store"), createForm.data, {
      onSuccess: () => {
        toast({ title: "Berhasil", description: "Siswa berhasil ditambahkan" })
        setOpenCreate(false)
        createForm.reset()
      },
      onError: (errors) => {
        const msg = Object.values(errors || {})[0] || "Gagal menambah siswa"
        toast({ title: "Gagal", description: String(msg), variant: "destructive" })
      },
      preserveScroll: true,
    })
  }

  const openEditDialog = (s) => {
    editForm.setData({
      id: s.id,
      nama_siswa: s.nama_siswa,
      sekolah_id: String(s.kelas?.sekolah?.id || ""),
      kelas_id: String(s.kelas?.id || ""),
      lokal: s.kelas?.lokal || "",
    })
    // init dependent
    const sObj = sekolahList.find((x) => x.id === s.kelas?.sekolah?.id)
    setKelasOptionsEdit(sObj?.kelas || [])
    const kObj = sObj?.kelas?.find((x) => x.id === s.kelas?.id)
    if (kObj?.tingkat === "TK") setLokalOptionsEdit(["Umum"])
    else setLokalOptionsEdit(["A", "B", "C"])
    setOpenEdit(true)
  }

  const onEdit = (e) => {
    e.preventDefault()
    router.put(route("siswas.update", editForm.data.id), editForm.data, {
      onSuccess: () => {
        toast({ title: "Berhasil", description: "Siswa berhasil diperbarui" })
        setOpenEdit(false)
      },
      onError: (errors) => {
        const msg = Object.values(errors || {})[0] || "Gagal memperbarui siswa"
        toast({ title: "Gagal", description: String(msg), variant: "destructive" })
      },
      preserveScroll: true,
    })
  }

  const onDelete = (id) => {
    if (!confirm("Yakin ingin menghapus siswa ini?")) return
    router.delete(route("siswas.destroy", id), {
      onSuccess: () => toast({ title: "Terhapus", description: "Siswa berhasil dihapus" }),
      onError: () => toast({ title: "Gagal", description: "Tidak bisa menghapus siswa", variant: "destructive" }),
      preserveScroll: true,
    })
  }

  /* ======= FILTERS ala Tagihan ======= */
  const [search, setSearch] = useState("")
  const [filterKategoriId, setFilterKategoriId] = useState("all") // placeholder agar konsisten UI
  const [filterStatus, setFilterStatus] = useState("all") // placeholder agar konsisten UI
  const [filterSekolahId, setFilterSekolahId] = useState("all")
  const [filterKelasId, setFilterKelasId] = useState("all")
  const [filterLokal, setFilterLokal] = useState("all")

  // Kelas filter options depend on sekolah
  const kelasOptionsFilter = useMemo(() => {
    if (filterSekolahId === "all") return []
    const sid = Number.parseInt(filterSekolahId)
    const s = sekolahList.find((x) => x.id === sid)
    return s?.kelas || []
  }, [filterSekolahId, sekolahList])

  // Lokal options (unik) dari data siswa saat ini, optionally bergantung Kelas/Sekolah terpilih
  const lokalOptionsFilter = useMemo(() => {
    let pool = siswas || []
    if (filterSekolahId !== "all") {
      const sid = Number.parseInt(filterSekolahId)
      pool = pool.filter((r) => r.kelas?.sekolah?.id === sid)
    }
    if (filterKelasId !== "all") {
      const kid = Number.parseInt(filterKelasId)
      pool = pool.filter((r) => r.kelas?.id === kid)
    }
    const set = new Set(pool.map((r) => r.kelas?.lokal).filter(Boolean))
    return Array.from(set)
  }, [siswas, filterSekolahId, filterKelasId])

  const filteredSiswas = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = siswas || []

    // Cari nama/kelas/sekolah/lokal
    if (q) {
      rows = rows.filter((r) => {
        const nama = (r.nama_siswa || "").toLowerCase()
        const kelas = (r.kelas?.nama_kelas || "").toLowerCase()
        const sekolah = (r.kelas?.sekolah?.nama_sekolah || "").toLowerCase()
        const lokal = (r.kelas?.lokal || "").toLowerCase()
        return nama.includes(q) || kelas.includes(q) || sekolah.includes(q) || lokal.includes(q)
      })
    }

    // Placeholder kategori & status tidak memfilter apa pun
    // Sekolah
    if (filterSekolahId !== "all") {
      const sid = Number.parseInt(filterSekolahId)
      rows = rows.filter((r) => r.kelas?.sekolah?.id === sid)
    }
    // Kelas
    if (filterKelasId !== "all") {
      const kid = Number.parseInt(filterKelasId)
      rows = rows.filter((r) => r.kelas?.id === kid)
    }
    // Lokal
    if (filterLokal !== "all") {
      rows = rows.filter((r) => (r.kelas?.lokal || "") === filterLokal)
    }

    return rows
  }, [siswas, search, filterSekolahId, filterKelasId, filterLokal])

  const resetFilters = () => {
    setSearch("")
    setFilterKategoriId("all")
    setFilterStatus("all")
    setFilterSekolahId("all")
    setFilterKelasId("all")
    setFilterLokal("all")
    setPage(1)
  }

  // Pagination with ellipsis like Tagihan
  const totalPages = Math.max(1, Math.ceil(filteredSiswas.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const pageOffset = (currentPage - 1) * perPage
  const pageNumbers = useMemo(() => {
    const total = totalPages
    const curr = currentPage
    const range = []
    const start = Math.max(1, curr - 2)
    const end = Math.min(total, curr + 2)
    for (let i = start; i <= end; i++) range.push(i)
    if (!range.includes(1)) range.unshift(1, "start-ellipsis")
    if (!range.includes(total)) range.push("end-ellipsis", total)
    return range
  }, [currentPage, totalPages])

  const paginatedData = useMemo(() => {
    return filteredSiswas.slice(pageOffset, pageOffset + perPage)
  }, [filteredSiswas, pageOffset, perPage])

  useEffect(() => {
    setPage(1)
  }, [search, filterSekolahId, filterKelasId, filterLokal])

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Master Data Siswa</h1>
          <p className="text-sm text-muted-foreground">Kelola data siswa berdasarkan sekolah, kelas, dan lokal.</p>
        </div>
      }
    >
      {/* Toolbar & Trigger Modal */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="search">Cari siswa/kelas</Label>
            <Input
              id="search"
              placeholder="Ketik nama siswa, kelas, sekolah, atau lokal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Placeholder agar UI konsisten dengan halaman Tagihan */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="kategori">Kategori</Label>
            <select
              id="kategori"
              className="w-full border rounded p-2 opacity-70"
              value={filterKategoriId}
              onChange={(e) => setFilterKategoriId(e.target.value)}
              disabled
              title="Tidak digunakan di halaman siswa"
            >
              <option value="all">Semua Kategori</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="w-full border rounded p-2 opacity-70"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              disabled
              title="Tidak digunakan di halaman siswa"
            >
              <option value="all">Semua Status</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="sekolah">Sekolah</Label>
            <select
              id="sekolah"
              className="w-full border rounded p-2"
              value={filterSekolahId}
              onChange={(e) => setFilterSekolahId(e.target.value)}
            >
              <option value="all">Semua Sekolah</option>
              {sekolahList.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.nama_sekolah}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="kelas">Kelas</Label>
            <select
              id="kelas"
              className="w-full border rounded p-2"
              value={filterKelasId}
              onChange={(e) => setFilterKelasId(e.target.value)}
              disabled={filterSekolahId === "all"}
            >
              <option value="all">Semua Kelas</option>
              {kelasOptionsFilter.map((k) => (
                <option key={k.id} value={String(k.id)}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="lokal">Lokal</Label>
            <select
              id="lokal"
              className="w-full border rounded p-2"
              value={filterLokal}
              onChange={(e) => setFilterLokal(e.target.value)}
              disabled={filterSekolahId === "all"}
            >
              <option value="all">Semua Lokal</option>
              {lokalOptionsFilter.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={resetFilters}>Reset</Button>

            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button>Tambah Siswa</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader><DialogTitle>Tambah Siswa</DialogTitle></DialogHeader>
                <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="md:col-span-2">
                    <Label>Nama Siswa</Label>
                    <Input
                      value={createForm.data.nama_siswa}
                      onChange={(e) => createForm.setData("nama_siswa", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Sekolah</Label>
                    <Select value={createForm.data.sekolah_id} onValueChange={(v) => createForm.setData("sekolah_id", v)}>
                      <SelectTrigger><SelectValue placeholder="Pilih Sekolah" /></SelectTrigger>
                      <SelectContent>
                        {sekolahList.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.nama_sekolah}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Kelas</Label>
                    <Select
                      value={createForm.data.kelas_id}
                      onValueChange={(v) => createForm.setData("kelas_id", v)}
                      disabled={!kelasOptionsCreate.length}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                      <SelectContent>
                        {kelasOptionsCreate.map((k) => (
                          <SelectItem key={k.id} value={String(k.id)}>{k.nama_kelas}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Lokal</Label>
                    <Select
                      value={createForm.data.lokal}
                      onValueChange={(v) => createForm.setData("lokal", v)}
                      disabled={!lokalOptionsCreate.length}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih Lokal" /></SelectTrigger>
                      <SelectContent>
                        {lokalOptionsCreate.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit">Simpan</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Siswa */}
      <Card>
        <CardHeader><CardTitle>Daftar Siswa</CardTitle></CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Sekolah</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Lokal</TableHead>
                  <TableHead className="whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length ? (
                  paginatedData.map((s, idx) => (
                    <TableRow key={s.id}>
                      <TableCell>{pageOffset + idx + 1}</TableCell>
                      <TableCell className="font-medium">{s.nama_siswa}</TableCell>
                      <TableCell>{s.kelas?.sekolah?.nama_sekolah || "-"}</TableCell>
                      <TableCell>{s.kelas?.nama_kelas || "-"}</TableCell>
                      <TableCell>{s.kelas?.lokal || "-"}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(s)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(s.id)}>Hapus</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Tidak ada data yang cocok</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-disabled={currentPage <= 1}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {pageNumbers.map((p, i) =>
                    typeof p === "number" ? (
                      <PaginationItem key={p}>
                        <PaginationLink isActive={p === currentPage} onClick={() => setPage(p)}>
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={`${p}-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      aria-disabled={currentPage >= totalPages}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit Siswa</DialogTitle></DialogHeader>
          <form onSubmit={onEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="md:col-span-2">
              <Label>Nama Siswa</Label>
              <Input
                value={editForm.data.nama_siswa}
                onChange={(e) => editForm.setData("nama_siswa", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Sekolah</Label>
              <Select value={editForm.data.sekolah_id} onValueChange={(v) => editForm.setData("sekolah_id", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih Sekolah" /></SelectTrigger>
                <SelectContent>
                  {sekolahList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.nama_sekolah}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Kelas</Label>
              <Select
                value={editForm.data.kelas_id}
                onValueChange={(v) => editForm.setData("kelas_id", v)}
                disabled={!kelasOptionsEdit.length}
              >
                <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                <SelectContent>
                  {kelasOptionsEdit.map((k) => (
                    <SelectItem key={k.id} value={String(k.id)}>{k.nama_kelas}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lokal</Label>
              <Select
                value={editForm.data.lokal}
                onValueChange={(v) => editForm.setData("lokal", v)}
                disabled={!lokalOptionsEdit.length}
              >
                <SelectTrigger><SelectValue placeholder="Pilih Lokal" /></SelectTrigger>
                <SelectContent>
                  {lokalOptionsEdit.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  )
}
