"use client"

import { useEffect, useMemo, useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import { route } from "ziggy-js"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import {
  Home,
  Book,
  Layers,
  Banknote,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Settings,
  FileText,
  Users,
  LogOut,
  Bell,
  CreditCard as Billing,
  User as UserIcon,
  Star,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

function cx(...c) { return c.filter(Boolean).join(" ") }
function isRouteActive(url, routeName) {
  try { return url.includes(route(routeName, [], false)) } catch { return false }
}

export default function Sidebar() {
  const { url, auth } = usePage()
  const user = auth?.user ?? { name: "Guest", email: "guest@example.com" }

  // Desktop collapse state + CSS var sink
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed")
    const isCollapsed = saved === "1"
    setCollapsed(isCollapsed)
    // set CSS var on first paint
    document.documentElement.style.setProperty("--sbw", isCollapsed ? "4rem" : "16rem")
  }, [])
  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed ? "1" : "0")
    document.documentElement.style.setProperty("--sbw", collapsed ? "4rem" : "16rem")
  }, [collapsed])

  // Mobile sheet
  const [openMobile, setOpenMobile] = useState(false)

  const [openMenus, setOpenMenus] = useState({})
  const toggleMenu = (name) => setOpenMenus((p) => ({ ...p, [name]: !p[name] }))

  const menus = useMemo(() => [
    { name: "Dashboard", icon: Home, route: "dashboard" },
    {
      name: "Master Data",
      icon: Settings,
      subMenu: [
        { name: "Sekolah", icon: Layers, route: "sekolahs.index" },
        { name: "Siswa", icon: Users, route: "siswas.index" },
        { name: "Kelas", icon: Book, route: "kelas.index" },
        { name: "Kategori", icon: FileText, route: "kategoris.index" },
      ],
    },
    {
      name: "Transaksi",
      icon: Banknote,
      subMenu: [
        { name: "Tagihan", icon: Banknote, route: "tagihans.index" },
        { name: "Pembayaran", icon: CreditCard, route: "pembayarans.index" },
      ],
    },
    { name: "Laporan", icon: FileText, route: "laporan.index" },
  ], [])

  const MenuItem = ({ icon: Icon, active, children, collapsed }) => (
    <div
      className={cx(
        "flex items-center rounded-md px-3 py-2 text-sm",
        active ? "bg-indigo-100 text-indigo-700 font-medium" : "text-gray-700 hover:bg-indigo-50",
        collapsed && "justify-center"
      )}
      title={collapsed ? children : undefined}
    >
      <Icon size={18} className={cx(!collapsed && "mr-2")} />
      {!collapsed && <span className="truncate">{children}</span>}
    </div>
  )

  const SubItem = ({ icon: Icon, active, children }) => (
    <div
      className={cx(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
        active ? "bg-indigo-100 text-indigo-700 font-medium" : "text-gray-600 hover:bg-indigo-50"
      )}
    >
      {Icon && <Icon size={16} className="shrink-0" />}
      <span className="truncate">{children}</span>
    </div>
  )

  const renderTree = (isMobile = false) => (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <nav className={cx("p-2 space-y-1", collapsed && !isMobile && "px-1")}>
        {menus.map((m, i) => {
          const Icon = m.icon
          if (!m.subMenu) {
            const active = isRouteActive(url, m.route)
            const item = (
              <MenuItem icon={Icon} active={active} collapsed={collapsed && !isMobile}>
                {m.name}
              </MenuItem>
            )
            return (
              <div key={i}>
                <Link href={route(m.route)}>{item}</Link>
              </div>
            )
          }

          const open = !!openMenus[m.name]
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => toggleMenu(m.name)}
                className={cx(
                  "flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-indigo-50 rounded-md",
                  collapsed && !isMobile && "justify-center px-2"
                )}
                title={collapsed && !isMobile ? m.name : undefined}
              >
                <span className="flex items-center">
                  <Icon size={18} className={cx(!(collapsed && !isMobile) && "mr-2")} />
                  {!(collapsed && !isMobile) && <span className="truncate">{m.name}</span>}
                </span>
                {!(collapsed && !isMobile) &&
                  (open ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </button>

              {open && (
                <div className={cx("mt-1 flex flex-col space-y-1", !(collapsed && !isMobile) && "pl-6")}>
                  {m.subMenu.map((sm, j) => {
                    const active = sm.route ? isRouteActive(url, sm.route) : false
                    const SIcon = sm.icon
                    const node = (
                      <SubItem icon={SIcon} active={active}>
                        {sm.name}
                      </SubItem>
                    )
                    return sm.route ? (
                      <Link key={j} href={route(sm.route)}>{node}</Link>
                    ) : (
                      <div key={j}>{node}</div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </ScrollArea>
  )

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cx("w-full flex items-center gap-2 rounded-md p-2 hover:bg-gray-100",
            collapsed ? "justify-center" : "justify-start")}
          title={collapsed ? user.name : undefined}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Guest")}&background=random`}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          {!collapsed && (
            <>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <ChevronDown className="ml-auto w-4 h-4 text-gray-400" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem className="gap-2"><Star size={16} /> Upgrade to Pro</DropdownMenuItem>
        <DropdownMenuItem className="gap-2"><UserIcon size={16} /> Account</DropdownMenuItem>
        <DropdownMenuItem className="gap-2"><Billing size={16} /> Billing</DropdownMenuItem>
        <DropdownMenuItem className="gap-2"><Bell size={16} /> Notifications</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-red-600"><LogOut size={16} /> Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden sticky top-0 z-40 w-full border-b bg-white">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Sheet open={openMobile} onOpenChange={setOpenMobile}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SheetHeader className="px-4 py-3 border-b">
                  <SheetTitle>Aplikasi Keuangan</SheetTitle>
                </SheetHeader>
                {renderTree(true)}
                <div className="p-3 border-t"><UserDropdown /></div>
              </SheetContent>
            </Sheet>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-indigo-600">Aplikasi Keuangan</span>
              <span className="text-xs text-gray-500">Enterprise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cx(
          "hidden md:flex fixed top-0 left-0 h-screen border-r bg-white z-30 transition-[width] duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full w-full flex-col">
          <div className={cx("flex items-center border-b", collapsed ? "px-2 py-3" : "px-4 py-3")}>
            {!collapsed ? (
              <div className="mr-2">
                <div className="text-base font-bold text-indigo-600">Aplikasi Keuangan</div>
                <div className="text-[11px] text-gray-500">Enterprise</div>
              </div>
            ) : (
              <div className="text-indigo-600 font-bold text-lg">AK</div>
            )}
            <Button
              size="icon"
              variant="ghost"
              className={cx("ml-auto", collapsed && "mx-auto")}
              onClick={() => setCollapsed((v) => !v)}
              aria-label="Collapse sidebar"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          {renderTree(false)}
          <div className="p-3 border-t"><UserDropdown /></div>
        </div>
      </aside>
    </>
  )
}
