"use client"

import { useState } from "react"
import { useForm, usePage, router } from "@inertiajs/react"
import { route } from "ziggy-js"
import { useToast } from "@/hooks/use-toast" // ✅ pakai dari hooks

// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"

export default function SekolahIndex() {
  const { sekolahs } = usePage().props
  const { toast } = useToast() // ✅ init toast

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState(null)

  const createForm = useForm({ nama_sekolah: "" })
  const editForm = useForm({ id: "", nama_sekolah: "" })

  // Tambah sekolah
// Tambah sekolah
const onCreate = (e) => {
  e.preventDefault()
  createForm.post(route("sekolahs.store"), {
    onSuccess: () => {
      setOpenCreate(false)
      createForm.reset()
      toast({ title: "Berhasil", description: "Sekolah berhasil ditambahkan" })
    },
    onError: () => {
      toast({ title: "Gagal", description: "Tidak bisa menambahkan sekolah", variant: "destructive" })
    },
  })
}

// Edit sekolah
const onEdit = (e) => {
  e.preventDefault()
  editForm.put(route("sekolahs.update", editForm.data.id), {
    onSuccess: () => {
      setOpenEdit(false)
      toast({ title: "Berhasil", description: "Sekolah berhasil diupdate" })
    },
    onError: () => {
      toast({ title: "Gagal", description: "Tidak bisa mengupdate sekolah", variant: "destructive" })
    },
  })
}

// Hapus sekolah
const onDelete = (id) => {
  if (!confirm("Yakin ingin menghapus sekolah ini?")) return
  router.delete(route("sekolahs.destroy", id), {
    onSuccess: () => toast({ title: "Terhapus", description: "Sekolah berhasil dihapus", variant: "destructive" }),
    onError: () => toast({ title: "Gagal", description: "Tidak bisa menghapus sekolah", variant: "destructive" }),
  })
}


  // Buka dialog edit
  const openEditDialog = (sekolah) => {
    setEditing(sekolah)
    editForm.setData({ id: sekolah.id, nama_sekolah: sekolah.nama_sekolah })
    setOpenEdit(true)
  }



  return (
    <AuthenticatedLayout className="p-4 md:p-6"
          header={
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Master Data Sekolah</h1>
          <p className="text-sm text-muted-foreground">Kelola data siswa berdasarkan sekolah, kelas, dan lokal.</p>
        </div>
      }>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-balance">Master Data Sekolah</CardTitle>
          <Button onClick={() => setOpenCreate(true)}>Tambah Sekolah</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nama Sekolah</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sekolahs?.map((s, idx) => (
                <TableRow key={s.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell className="font-medium">{s.nama_sekolah}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(s)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(s.id)}>
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Sekolah</DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreate} className="space-y-3">
            <Input
              placeholder="Nama Sekolah"
              value={createForm.data.nama_sekolah}
              onChange={(e) => createForm.setData("nama_sekolah", e.target.value)}
            />
            {createForm.errors.nama_sekolah && (
              <div className="text-sm text-red-600">{createForm.errors.nama_sekolah}</div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createForm.processing}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sekolah</DialogTitle>
          </DialogHeader>
          <form onSubmit={onEdit} className="space-y-3">
            <Input
              value={editForm.data.nama_sekolah}
              onChange={(e) => editForm.setData("nama_sekolah", e.target.value)}
            />
            {editForm.errors.nama_sekolah && <div className="text-sm text-red-600">{editForm.errors.nama_sekolah}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={editForm.processing}>
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  )
}
