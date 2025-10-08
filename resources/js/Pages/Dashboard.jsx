"use client"

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Line, LineChart,
} from "recharts"
import { Head } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, ArrowDownRight, ArrowUpRight, Banknote, CheckCircle2,
  AlertCircle, Receipt, Calendar, TrendingUp, Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ================= Utils =================
function idr(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID")
}

// Warna chart (aman untuk dark/light)
const CHART_COLORS = [
  "hsl(210 100% 50%)",
  "hsl(140 70% 45%)",
  "hsl(40 90% 55%)",
  "hsl(340 80% 55%)",
]

// ================= Small components =================
function BasicTooltip({ active, payload, label, currency }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">{label}</div>
      {payload.map((p, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">
            {p.name}: <span className="font-medium text-foreground">{currency ? idr(p.value) : p.value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function MetricCard({ title, value, icon, pill, tone = "primary" }) {
  const toneClass = {
    primary: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    info: "bg-sky-100 text-sky-600",
    warning: "bg-yellow-100 text-yellow-600",
    neutral: "bg-gray-100 text-gray-600",
  }[tone]

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <div className="text-xl font-semibold tracking-tight">{value}</div>
          </div>
          <div className={cn("rounded-lg p-2", toneClass)}>{icon}</div>
        </div>
        {pill ? (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" /> {pill}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

// ================= Charts =================
function ComposedTrend({ data }) {
  return (
    <AreaChart data={data} margin={{ left: 8, right: 8 }}>
      <defs>
        <linearGradient id="fillNominal" x1="0" x2="0" y1="0" y2="1">
          <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.35} />
          <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.2)" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip content={<BasicTooltip currency />} />
      <Legend />
      <Area type="monotone" dataKey="nominal" name="Nominal" stroke={CHART_COLORS[0]} fill="url(#fillNominal)" />
      <Line type="monotone" dataKey="total" name="Transaksi" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
    </AreaChart>
  )
}

// ================= Page =================
export default function DashboardPage(props) {
  // Ambil data real dari controller
  const stats = props.stats ?? {}
  const trendMonthly = props.trendMonthly ?? []
  const kategoriBreakdown = props.kategoriBreakdown ?? []
  const riwayat = props.riwayat ?? []

  // Status tagihan untuk pie
  const statusTagihan = [
    { name: "Lunas", value: Number(stats.tagihan_lunas || 0) },
    { name: "Belum", value: Number(stats.tagihan_belum || 0) },
  ]

  return (
    <AuthenticatedLayout
      user={props.auth?.user}
      header={<h2 className="text-xl font-semibold leading-tight">Dashboard Keuangan Sekolah</h2>}
    >
      <Head title="Dashboard" />

      <main className="mx-auto max-w-[1200px] px-4 py-6">
        {/* Header actions */}
        <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Ringkasan pembayaran, status tagihan, dan performa bulanan.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="gap-2">
              <Download className="h-4 w-4" /> Ekspor
            </Button>
            <Button className="gap-2">
              <TrendingUp className="h-4 w-4" /> Lihat Insight
            </Button>
          </div>
        </section>

        {/* Stat cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Siswa Bayar (Hari Ini)" value={stats.today_siswa ?? 0} icon={<Users className="h-5 w-5" />} pill="Hari ini" tone="info" />
          <MetricCard title="Uang Masuk (Hari Ini)" value={idr(stats.today_total)} icon={<ArrowDownRight className="h-5 w-5" />} pill="Hari ini" tone="success" />
          <MetricCard title="Uang Masuk (Bulan Ini)" value={idr(stats.month_total)} icon={<ArrowUpRight className="h-5 w-5" />} pill="Bulan ini" tone="primary" />
          <MetricCard title="Total Pembayaran (All Time)" value={idr(stats.total_pembayaran)} icon={<Banknote className="h-5 w-5" />} pill="Sejak awal" tone="neutral" />
        </section>

        {/* Secondary stats */}
        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Tagihan Lunas" value={stats.tagihan_lunas ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
          <MetricCard title="Tagihan Belum Lunas" value={stats.tagihan_belum ?? 0} icon={<AlertCircle className="h-5 w-5" />} tone="warning" />
          <MetricCard title="Total Siswa" value={stats.total_siswa ?? 0} icon={<Users className="h-5 w-5" />} tone="primary" />
          <MetricCard title="Transaksi (Bulan Ini)" value={stats.month_transaksi ?? 0} icon={<Receipt className="h-5 w-5" />} tone="info" />
        </section>

        {/* Charts */}
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* AreaChart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Performa Nominal Bulanan</CardTitle>
              <p className="text-xs text-muted-foreground">Perbandingan transaksi vs nominal per bulan.</p>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedTrend data={trendMonthly} />
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status Tagihan</CardTitle>
              <p className="text-xs text-muted-foreground">Distribusi tagihan saat ini</p>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<BasicTooltip currency={false} />} />
                  <Pie data={statusTagihan} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {statusTagihan.map((e, i) => (
                      <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 flex flex-wrap gap-2">
                {statusTagihan.map((s, i) => (
                  <Badge key={s.name} variant="outline" className="gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {s.name}: {s.value}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Nominal per Kategori</CardTitle>
              <p className="text-xs text-muted-foreground">Akumulasi nominal berdasarkan kategori</p>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kategoriBreakdown} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="name" tickMargin={8} />
                  <YAxis />
                  <Tooltip content={<BasicTooltip currency />} />
                  <Bar dataKey="nominal" name="Nominal" radius={[6, 6, 0, 0]} fill={CHART_COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line (pakai data yang sama dengan area untuk jumlah transaksi / bulan) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Jumlah Transaksi / Bulan</CardTitle>
              <p className="text-xs text-muted-foreground">Volume transaksi sepanjang tahun</p>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<BasicTooltip currency={false} />} />
                  <Line type="monotone" dataKey="total" name="Transaksi" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Riwayat tabel */}
        <section className="mt-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Riwayat Pembayaran Terbaru</CardTitle>
                <p className="text-xs text-muted-foreground">10 transaksi terakhir</p>
              </div>
              <Button variant="link" className="px-0 text-sm">
                Lihat semua
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-3 py-2">Tanggal</th>
                    <th className="px-3 py-2">Siswa</th>
                    <th className="px-3 py-2">Kategori</th>
                    <th className="px-3 py-2 text-right">Jumlah</th>
                    <th className="px-3 py-2">Metode</th>
                    <th className="px-3 py-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/50">
                      <td className="px-3 py-2 whitespace-nowrap">{r.tanggal}</td>
                      <td className="px-3 py-2">{r.siswa}</td>
                      <td className="px-3 py-2">{r.kategori}</td>
                      <td className="px-3 py-2 text-right font-medium">{idr(r.jumlah)}</td>
                      <td className="px-3 py-2">{r.metode}</td>
                      <td className="px-3 py-2 max-w-[220px] truncate" title={r.keterangan}>
                        {r.keterangan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      </main>
    </AuthenticatedLayout>
  )
}
