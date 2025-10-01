"use client"

import { useState } from "react"
import { useForm, router, usePage } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast" // pastikan hook toast sudah ada

export default function KategoriIndex() {
  const { kategoriList } = usePage().props
  const { toast } = useToast()

  const [data, setData] = useState(kategoriList || [])
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState(null)

  const createForm = useForm({ nama_kategori: "" })
  const editForm = useForm({ id: "", nama_kategori: "" })

  // === CREATE ===
  const onCreate = (e) => {
    e.preventDefault()
    router.post(route("kategoris.store"), createForm.data, {
      onSuccess: (page) => {
        // Tambahkan kategori baru ke state
        setData(prev => [...prev, page.props.kategori || createForm.data])
        toast({ title: "Berhasil", description: "Kategori berhasil ditambahkan" })
        setOpenCreate(false)
        createForm.reset()
      },
      onError: () => {
        toast({ title: "Gagal", description: "Tidak bisa menambahkan kategori", variant: "destructive" })
      }
    })
  }

  // === OPEN EDIT DIALOG ===
  const openEditDialog = (kategori) => {
    setEditing(kategori)
    editForm.setData({ id: kategori.id, nama_kategori: kategori.nama_kategori })
    setOpenEdit(true)
  }

  // === UPDATE ===
  const onEdit = (e) => {
    e.preventDefault()
    router.put(route("kategoris.update", editForm.data.id), editForm.data, {
      onSuccess: () => {
        setData(prev => prev.map(k => k.id === editForm.data.id ? { ...k, ...editForm.data } : k))
        toast({ title: "Berhasil", description: "Kategori berhasil diupdate" })
        setOpenEdit(false)
      },
      onError: () => {
        toast({ title: "Gagal", description: "Tidak bisa update kategori", variant: "destructive" })
      }
    })
  }

  // === DELETE ===
  const onDelete = (id) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return
    router.delete(route("kategoris.destroy", id), {
      onSuccess: () => {
        setData(prev => prev.filter(k => k.id !== id))
        toast({ title: "Berhasil", description: "Kategori berhasil dihapus" })
      },
      onError: () => {
        toast({ title: "Gagal", description: "Tidak bisa menghapus kategori", variant: "destructive" })
      }
    })
  }

  return (
    <AuthenticatedLayout>
      <main className="p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Master Data Kategori</CardTitle>
            <Button onClick={() => setOpenCreate(true)}>Tambah Kategori</Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((k, idx) => (
                  <TableRow key={k.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{k.nama_kategori}</TableCell>
                    <TableCell className="space-x-2">
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
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori</DialogTitle>
            </DialogHeader>
            <form onSubmit={onCreate} className="space-y-3">
              <Input
                placeholder="Nama Kategori"
                value={createForm.data.nama_kategori}
                onChange={(e) => createForm.setData("nama_kategori", e.target.value)}
              />
              {createForm.errors.nama_kategori && (
                <div className="text-sm text-red-600">{createForm.errors.nama_kategori}</div>
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
              <DialogTitle>Edit Kategori</DialogTitle>
            </DialogHeader>
            <form onSubmit={onEdit} className="space-y-3">
              <Input
                value={editForm.data.nama_kategori}
                onChange={(e) => editForm.setData("nama_kategori", e.target.value)}
              />
              {editForm.errors.nama_kategori && (
                <div className="text-sm text-red-600">{editForm.errors.nama_kategori}</div>
              )}
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
      </main>
    </AuthenticatedLayout>
  )
}
