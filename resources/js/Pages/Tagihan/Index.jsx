  "use client"

  import { useMemo, useState, useEffect } from "react"
  import { usePage, router } from "@inertiajs/react"
  import { useToast } from "@/hooks/use-toast"
  import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
  import {
    Card, CardHeader, CardTitle, CardContent,
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
    Button, Input, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  } from "@/Components/ui"
  import { Label } from "@/Components/ui/label"
  import {
    Pagination, PaginationContent, PaginationItem, PaginationLink,
    PaginationPrevious, PaginationNext, PaginationEllipsis,
  } from "@/Components/ui/pagination"

  export default function Index() {
    const { siswas = [], kategoris = [], tagihansRaw = [], build_id, flash } = usePage().props
    const { toast } = useToast()

    // Optional: verifikasi props & tampilkan flash dari server
    useEffect(() => {
      if (flash?.success) toast({ title: "Sukses", description: flash.success })
      if (flash?.error) toast({ title: "Gagal", description: flash.error, variant: "destructive" })
      console.log("BUILD_ID_PROD", build_id)
    }, [flash, build_id])

    const formatRupiah = (n) =>
      new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
        .format(Number(n || 0))

    // Form
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

    // Pagination & filters
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterKategoriId, setFilterKategoriId] = useState("all")
    const [filterSekolah, setFilterSekolah] = useState("all")
    const [filterKelasSel, setFilterKelasSel] = useState("all")
    const [filterLokal, setFilterLokal] = useState("all")

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = (e) => {
      e.preventDefault()
      const payload = {
        ...form,
        total_tagihan: form.total_tagihan === "" ? "" : Number(form.total_tagihan),
        sisa_tagihan: form.sisa_tagihan === "" ? "" : Number(form.sisa_tagihan),
        status: form.status === "Belum Lunas" ? "belum_lunas" : "lunas",
      }

      const onSuccess = () => {
        toast({
          title: form.id ? "Berhasil diperbarui" : "Berhasil disimpan",
          description: form.id ? "Tagihan berhasil diperbarui." : "Tagihan baru berhasil dibuat.",
        })
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

      const onError = (errors) => {
        const msg = Object.values(errors || {})[0] || "Terjadi kesalahan."
        toast({ title: "Gagal", description: String(msg), variant: "destructive" })
      }

      if (form.id) {
        router.put(route("tagihans.update", form.id), payload, { onSuccess, onError, preserveScroll: true })
      } else {
        router.post(route("tagihans.store"), payload, { onSuccess, onError, preserveScroll: true })
      }
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
        status: tagihan.status === "belum_lunas" ? "Belum Lunas" : "Lunas",
      })
      setOpenModal(true)
    }

    const handleDelete = (id) => {
      if (!id) return
      if (!confirm("Yakin ingin menghapus tagihan ini?")) return

      router.delete(route("tagihans.destroy", id), {
        preserveScroll: true,
        onSuccess: () => toast({ title: "Terhapus", description: "Tagihan berhasil dihapus" }),
        onError: () => toast({ title: "Gagal", description: "Tidak bisa menghapus tagihan", variant: "destructive" }),
      })
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

    // Fallback index dari tagihansRaw (kalau tagihanMap kosong)
    const tagihanIndex = useMemo(() => {
      const bySiswa = new Map()
      for (const t of tagihansRaw) {
        const sid = Number(t.siswa_id)
        const kid = Number(t.kategori_id)
        if (!bySiswa.has(sid)) bySiswa.set(sid, new Map())
        bySiswa.get(sid).set(kid, t)
      }
      return bySiswa
    }, [tagihansRaw])

    // Siswa + tagihanMap: jika kosong, isi dari index
    const siswaData = useMemo(() => {
      return (siswas || []).map((s) => {
        const out = { ...s }
        const isEmptyMap = !s.tagihanMap || Object.keys(s.tagihanMap).length === 0
        if (isEmptyMap) {
          const bucket = tagihanIndex.get(Number(s.id)) || new Map()
          const map = {}
          for (const k of (kategoris || [])) map[Number(k.id)] = bucket.get(Number(k.id)) || null
          out.tagihanMap = map
        }
        return out
      })
    }, [siswas, kategoris, tagihanIndex])

    // Kategori ditampilkan
    const displayedKategoris = useMemo(() => {
      if (filterKategoriId === "all") return kategoris
      return kategoris.filter((k) => String(k.id) === String(filterKategoriId))
    }, [kategoris, filterKategoriId])

    // Filter baris siswa
    const filteredSiswa = useMemo(() => {
      const q = search.trim().toLowerCase()
      return (siswaData || []).filter((s) => {
        const namaMatch = (s.nama_siswa || "").toLowerCase().includes(q)
        const kelasMatch = (s.kelas?.nama_kelas || "").toLowerCase().includes(q)
        const sekolahMatch = (s.kelas?.sekolah?.nama_sekolah || "").toLowerCase().includes(q)
        const lokalMatch = (s.lokal?.nama_lokal || "").toLowerCase().includes(q)

        if (filterStatus !== "all") {
          const hasStatus = displayedKategoris.some((k) => {
            const t = s.tagihanMap?.[Number(k.id)]
            const st = t?.status === "belum_lunas" ? "Belum Lunas" : t?.status === "lunas" ? "Lunas" : ""
            return t && st === filterStatus
          })
          if (!hasStatus) return false
        }

        if (filterSekolah !== "all" && (s.kelas?.sekolah?.nama_sekolah || "") !== filterSekolah) return false
        if (filterKelasSel !== "all" && (s.kelas?.nama_kelas || "") !== filterKelasSel) return false
        if (filterLokal !== "all" && (s.lokal?.nama_lokal || "") !== filterLokal) return false

        return namaMatch || kelasMatch || sekolahMatch || lokalMatch
      })
    }, [siswaData, search, filterStatus, displayedKategoris, filterSekolah, filterKelasSel, filterLokal])

    const sekolahOptions = useMemo(() => {
      const set = new Set((siswas || []).map((s) => s.kelas?.sekolah?.nama_sekolah).filter(Boolean))
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

    // Pagination
    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredSiswa.length / pageSize)), [filteredSiswa.length])
    const currentPage = useMemo(() => Math.min(page, totalPages), [page, totalPages])
    const pageOffset = useMemo(() => (currentPage - 1) * pageSize, [currentPage, pageSize])
    const paginatedSiswa = useMemo(
      () => filteredSiswa.slice(pageOffset, pageOffset + pageSize),
      [filteredSiswa, pageOffset, pageSize]
    )
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

    useEffect(() => {
      setPage(1)
    }, [search, filterStatus, filterKategoriId, filterSekolah, filterKelasSel, filterLokal])

    return (
      <AuthenticatedLayout
        header={
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Tagihan aaaaaaaaaaaaaaaa</h1>
            <p className="text-sm text-muted-foreground">Kelola tagihan per siswa berdasarkan kategori.</p>
          </div>
        }
      >
        {/* Toolbar */}
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
                  <option key={k.id} value={String(k.id)}>
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
                        {siswaData.map((s) => (
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
                          <option key={k.id} value={String(k.id)}>
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

        {/* Tabel */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    {displayedKategoris.map((k) => (
                      <TableHead key={String(k.id)} className="whitespace-nowrap">
                        {k.nama_kategori}
                      </TableHead>
                    ))}
                    <TableHead className="whitespace-nowrap">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSiswa.length > 0 ? (
                    paginatedSiswa.map((siswa, index) => (
                      <TableRow key={siswa.id}>
                        <TableCell className="align-top">{index + 1 + pageOffset}</TableCell>
                        <TableCell className="align-top">
                          <div className="flex flex-col">
                            <span className="font-medium">{siswa.nama_siswa}</span>
                            <span className="text-xs text-muted-foreground">
                              {siswa.kelas?.nama_kelas || "-"}
                            </span>
                          </div>
                        </TableCell>

                        {displayedKategoris.map((k) => {
                          const tagihan = siswa.tagihanMap?.[Number(k.id)] || null
                          return (
                            <TableCell key={`${siswa.id}-${String(k.id)}`} className="align-top">
                              {tagihan ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm font-medium">{tagihan.deskripsi || "-"}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatRupiah(tagihan.total_tagihan)} • Sisa {formatRupiah(tagihan.sisa_tagihan)} •{" "}
                                    {tagihan.status === "belum_lunas" ? "Belum Lunas" : "Lunas"}
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleQuickAdd(siswa.id, k.id)}
                                  >
                                    Tambah
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          )
                        })}

                        <TableCell className="align-top">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleQuickAdd(siswa.id, displayedKategoris[0]?.id || "")}
                            >
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

            {/* Pagination */}
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
          </CardContent>
        </Card>
      </AuthenticatedLayout>
    )
  }
