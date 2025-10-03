"use client"

import { useMemo, useState } from "react"
import { usePage, router } from "@inertiajs/react"
import { route } from "ziggy-js"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"

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

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    sekolah_id: "",
    tingkat: "",
    lokal: "",
    nama_kelas: "",
  })

  // Pagination
  const [page, setPage] = useState(1)
  const perPage = 5

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
    if (sekolahId)
      rows = rows.filter((r) => r.sekolah.id === Number.parseInt(sekolahId))
    if (tingkat) rows = rows.filter((r) => r.tingkat === tingkat)
    if (lokal) rows = rows.filter((r) => r.lokal === lokal)
    if (q.trim()) {
      const term = q.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.nama_kelas.toLowerCase().includes(term) ||
          (r.sekolah?.nama_sekolah || "").toLowerCase().includes(term) ||
          r.tingkat.toLowerCase().includes(term) ||
          r.lokal.toLowerCase().includes(term)
      )
    }
    return rows
  }, [kelasData, sekolahId, tingkat, lokal, q])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredKelas.slice(start, start + perPage)
  }, [filteredKelas, page])

  const totalPages = Math.ceil(filteredKelas.length / perPage)

  // === CRUD Handlers ===
  const handleCreate = (e) => {
    e.preventDefault()
    router.post(
      route("kelas.store"),
      {
        sekolah_id: formData.sekolah_id,
        tingkat: formData.tingkat,
        lokal: formData.lokal,
        nama_kelas: formData.nama_kelas,
      },
      {
        onSuccess: () => {
          setOpenCreate(false)
          setFormData({ id: null, sekolah_id: "", tingkat: "", lokal: "", nama_kelas: "" })
          toast({ title: "Sukses", description: "Kelas berhasil ditambahkan", variant: "success" })
        },
        onError: () => {
          toast({ title: "Gagal", description: "Gagal menambahkan kelas", variant: "destructive" })
        },
      }
    )
  }

  const openEditDialog = (kelas) => {
    setFormData({
      id: kelas.id,
      sekolah_id: kelas.sekolah.id,
      tingkat: kelas.tingkat,
      lokal: kelas.lokal,
      nama_kelas: kelas.nama_kelas,
    })
    setOpenEdit(true)
  }

  const handleEdit = (e) => {
    e.preventDefault()
    router.put(
      route("kelas.update", formData.id),
      {
        sekolah_id: formData.sekolah_id,
        tingkat: formData.tingkat,
        lokal: formData.lokal,
        nama_kelas: formData.nama_kelas,
      },
      {
        onSuccess: () => {
          setOpenEdit(false)
          setFormData({ id: null, sekolah_id: "", tingkat: "", lokal: "", nama_kelas: "" })
          toast({ title: "Sukses", description: "Kelas berhasil diperbarui", variant: "success" })
        },
        onError: () => {
          toast({ title: "Gagal", description: "Gagal memperbarui kelas", variant: "destructive" })
        },
      }
    )
  }

  const onDelete = (id) => {
    if (!confirm("Yakin hapus kelas ini?")) return
    router.delete(route("kelas.destroy", id), {
      onSuccess: () => {
        toast({ title: "Sukses", description: "Kelas berhasil dihapus", variant: "success" })
      },
      onError: () => {
        toast({ title: "Gagal", description: "Kelas gagal dihapus", variant: "destructive" })
      },
    })
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(k)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(k.id)}
                        >
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

        {/* === Create Dialog === */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kelas</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Sekolah</Label>
                <Select
                  value={formData.sekolah_id}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, sekolah_id: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sekolah" />
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
                <Select
                  value={formData.tingkat}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, tingkat: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat" />
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
              <div>
                <Label>Lokal</Label>
                <Input
                  value={formData.lokal}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lokal: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Nama Kelas</Label>
                <Input
                  value={formData.nama_kelas}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nama_kelas: e.target.value }))
                  }
                  required
                />
              </div>
              <Button type="submit">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* === Edit Dialog === */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Kelas</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label>Sekolah</Label>
                <Select
                  value={formData.sekolah_id}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, sekolah_id: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sekolah" />
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
                <Select
                  value={formData.tingkat}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, tingkat: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat" />
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
              <div>
                <Label>Lokal</Label>
                <Input
                  value={formData.lokal}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lokal: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Nama Kelas</Label>
                <Input
                  value={formData.nama_kelas}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nama_kelas: e.target.value }))
                  }
                  required
                />
              </div>
              <Button type="submit">Update</Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </AuthenticatedLayout>
  )
}
