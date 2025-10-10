"use client";

import { useMemo, useState, useEffect } from "react";
import { usePage, router,Head } from "@inertiajs/react";
import { route } from "ziggy-js";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import FiltersCardKategori from "./components/FiltersComponent";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function LaporanPerKategoriIndex() {
  const {
    rows = [],
    sekolahList = [],
    kategoriList = [],
    filters = {}, // {sekolah_id, kelas_id, lokal, kategori_id, from, to, search, perPage}
  } = usePage().props;

  // === state filter pakai ID ===
  const [filterSekolahId, setFilterSekolahId] = useState(String(filters.sekolah_id ?? "all"));
  const [filterKelasId,   setFilterKelasId]   = useState(String(filters.kelas_id   ?? "all"));
  const [filterLokal,     setFilterLokal]     = useState(String(filters.lokal      ?? "all"));
  const [filterKategoriId,setFilterKategoriId]= useState(String(filters.kategori_id?? "all"));
  const [dateFrom, setDateFrom]               = useState(filters.from   ?? "");
  const [dateTo,   setDateTo]                 = useState(filters.to     ?? "");
  const [search,   setSearch]                 = useState(filters.search ?? "");

  // opsi kelas/lokal diturunkan dari sekolah terpilih (berdasarkan ID)
  const kelasOptions = useMemo(() => {
    if (filterSekolahId === "all") return [];
    const s = (sekolahList || []).find(x => String(x.id) === String(filterSekolahId));
    return (s?.kelas || []).map(k => ({ id: String(k.id), nama: k.nama_kelas, lokal: k.lokal }));
  }, [filterSekolahId, sekolahList]);

  const lokalOptions = useMemo(() => {
    if (filterSekolahId === "all") return [];
    const s = (sekolahList || []).find(x => String(x.id) === String(filterSekolahId));
    const set = new Set((s?.kelas || []).map(k => k.lokal).filter(Boolean));
    return Array.from(set);
  }, [filterSekolahId, sekolahList]);

  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  // --- Normalisasi rows dari server
  const normalized = useMemo(
    () =>
      (rows || []).map((r) => ({
        ...r,
        tanggal: r.tanggal || r.tanggal_bayar || null,
        jumlah: Number(r.jumlah ?? r.nominal ?? 0),
        kategori:
          r.kategori ||
          (r.kategori_nama ? { id: r.kategori_id, nama: r.kategori_nama } : null),
        siswa:
          r.siswa ||
          (r.siswa_nama ? { id: r.siswa_id, nama: r.siswa_nama } : null),
        sekolah:
          r.sekolah ||
          (r.sekolah_nama ? { id: r.sekolah_id, nama: r.sekolah_nama } : null),
        kelas:
          r.kelas ||
          (r.kelas_nama ? { id: r.kelas_id, nama: r.kelas_nama, lokal: r.lokal } : null),
      })),
    [rows]
  );

  // --- Filter client
  const filtered = useMemo(() => {
    let data = normalized;
    if (dateFrom) data = data.filter((r) => r.tanggal && new Date(r.tanggal) >= new Date(dateFrom));
    if (dateTo)   data = data.filter((r) => r.tanggal && new Date(r.tanggal) <= new Date(dateTo + "T23:59:59"));
    if (filterSekolahId !== "all")
      data = data.filter((r) => String(r.sekolah?.id || "") === String(filterSekolahId));
    if (filterKelasId !== "all")
      data = data.filter((r) => String(r.kelas?.id || "") === String(filterKelasId));
    if (filterLokal !== "all")
      data = data.filter((r) => (r.kelas?.lokal || "") === filterLokal);
    if (filterKategoriId !== "all" && filterKategoriId !== "")
      data = data.filter((r) => String(r.kategori?.id || "") === String(filterKategoriId));

    const q = search.trim().toLowerCase();
    if (q)
      data = data.filter((r) => {
        const s = (r.siswa?.nama || "").toLowerCase();
        const k = (r.kategori?.nama || "").toLowerCase();
        const ket = (r.keterangan || "").toLowerCase();
        const kl = (r.kelas?.nama || "").toLowerCase();
        const sk = (r.sekolah?.nama || "").toLowerCase();
        return s.includes(q) || k.includes(q) || ket.includes(q) || kl.includes(q) || sk.includes(q);
      });
    return data;
  }, [normalized, dateFrom, dateTo, filterSekolahId, filterKelasId, filterLokal, filterKategoriId, search]);

  const totalNominal = useMemo(
    () => filtered.reduce((a, b) => a + (b.jumlah || 0), 0),
    [filtered]
  );

  const [page, setPage] = useState(1);
  const perPage = Number(filters.perPage || 20);
  useEffect(() => {
    setPage(1);
  }, [filterSekolahId, filterKelasId, filterLokal, filterKategoriId, dateFrom, dateTo, search]);

  // =======================
  // PIVOT DINAMIS (ALL CAT)
  // =======================
  const COLUMNS = useMemo(
    () => (kategoriList || []).map((k) => ({ id: String(k.id), label: k.nama_kategori })),
    [kategoriList]
  );

  const colIndexById = useMemo(() => {
    const m = new Map();
    COLUMNS.forEach((c, idx) => m.set(c.id, idx));
    return m;
  }, [COLUMNS]);

  const pivotRows = useMemo(() => {
    if (filterKategoriId !== "all" && filterKategoriId !== "") return []; // bukan mode pivot
    const map = new Map();
    for (const r of filtered) {
      const sid = r.siswa?.id;
      if (!sid) continue;
      if (!map.has(sid)) {
        map.set(sid, {
          siswa: {
            id: sid,
            nama: r.siswa?.nama || "-",
            sekolah: r.sekolah?.nama || "",
            kelas: r.kelas?.nama || "",
            lokal: r.kelas?.lokal || "",
          },
          cols: Array(COLUMNS.length).fill(0),
          total: 0,
        });
      }
      const row = map.get(sid);
      const kid = String(r.kategori?.id || "");
      const idx = colIndexById.get(kid);
      const amount = Number(r.jumlah || 0);
      if (idx !== undefined) {
        row.cols[idx] += amount;
        row.total += amount;
      }
    }
    return Array.from(map.values()).filter((r) => r.total > 0);
  }, [filtered, COLUMNS, colIndexById, filterKategoriId]);

  const pivotFooter = useMemo(() => {
    const totals = Array(COLUMNS.length).fill(0);
    let grand = 0;
    for (const r of pivotRows) {
      r.cols.forEach((v, i) => (totals[i] += v));
      grand += r.total;
    }
    return { cols: totals, total: grand };
  }, [pivotRows, COLUMNS.length]);

  const isPivot = filterKategoriId === "all" || filterKategoriId === "";
  const totalRows = isPivot ? pivotRows.length : filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageOffset = (currentPage - 1) * perPage;

  const pageNumbers = useMemo(() => {
    const total = totalPages, curr = currentPage;
    const range = [];
    const start = Math.max(1, curr - 2);
    const end = Math.min(total, curr + 2);
    for (let i = start; i <= end; i++) range.push(i);
    if (!range.includes(1)) range.unshift(1, "start-ellipsis");
    if (!range.includes(total)) range.push("end-ellipsis", total);
    return range;
  }, [currentPage, totalPages]);

  const pageData = useMemo(() => {
    const data = isPivot ? pivotRows : filtered;
    return data.slice(pageOffset, pageOffset + perPage);
  }, [isPivot, pivotRows, filtered, pageOffset, perPage]);

  // === Apply ke server (ID-based; match halaman Tagihan)
  const applyServer = () => {
    router.get(
      route("laporan.perkategori.index"),
      {
        sekolah_id: filterSekolahId,
        kelas_id: filterKelasId,
        lokal: filterLokal,
        kategori_id: filterKategoriId,
        from: dateFrom,
        to: dateTo,
        search,
        perPage,
      },
      { preserveScroll: true, preserveState: true }
    );
  };

  const doReset = () => {
    setFilterSekolahId("all");
    setFilterKelasId("all");
    setFilterLokal("all");
    setFilterKategoriId("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    router.get(route("laporan.perkategori.index"), {}, { preserveScroll: true, preserveState: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Laporan Per Kategori</h1>
          <p className="text-sm text-muted-foreground">Pivot dinamis berdasarkan daftar kategori di database.</p>
        </div>
      }
    >
      <Head title="Laporan Keuagan"/>
      <FiltersCardKategori
        sekolahList={sekolahList}
        kategoriList={kategoriList}
        filterSekolahId={filterSekolahId} setFilterSekolahId={setFilterSekolahId}
        filterKelasId={filterKelasId}     setFilterKelasId={setFilterKelasId}
        filterLokal={filterLokal}         setFilterLokal={setFilterLokal}
        filterKategoriId={filterKategoriId} setFilterKategoriId={setFilterKategoriId}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo}     setDateTo={setDateTo}
        search={search}     setSearch={setSearch}
        onApplyServer={applyServer}
        onReset={doReset}
        autoApply={false}
      />

      {/* Export pakai param ID */}
      <div className="flex gap-4 my-4">
        <Button asChild>
          <a
            href={route("laporan.export.excel", {
              from: dateFrom || undefined,
              to: dateTo || undefined,
              sekolah_id: filterSekolahId,
              kelas_id: filterKelasId,
              lokal: filterLokal,
              kategori_id: filterKategoriId,
              search: search || undefined,
            })}
            target="_blank"
            rel="noopener"
          >
            Export Excel
          </a>
        </Button>

        <Button asChild variant="outline">
          <a
            href={route("laporan.export.pdf", {
              from: dateFrom || undefined,
              to: dateTo || undefined,
              sekolah_id: filterSekolahId,
              kelas_id: filterKelasId,
              lokal: filterLokal,
              kategori_id: filterKategoriId,
              search: search || undefined,
            })}
            target="_blank"
            rel="noopener"
          >
            Export PDF
          </a>
        </Button>
      </div>

      <div className="gap-3">
        {isPivot ? (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Rekap Per Siswa (Semua Kategori)</CardTitle>
              <div className="text-sm text-muted-foreground">
                Total siswa tampil: {pivotRows.length} • Total nominal: {formatRupiah(pivotFooter.total)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      {COLUMNS.map((c) => (
                        <TableHead key={c.id} className="whitespace-nowrap">{c.label}</TableHead>
                      ))}
                      <TableHead className="text-right whitespace-nowrap">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageData.length ? (
                      pageData.map((r, i) => (
                        <TableRow key={r.siswa.id}>
                          <TableCell>{(currentPage - 1) * perPage + i + 1}</TableCell>
                          <TableCell className="min-w-[220px]">
                            <div className="flex flex-col">
                              <span className="font-medium">{r.siswa.nama}</span>
                              <span className="text-xs text-muted-foreground">
                                {r.siswa.sekolah ? `${r.siswa.sekolah} • ` : ""}
                                {r.siswa.kelas || "-"}
                                {r.siswa.lokal ? ` • ${r.siswa.lokal}` : ""}
                              </span>
                            </div>
                          </TableCell>
                          {r.cols.map((val, idx) => (
                            <TableCell key={idx} className="text-right">
                              {val ? formatRupiah(val) : "-"}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-semibold">{formatRupiah(r.total)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2 + COLUMNS.length + 1} className="text-center">
                          Tidak ada data untuk filter ini
                        </TableCell>
                      </TableRow>
                    )}

                    {pivotRows.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-semibold">Jumlah Keseluruhan</TableCell>
                        {pivotFooter.cols.map((v, i) => (
                          <TableCell key={`ft-${i}`} className="text-right font-semibold">
                            {v ? formatRupiah(v) : "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-extrabold">{formatRupiah(pivotFooter.total)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* pagination */}
              <PaginationBar
                totalPages={totalPages}
                currentPage={currentPage}
                onChange={setPage}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Detail Transaksi (Per Kategori)</CardTitle>
              <div className="text-sm text-muted-foreground">
                Total data: {filtered.length} • Total nominal: {formatRupiah(totalNominal)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Sekolah</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Lokal</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageData.length ? (
                      pageData.map((r, i) => (
                        <TableRow key={`${r.id}-${i}`}>
                          <TableCell>{(currentPage - 1) * perPage + i + 1}</TableCell>
                          <TableCell className="whitespace-nowrap">{r.tanggal || "-"}</TableCell>
                          <TableCell>{r.siswa?.nama || "-"}</TableCell>
                          <TableCell>{r.sekolah?.nama || "-"}</TableCell>
                          <TableCell>{r.kelas?.nama || "-"}</TableCell>
                          <TableCell>{r.kelas?.lokal || "-"}</TableCell>
                          <TableCell>{r.kategori?.nama || "-"}</TableCell>
                          <TableCell className="text-right">{formatRupiah(r.jumlah)}</TableCell>
                          <TableCell className="max-w-[260px] truncate" title={r.keterangan || ""}>
                            {r.keterangan || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">Tidak ada data untuk filter ini</TableCell>
                      </TableRow>
                    )}

                    {filtered.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-right font-semibold">Jumlah Keseluruhan</TableCell>
                        <TableCell className="text-right font-extrabold">{formatRupiah(totalNominal)}</TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <PaginationBar
                totalPages={totalPages}
                currentPage={currentPage}
                onChange={setPage}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

function PaginationBar({ totalPages, currentPage, onChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = (() => {
    const arr = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    if (!arr.includes(1)) arr.unshift(1, "start-ellipsis");
    if (!arr.includes(totalPages)) arr.push("end-ellipsis", totalPages);
    return arr;
  })();

  return (
    <div className="mt-4 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); onChange(Math.max(1, currentPage - 1)); }}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {pageNumbers.map((p, i) =>
            typeof p === "number" ? (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === currentPage}
                  onClick={(e) => { e.preventDefault(); onChange(p); }}
                >
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
              href="#"
              onClick={(e) => { e.preventDefault(); onChange(Math.min(totalPages, currentPage + 1)); }}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
