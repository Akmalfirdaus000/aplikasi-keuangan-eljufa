"use client";
import { router, Head } from "@inertiajs/react";
import { useMemo, useState } from "react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const route = (path, params) => window.route(path, params);

export default function StudentDetail({ siswa, pembayarans }) {
  const [open, setOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);

  // nominal: pisahkan angka murni untuk submit & string untuk tampilan
  const [nominalNum, setNominalNum] = useState(0); // angka murni
  const [nominalStr, setNominalStr] = useState(""); // tampilan "1.000"

  const fmtID = useMemo(
    () =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }),
    []
  );

  // Hitung ulang ringkasan dari tagihans
  const totalTagihan = siswa.tagihans?.reduce(
    (sum, t) => sum + Number(t.total_tagihan || 0),
    0
  );
  const totalPembayaran = siswa.tagihans?.reduce(
    (sum, t) => sum + (Number(t.total_tagihan || 0) - Number(t.sisa_tagihan || 0)),
    0
  );
  const totalSisa = siswa.tagihans?.reduce(
    (sum, t) => sum + Number(t.sisa_tagihan || 0),
    0
  );

  // Input masker rupiah (tampilan 1.000, kirim angka murni)
  const onChangeNominal = (e) => {
    const raw = e.target.value || "";
    const digits = raw.replace(/\D/g, "");
    const val = digits ? parseInt(digits, 10) : 0;
    setNominalNum(val);
    setNominalStr(val > 0 ? val.toLocaleString("id-ID") : "");
  };

  const canSubmit = selectedTagihan && nominalNum > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post(
      route("pembayaran.store"),
      {
        tagihan_id: selectedTagihan,
        nominal: nominalNum, // angka murni ke backend
      },
      {
        onSuccess: () => {
          setOpen(false);
          setNominalNum(0);
          setNominalStr("");
          setSelectedTagihan(null);
          toast({
            title: "✅ Sukses",
            description: "Pembayaran berhasil disimpan",
            variant: "success",
          });
        },
        onError: () => {
          toast({
            title: "❌ Gagal",
            description: "Pembayaran gagal, coba lagi",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Detail Siswa" />
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Data Siswa */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Siswa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-semibold">Nama:</span>{" "}
              {siswa.nama_siswa}
            </p>
            <p>
              <span className="font-semibold">Kelas:</span>{" "}
              {siswa.kelas?.nama_kelas}
            </p>
            <p>
              <span className="font-semibold">Lokal:</span>{" "}
              {siswa.kelas?.lokal}
            </p>
            <p>
              <span className="font-semibold">Sekolah:</span>{" "}
              {siswa.kelas?.sekolah?.nama_sekolah}
            </p>
          </CardContent>
        </Card>

        {/* Tagihan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tagihan Siswa</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">+ Pembayaran</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Pembayaran</DialogTitle>
                  <DialogDescription>
                    Pilih kategori tagihan dan isi nominal pembayaran.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select onValueChange={setSelectedTagihan}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {siswa.tagihans
                          ?.filter((t) => t.status !== "lunas")
                          .map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.kategori?.nama_kategori} (
                              {fmtID.format(t.sisa_tagihan || 0)}
                              )
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nominal</Label>
                    <Input
                      inputMode="numeric"
                      value={nominalStr}
                      onChange={onChangeNominal}
                      placeholder="Contoh: 150.000"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {nominalNum > 0
                        ? `= ${fmtID.format(nominalNum)}`
                        : "Masukkan nominal pembayaran"}
                    </p>
                  </div>

                  <Button type="submit" disabled={!canSubmit}>
                    Simpan
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Sisa</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siswa.tagihans?.length > 0 ? (
                    siswa.tagihans.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          {t.kategori?.nama_kategori || "-"}
                        </TableCell>
                        <TableCell>{t.deskripsi || "-"}</TableCell>
                        <TableCell className="text-right">
                          {fmtID.format(Number(t.total_tagihan) || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtID.format(Number(t.sisa_tagihan) || 0)}
                        </TableCell>
                        <TableCell>
                          {t.status === "lunas" ? (
                            <Badge className="rounded-full">Lunas</Badge>
                          ) : (
                            <Badge variant="destructive" className="rounded-full">
                              Belum Lunas
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        Tidak ada data tagihan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ringkasan Keuangan */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Keuangan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Jumlah Semua Tagihan</p>
              <p className="text-lg font-semibold text-gray-800">
                {fmtID.format(totalTagihan)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Pembayaran</p>
              <p className="text-lg font-semibold text-green-600">
                {fmtID.format(totalPembayaran)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Tunggakan</p>
              <p className="text-lg font-semibold text-red-600">
                {fmtID.format(totalSisa)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold text-blue-600">
                {totalSisa === 0 ? "Lunas Semua" : "Masih Ada Tagihan"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Riwayat Pembayaran */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Kategori</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pembayarans?.length > 0 ? (
                  pembayarans.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.created_at}</TableCell>
                      <TableCell>{fmtID.format(p.nominal)}</TableCell>
                      <TableCell>{p.tagihan?.kategori?.nama_kategori}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="3" className="text-center">
                      Belum ada pembayaran
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
