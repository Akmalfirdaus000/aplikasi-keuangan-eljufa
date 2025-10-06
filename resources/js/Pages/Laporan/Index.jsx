"use client"

import { useMemo, useState, useEffect } from "react"
import { usePage, router } from "@inertiajs/react"
import { route } from "ziggy-js"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"

import { Button } from "@/components/ui"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import FiltersComponent from "./components/FiltersComponent"
import PerSiswaSection from "./components/PerSiswaSection"
import RekapSection from "./components/RekapSection"
import TunggakanSection from "./components/TunggakanSection"
import TemplateExcelSection from "./components/TemplateExcelSection"
import { CodeXml } from "lucide-react"

const routeHelper = (name, params = {}) => {
  if (typeof window !== "undefined" && window.route) return window.route(name, params)
  return name
}

export default function LaporanIndex() {
  const { siswas = [], tagihans = [], pembayarans = [], kategoris = [], sekolahList = [] } = usePage().props

  const [activeTab, setActiveTab] = useState("per_siswa")

  // filters
  const [filterSekolah, setFilterSekolah] = useState("all")
  const [filterKelas, setFilterKelas] = useState("all")
  const [filterLokal, setFilterLokal] = useState("all")
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedKategori, setSelectedKategori] = useState("all")

  // pagination
  const [pagePerSiswa, setPagePerSiswa] = useState(1)
  const pageSizePerSiswa = 10
  const [pageTunggakan, setPageTunggakan] = useState(1)
  const pageSizeTunggakan = 10

  // template
  const [templateType, setTemplateType] = useState("spp")

  // === DERIVE OPTIONS ===
  const kelasOptions = useMemo(() => {
    const s = new Set(siswas.map((x) => x.kelas?.nama_kelas).filter(Boolean))
    return Array.from(s)
  }, [siswas])

  const lokalOptions = useMemo(() => {
    const s = new Set(siswas.map((x) => x.kelas?.lokal).filter(Boolean))
    return Array.from(s)
  }, [siswas])

  // === FILTER SISWA ===
  const filteredSiswa = useMemo(() => {
    const q = search.trim().toLowerCase()
    return siswas.filter((s) => {
      if (filterSekolah !== "all" && (s.sekolah?.nama_sekolah || "") !== filterSekolah) return false
      if (filterKelas !== "all" && (s.kelas?.nama_kelas || "") !== filterKelas) return false
      if (filterLokal !== "all" && (s.kelas?.lokal || "") !== filterLokal) return false

      if (!q) return true
      return (
        (s.nama_siswa || "").toLowerCase().includes(q) ||
        (s.kelas?.nama_kelas || "").toLowerCase().includes(q) ||
        String(s.id).includes(q)
      )
    })
  }, [siswas, filterSekolah, filterKelas, filterLokal, search])

  // === MAP TAGIHAN PER SISWA ===
  const siswaTagihanMap = useMemo(() => {
    const map = {}
    siswas.forEach((s) => {
      map[s.id] = {}
      kategoris.forEach((k) => {
        const t = tagihans.find((tg) => tg.siswa_id === s.id && tg.kategori_id === k.id)
        map[s.id][k.id] = t || null
      })
    })
    return map
  }, [siswas, tagihans, kategoris])

  // === FILTER PEMBAYARAN BY DATE ===
  const filterPaymentsByDate = (items) => {
    if (!dateFrom && !dateTo) return items
    const from = dateFrom ? new Date(dateFrom) : null
    const to = dateTo ? new Date(dateTo) : null
    return items.filter((p) => {
      const d = new Date(p.tanggal_bayar || p.created_at || p.tanggal || null)
      if (!d || isNaN(d)) return false
      if (from && d < from) return false
      if (to && d > to) return false
      return true
    })
  }

  // === REKAP DATA ===
  const rekapData = useMemo(() => {
    const payments = filterPaymentsByDate(pembayarans || [])
    const totals = {}
    payments.forEach((p) => {
      const d = new Date(p.tanggal_bayar || p.created_at || p.tanggal || null)
      if (isNaN(d)) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      totals[key] = (totals[key] || 0) + Number(p.nominal || 0)
    })
    return Object.keys(totals)
      .map((k) => ({ period: k, total: totals[k] }))
      .sort((a, b) => (a.period < b.period ? 1 : -1))
  }, [pembayarans, dateFrom, dateTo])

  // === TUNGGAKAN ===
  const tunggakanList = useMemo(() => {
    const rows = []
    filteredSiswa.forEach((s) => {
      const tList = (tagihans || []).filter((t) => t.siswa_id === s.id && Number(t.sisa_tagihan || 0) > 0)
      if (tList.length > 0) {
        rows.push({ siswa: s, tagihans: tList })
      }
    })
    return rows
  }, [filteredSiswa, tagihans])

  // === FORMAT IDR ===
  const fmtID = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
      Number(n || 0)
    )

  // === EXPORT HANDLER ===
  const handleExport = (type) => {
    const params = {
      sekolah: filterSekolah !== "all" ? filterSekolah : undefined,
      kelas: filterKelas !== "all" ? filterKelas : undefined,
      lokal: filterLokal !== "all" ? filterLokal : undefined,
      kategori: selectedKategori !== "all" ? selectedKategori : undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
      q: search || undefined,
      format: "csv",
    }

    const routeName =
      type === "per_siswa"
        ? "laporan.per_siswa.export"
        : type === "rekap"
        ? "laporan.rekap.export"
        : type === "tunggakan"
        ? "laporan.tunggakan.export"
        : "laporan.template.export"

    try {
      router.visit(routeHelper(routeName, params), { method: "get", preserveScroll: true })
    } catch (err) {
      console.error("Export failed", err)
    }
  }

  // reset pagination on filters
  useEffect(() => {
    setPagePerSiswa(1)
    setPageTunggakan(1)
  }, [filterSekolah, filterKelas, filterLokal, search, dateFrom, dateTo, selectedKategori])

  // pagination helpers
  const paginatedSiswa = useMemo(() => {
    const start = (pagePerSiswa - 1) * pageSizePerSiswa
    return filteredSiswa.slice(start, start + pageSizePerSiswa)
  }, [filteredSiswa, pagePerSiswa])

  const totalPagesPerSiswa = useMemo(
    () => Math.max(1, Math.ceil(filteredSiswa.length / pageSizePerSiswa)),
    [filteredSiswa]
  )

  const paginatedTunggakan = useMemo(() => {
    const start = (pageTunggakan - 1) * pageSizeTunggakan
    return tunggakanList.slice(start, start + pageSizeTunggakan)
  }, [tunggakanList, pageTunggakan])

  const totalPagesTunggakan = useMemo(
    () => Math.max(1, Math.ceil(tunggakanList.length / pageSizeTunggakan)),
    [tunggakanList]
  )

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Laporan</h1>
          <p className="text-sm text-muted-foreground">Lihat rekap, tagihan & riwayat pembayaran siswa</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tabs selector */}
        <div className="flex gap-2">
          <Button variant={activeTab === "per_siswa" ? "default" : "ghost"} onClick={() => setActiveTab("per_siswa")}>
            Per Siswa
          </Button>
          <Button variant={activeTab === "rekap" ? "default" : "ghost"} onClick={() => setActiveTab("rekap")}>
            Rekap Keuangan
          </Button>
          <Button variant={activeTab === "tunggakan" ? "default" : "ghost"} onClick={() => setActiveTab("tunggakan")}>
            Tunggakan
          </Button>
          <Button variant={activeTab === "template" ? "default" : "ghost"} onClick={() => setActiveTab("template")}>
            Template Excel
          </Button>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDateFrom("")
                setDateTo("")
                setSearch("")
                setFilterSekolah("all")
                setFilterKelas("all")
                setFilterLokal("all")
              }}
            >
              Reset Filters
            </Button>
            <Button size="sm" onClick={() => handleExport(activeTab)}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Shared Filter */}
        <FiltersComponent
          sekolahList={sekolahList}
          kelasOptions={kelasOptions}
          lokalOptions={lokalOptions}
          filterSekolah={filterSekolah}
          setFilterSekolah={setFilterSekolah}
          filterKelas={filterKelas}
          setFilterKelas={setFilterKelas}
          filterLokal={filterLokal}
          setFilterLokal={setFilterLokal}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          search={search}
          setSearch={setSearch}
        />

        {/* Tabs content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="per_siswa">
            <PerSiswaSection
              filteredCount={filteredSiswa.length}
              paginatedSiswa={paginatedSiswa}
              pagePerSiswa={pagePerSiswa}
              setPagePerSiswa={setPagePerSiswa}
              totalPagesPerSiswa={totalPagesPerSiswa}
              pageSizePerSiswa={10}
              selectedKategori={selectedKategori}
              setSelectedKategori={setSelectedKategori}
              kategoris={kategoris}
              fmtID={fmtID}
              tagihans={tagihans}
              pembayarans={pembayarans}
              filterPaymentsByDate={filterPaymentsByDate}
              handleExport={handleExport}
            />
          </TabsContent>

          <TabsContent value="rekap">
            <RekapSection rekapData={rekapData} fmtID={fmtID} handleExport={handleExport} />
          </TabsContent>

          <TabsContent value="tunggakan">
            <TunggakanSection
              paginatedTunggakan={paginatedTunggakan}
              totalPagesTunggakan={totalPagesTunggakan}
              pageTunggakan={pageTunggakan}
              setPageTunggakan={setPageTunggakan}
              fmtID={fmtID}
              router={router}
              routeHelper={routeHelper}
            />
          </TabsContent>

          <TabsContent value="template">
            <TemplateExcelSection
              templateType={templateType}
              setTemplateType={setTemplateType}
              filteredSiswa={filteredSiswa}
              fmtID={fmtID}
              tagihans={tagihans}
              pembayarans={pembayarans}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}
