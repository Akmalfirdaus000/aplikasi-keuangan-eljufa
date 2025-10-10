"use client";

import { useMemo, useState } from "react";
import { usePage, router, Head } from "@inertiajs/react";
import { route } from "ziggy-js";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

function rupiah(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    .format(Number(n || 0));
}

export default function LaporanPengeluaranPage() {
  const { rows = [], summary = [], filters = {}, kategoriOptions = [] } = usePage().props;

  // ====== State filter (default dari server) ======
  const [from, setFrom] = useState(filters.from || "");
  const [to, setTo] = useState(filters.to || "");
  const [kategori, setKategori] = useState(String(filters.kategori ?? "all"));
  const [search, setSearch] = useState(filters.search || "");

  // Build opsi kategori kalau controller tidak mengirim kategoriOptions:
  // ambil unik dari rows (id & nama)
  const computedKategoriOptions = useMemo(() => {
    if (Array.isArray(kategoriOptions) && kategoriOptions.length) return kategoriOptions;
    const map = new Map(); // id->nama
    rows.forEach(r => {
      const id = String(r?.kategori?.id ?? "");
      const nama = r?.kategori?.nama ?? "";
      if (id && nama && !map.has(id)) map.set(id, nama);
    });
    return Array.from(map.entries()).map(([id, nama]) => ({ id, nama }));
  }, [rows, kategoriOptions]);

  // Terapkan filter (server-side)
  const onApply = () => {
    router.get(
      route("laporan.pengeluaran"),
      {
        from: from || undefined,
        to: to || undefined,
        kategori: kategori,
        search: search || undefined,
      },
      { preserveScroll: true, preserveState: true }
    );
  };

  // Hitung total baris yang tampil (rows sudah difilter di server)
  const totalTampil = useMemo(() => rows.reduce((a, r) => a + (Number(r.jumlah || 0)), 0), [rows]);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Laporan Pengeluaran</h1>
          <p className="text-sm text-muted-foreground">Rekap & detail pengeluaran dengan filter dan ekspor.</p>
        </div>
      }
    >
      <Head title="Laporan Pengeluaran" />

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* ===== Filter Bar ===== */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Filter</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <div>
              <Label className="text-xs">Dari Tanggal</Label>
              <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Sampai Tanggal</Label>
              <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Kategori</Label>
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {computedKategoriOptions.map(opt => (
                    <SelectItem key={String(opt.id)} value={String(opt.id)}>{opt.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Cari</Label>
              <Input placeholder="Deskripsi / metode / kategori / user..." value={search} onChange={(e)=>setSearch(e.target.value)} />
            </div>

            <div className="md:col-span-5 flex items-center gap-2 pt-1">
              <Button onClick={onApply}>Terapkan</Button>

              {/* Ekspor */}
              <Button variant="secondary">
                <a
                  href={route("laporan.pengeluaran.export.excel", {
                    from: from || undefined,
                    to: to || undefined,
                    kategori,
                    search: search || undefined,
                  })}
                  target="_blank"
                  rel="noopener"
                >
                  Export Excel
                </a>
              </Button>
              {/* <Button variant="secondary">
                <a
                  href={route("laporan.pengeluaran.export.pdf", {
                    from: from || undefined,
                    to: to || undefined,
                    kategori,
                    search: search || undefined,
                  })}
                  target="_blank"
                  rel="noopener"
                >
                  Export PDF
                </a>
              </Button> */}

              <div className="ml-auto text-sm text-muted-foreground">
                Total ditampilkan: <span className="font-semibold">{rupiah(totalTampil)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== Rekap per Kategori ===== */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rekap per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Array.isArray(summary) && summary.length ? (
              summary.map((s, i) => (
                <Badge key={`${s.nama}-${i}`} variant="outline" className="gap-2">
                  <span className="text-xs">{s.nama || "(Tanpa Kategori)"}:</span>
                  <span className="font-medium">{rupiah(s.total || 0)}</span>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada rekap untuk filter ini.</p>
            )}
          </CardContent>
        </Card>

        {/* ===== Tabel Detail ===== */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Detail Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.tanggal || "-"}</TableCell>
                      <TableCell>{r.kategori?.nama || "-"}</TableCell>
                      <TableCell>{r.metode || "-"}</TableCell>
                      <TableCell className="max-w-[320px] truncate" title={r.keterangan || ""}>
                        {r.keterangan || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">{rupiah(r.jumlah)}</TableCell>
                      <TableCell>{r.user?.name || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Tidak ada data untuk filter ini
                    </TableCell>
                  </TableRow>
                )}

                {rows.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-semibold">
                      Jumlah Keseluruhan
                    </TableCell>
                    <TableCell className="text-right font-extrabold">{rupiah(totalTampil)}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </AuthenticatedLayout>
  );
}
