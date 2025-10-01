"use client"

import { useMemo, useState } from "react"
import { usePage, router } from "@inertiajs/react"
// import { route } from "laravel-vite-plugin/inertia-helpers"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Button,
  Input,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui"
import { Label } from "@/Components/ui/label"

export default function Index() {
  const { tagihans = [], siswas = [], kategoris = [] } = usePage().props

  // Format angka ke Rupiah
  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(n || 0))

  // State form
  const [form, setForm] = useState({
    id: null,
    siswa_id: "",
    kategori_id: "",
    deskripsi: "",
    total_tagihan: "",
    sisa_tagihan: "",
    status: "Belum Lunas",
  })

  const [openModal, setOpenModal] = useState(false)

  // Toolbar filter/pencarian
  // Toolbar filter/pencarian
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterKategoriId, setFilterKategoriId] = useState("all")
  const [filterSekolah, setFilterSekolah] = useState("all")
  const [filterKelasSel, setFilterKelasSel] = useState("all")
  const [filterLokal, setFilterLokal] = useState("all")

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const payload = {
      ...form,
      total_tagihan: form.total_tagihan === "" ? "" : Number(form.total_tagihan),
      sisa_tagihan: form.sisa_tagihan === "" ? "" : Number(form.sisa_tagihan),
    }

    if (form.id) {
      router.put(route("tagihans.update", form.id), payload)
    } else {
      router.post(route("tagihans.store"), payload)
    }

    setForm({
      id: null,
      siswa_id: "",
      kategori_id: "",
      deskripsi: "",
      total_tagihan: "",
      sisa_tagihan: "",
      status: "Belum Lunas",
    })
    setOpenModal(false)
  }

  const handleEdit = (tagihan) => {
    if (!tagihan) return
    setForm({
      id: tagihan.id,
      siswa_id: tagihan.siswa_id,
      kategori_id: tagihan.kategori_id,
      deskripsi: tagihan.deskripsi || "",
      total_tagihan: tagihan.total_tagihan ?? "",
      sisa_tagihan: tagihan.sisa_tagihan ?? "",
      status: tagihan.status || "Belum Lunas",
    })
    setOpenModal(true)
  }

  const handleDelete = (id) => {
    if (!id) return
    if (confirm("Yakin ingin menghapus tagihan ini?")) {
      router.delete(route("tagihans.destroy", id))
    }
  }

  const handleQuickAdd = (siswaId, kategoriId) => {
    setForm({
      id: null,
      siswa_id: siswaId,
      kategori_id: kategoriId,
      deskripsi: "",
      total_tagihan: "",
      sisa_tagihan: "",
      status: "Belum Lunas",
    })
    setOpenModal(true)
  }
  const handleDetail = (siswaId) => {
    if (!siswaId) return
    router.visit(route("siswa.show", siswaId))
  }

  // Data per siswa dengan map tagihan per kategori (key: kategori.id)
  const siswaData = useMemo(() => {
    return siswas.map((siswa) => {
      const tagihanMap = {}
      kategoris.forEach((kategori) => {
        const t = tagihans.find((tg) => tg.siswa_id === siswa.id && tg.kategori_id === kategori.id)
        tagihanMap[kategori.id] = t || null
      })
      return { ...siswa, tagihanMap }
    })
  }, [siswas, kategoris, tagihans])

  // Tampilkan hanya kolom kategori yang dipilih jika difilter
  const displayedKategoris = useMemo(() => {
    if (filterKategoriId === "all") return kategoris
    return kategoris.filter((k) => String(k.id) === String(filterKategoriId))
  }, [kategoris, filterKategoriId])

  // Filter siswa berdasarkan pencarian (nama/kelas) — baris tetap tampil; kolom kategori bisa dibatasi oleh displayedKategoris
  const filteredSiswa = useMemo(() => {
    const q = search.trim().toLowerCase()
    return siswaData.filter((s) => {
      const namaMatch = (s.nama_siswa || "").toLowerCase().includes(q)
      const kelasMatch = (s.kelas?.nama_kelas || "").toLowerCase().includes(q)
      const sekolahMatch = (s.sekolah?.nama_sekolah || "").toLowerCase().includes(q)
      const lokalMatch = (s.lokal?.nama_lokal || "").toLowerCase().includes(q)

      // Optional: filter status — jika dipilih, siswa akan tampil hanya jika ada tagihan di displayedKategoris yg match status
      if (filterStatus !== "all") {
        const hasStatus = displayedKategoris.some((k) => {
          const t = s.tagihanMap[k.id]
          return t && t.status === filterStatus
        })
        if (!hasStatus) return false
      }

      // Filter sekolah, kelas, lokal (persis sesuai pilihan)
      if (filterSekolah !== "all" && (s.sekolah?.nama_sekolah || "") !== filterSekolah) return false
      if (filterKelasSel !== "all" && (s.kelas?.nama_kelas || "") !== filterKelasSel) return false
      if (filterLokal !== "all" && (s.lokal?.nama_lokal || "") !== filterLokal) return false

      return namaMatch || kelasMatch || sekolahMatch || lokalMatch
    })
  }, [siswaData, search, filterStatus, displayedKategoris, filterSekolah, filterKelasSel, filterLokal])

  const sekolahOptions = useMemo(() => {
    const set = new Set((siswas || []).map((s) => s.sekolah?.nama_sekolah).filter(Boolean))
    return Array.from(set)
  }, [siswas])

  const kelasOptions = useMemo(() => {
    const set = new Set((siswas || []).map((s) => s.kelas?.nama_kelas).filter(Boolean))
    return Array.from(set)
  }, [siswas])

  const lokalOptions = useMemo(() => {
    const set = new Set((siswas || []).map((s) => s.lokal?.nama_lokal).filter(Boolean))
    return Array.from(set)
  }, [siswas])

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Tagihan</h1>
          <p className="text-sm text-muted-foreground">
            Kelola tagihan per siswa berdasarkan kategori. Gunakan pencarian dan filter untuk mempercepat pekerjaan
            Anda.
          </p>
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
              placeholder="Ketik nama siswa atau kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="kategori">Kategori</Label>
            <select
              id="kategori"
              className="w-full border rounded p-2"
              value={filterKategoriId}
              onChange={(e) => setFilterKategoriId(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {kategoris.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="w-full border rounded p-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>
                    <div className="flex flex-col gap-1">
            <Label htmlFor="sekolah">Sekolah</Label>
            <select
              id="sekolah"
              className="w-full border rounded p-2"
              value={filterSekolah}
              onChange={(e) => setFilterSekolah(e.target.value)}
            >
              <option value="all">Semua Sekolah</option>
              {sekolahOptions.map((sekolah) => (
                <option key={sekolah} value={sekolah}>
                  {sekolah}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="kelas">Kelas</Label>
            <select
              id="kelas"
              className="w-full border rounded p-2"
              value={filterKelasSel}
              onChange={(e) => setFilterKelasSel(e.target.value)}
            >
              <option value="all">Semua Kelas</option>
              {kelasOptions.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
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
            >
              <option value="all">Semua Lokal</option>
              {lokalOptions.map((lokal) => (
                <option key={lokal} value={lokal}>
                  {lokal}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
               setSearch("")
                setFilterStatus("all")
                setFilterKategoriId("all")
                setFilterSekolah("all")
                setFilterKelasSel("all")
                setFilterLokal("all")
              }}
            >
              Reset
            </Button>

            <Dialog open={openModal} onOpenChange={setOpenModal}>
              <DialogTrigger asChild>
                <Button>Tambah Tagihan</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{form.id ? "Edit Tagihan" : "Tambah Tagihan"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label>Nama Siswa</Label>
                    <select
                      name="siswa_id"
                      value={form.siswa_id}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {siswas.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama_siswa} ({s.kelas?.nama_kelas})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Kategori</Label>
                    <select
                      name="kategori_id"
                      value={form.kategori_id}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {kategoris.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama_kategori}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Deskripsi</Label>
                    <Input
                      name="deskripsi"
                      value={form.deskripsi}
                      onChange={handleChange}
                      placeholder="Contoh: SPP bulan September"
                    />
                  </div>

                  <div>
                    <Label>Total Tagihan</Label>
                    <Input
                      type="number"
                      name="total_tagihan"
                      value={form.total_tagihan}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label>Sisa Tagihan</Label>
                    <Input
                      type="number"
                      name="sisa_tagihan"
                      value={form.sisa_tagihan}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                    >
                      <option value="Belum Lunas">Belum Lunas</option>
                      <option value="Lunas">Lunas</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex justify-end mt-2">
                    <Button type="submit">{form.id ? "Update" : "Simpan"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Tagihan per Siswa */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">#</TableHead>
                  <TableHead className="whitespace-nowrap">Nama Siswa</TableHead>
                  {displayedKategoris.map((k) => (
                    <TableHead key={k.id} className="whitespace-nowrap">
                      {k.nama_kategori}
                    </TableHead>
                  ))}
                  <TableHead className="whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSiswa.length > 0 ? (
                  filteredSiswa.map((siswa, index) => (
                    <TableRow key={siswa.id}>
                      <TableCell className="align-top">{index + 1}</TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col">
                          <span className="font-medium">{siswa.nama_siswa}</span>
                          <span className="text-xs text-muted-foreground">{siswa.kelas?.nama_kelas || "-"}</span>
                        </div>
                      </TableCell>

                      {/* Kolom kategori dinamis */}
                      {displayedKategoris.map((k) => {
                        const tagihan = siswa.tagihanMap[k.id]
                        return (
                          <TableCell key={`${siswa.id}-${k.id}`} className="align-top">
                            {tagihan ? (
                              <div className="flex flex-col gap-1">
                                <div className="text-sm font-medium">{tagihan.deskripsi || "-"}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatRupiah(tagihan.total_tagihan)} • Sisa {formatRupiah(tagihan.sisa_tagihan)} •{" "}
                                  {tagihan.status}
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(tagihan)}>
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDelete(tagihan.id)}>
                                    Hapus
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex">
                                <Button size="sm" variant="outline" onClick={() => handleQuickAdd(siswa.id, k.id)}>
                                  Tambah
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )
                      })}

                      {/* Aksi per siswa */}
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => handleQuickAdd(siswa.id, displayedKategoris[0]?.id || "")}>
                            Tambah Cepat
                          </Button>
                          <Button size="sm" onClick={() => handleDetail(siswa.id)}>
                            Detail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={displayedKategoris.length + 3} className="text-center">
                      Belum ada data yang cocok
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  )
}
