import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
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
} from "@/Components/ui";
import { Label } from "@/Components/ui/label";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/Components/ui/accordion";

export default function Index() {
  const { tagihans = [], siswas = [], kategoris = [] } = usePage().props;

  const [form, setForm] = useState({
    id: null,
    siswa_id: "",
    kategori_id: "",
    deskripsi: "",
    total_tagihan: "",
    sisa_tagihan: "",
    status: "Belum Lunas",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.id) {
      router.put(route("tagihans.update", form.id), form);
    } else {
      router.post(route("tagihans.store"), form);
    }
    setForm({
      id: null,
      siswa_id: "",
      kategori_id: "",
      deskripsi: "",
      total_tagihan: "",
      sisa_tagihan: "",
      status: "Belum Lunas",
    });
  };

  const handleEdit = (tagihan) => {
    setForm({
      id: tagihan.id,
      siswa_id: tagihan.siswa_id,
      kategori_id: tagihan.kategori_id,
      deskripsi: tagihan.deskripsi,
      total_tagihan: tagihan.total_tagihan,
      sisa_tagihan: tagihan.sisa_tagihan,
      status: tagihan.status,
    });
  };

  const handleDelete = (id) => {
    if (confirm("Yakin ingin menghapus tagihan ini?")) {
      router.delete(route("tagihans.destroy", id));
    }
  };

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-bold">Tagihan</h1>}>
      {/* Accordion Form */}
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="form">
          <AccordionTrigger>
            {form.id ? "Edit Tagihan" : "Tambah Tagihan"}
          </AccordionTrigger>
          <AccordionContent>
            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              {/* Pilih Siswa */}
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
                      {s.nama} ({s.kelas?.nama_kelas})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Kategori */}
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

              <div>
                <Label>Deskripsi</Label>
                <Input
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
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

              <Button type="submit">
                {form.id ? "Update" : "Simpan"}
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tabel Tagihan */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Total Tagihan</TableHead>
                <TableHead>Sisa Tagihan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tagihans.length > 0 ? (
                tagihans.map((tagihan, index) => (
                  <TableRow key={tagihan.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{tagihan.siswa?.nama_siswa || "-"}</TableCell>
                    <TableCell>{tagihan.kategori?.nama_kategori || "-"}</TableCell>
                    <TableCell>{tagihan.deskripsi || "-"}</TableCell>
                    <TableCell>{tagihan.total_tagihan}</TableCell>
                    <TableCell>{tagihan.sisa_tagihan}</TableCell>
                    <TableCell>{tagihan.status}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(tagihan)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(tagihan.id)}
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Belum ada tagihan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
}
