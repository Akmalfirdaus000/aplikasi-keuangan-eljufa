"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  CircleDollarSignIcon,
  BanknoteArrowUpIcon,
  BanknoteArrowDownIcon
} from "lucide-react";


function cx(...c) {
  return c.filter(Boolean).join(" ");
}
function isRouteActive(url, routeName) {
  try {
    return url.includes(route(routeName, [], false));
  } catch {
    return false;
  }
}

export default function Sidebar() {
  const page = usePage();
  const url = page?.url || "";
  const auth = page?.props?.auth || {};
  const user = auth?.user ?? { name: "Guest", email: "guest@example.com" };

  // Collapse desktop + sink ke CSS var agar layout bisa menyesuaikan (jika dipakai)
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    const isCollapsed = saved === "1";
    setCollapsed(isCollapsed);
    document.documentElement.style.setProperty("--sbw", isCollapsed ? "4rem" : "16rem");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed ? "1" : "0");
    document.documentElement.style.setProperty("--sbw", collapsed ? "4rem" : "16rem");
  }, [collapsed]);

  // Sheet (mobile)
  const [openMobile, setOpenMobile] = useState(false);

  // Submenu open map
  const [openMenus, setOpenMenus] = useState({});
  const toggleMenu = (name) => setOpenMenus((p) => ({ ...p, [name]: !p[name] }));

  // Menus
  const menus = useMemo(
    () => [
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
          { name: "Tagihan", icon:  Banknote, route: "tagihans.index" },
          { name: "Pembayaran", icon:  CreditCard, route: "pembayarans.index" },
        ],
      },
      
      { name: "Pengeluaran Keuangan", icon: CircleDollarSignIcon, route: "keuangans.pengeluaran" },
       {
        name: "Laporan",
        icon: FileText,
        subMenu: [
          { name: "Uang Masuk", icon:  BanknoteArrowUpIcon, route: "laporan.index" },
          { name: "Uang Keluar", icon:  BanknoteArrowDownIcon, route: "laporan.pengeluaran" },
        ],
      },
    ],
    []
  );

  // ====== Item renderers (ikon konsisten) ======
  const IconBox = ({ Icon, className }) => <Icon className={cx("h-5 w-5 shrink-0", className)} />;

  const MenuItem = ({ icon: Icon, active, children, collapsed }) => (
    <div
      className={cx(
        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-indigo-100 text-indigo-700 font-medium" : "text-gray-700 hover:bg-indigo-50",
        collapsed ? "justify-center gap-0" : "gap-3"
      )}
      title={collapsed ? children : undefined}
    >
      <IconBox Icon={Icon} />
      {!collapsed && <span className="truncate leading-none">{children}</span>}
    </div>
  );

  const SubItem = ({ icon: Icon, active, children }) => (
    <div
      className={cx(
        "flex items-center rounded-md px-3 py-2 text-sm gap-3",
        active ? "bg-indigo-100 text-indigo-700 font-medium" : "text-gray-600 hover:bg-indigo-50"
      )}
    >
      {Icon && <IconBox Icon={Icon} />}
      <span className="truncate leading-none">{children}</span>
    </div>
  );

  const renderTree = (isMobile = false) => (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <nav className={cx("p-2 space-y-1", collapsed && !isMobile && "px-1")}>
        {menus.map((m, i) => {
          const Icon = m.icon;

          // Single item
          if (!m.subMenu) {
            const active = isRouteActive(url, m.route);
            const item = (
              <MenuItem icon={Icon} active={active} collapsed={collapsed && !isMobile}>
                {m.name}
              </MenuItem>
            );
            return (
              <div key={i}>
                <Link href={route(m.route)}>{item}</Link>
              </div>
            );
          }

          // Dengan submenu
          const open = !!openMenus[m.name];
          const showCaret = !(collapsed && !isMobile);

          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => toggleMenu(m.name)}
                className={cx(
                  "flex items-center w-full rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-indigo-50 transition-colors",
                  collapsed && !isMobile ? "justify-center gap-0" : "justify-between gap-3"
                )}
                title={collapsed && !isMobile ? m.name : undefined}
              >
                <span className={cx("flex items-center", collapsed && !isMobile ? "gap-0" : "gap-3")}>
                  <IconBox Icon={Icon} />
                  {!(collapsed && !isMobile) && <span className="truncate">{m.name}</span>}
                </span>
                {showCaret && (open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
              </button>

              {open && (
                <div className={cx("mt-1 flex flex-col space-y-1", !(collapsed && !isMobile) && "pl-6")}>
                  {m.subMenu.map((sm, j) => {
                    const active = sm.route ? isRouteActive(url, sm.route) : false;
                    const SIcon = sm.icon;
                    const node = (
                      <SubItem icon={SIcon} active={active}>
                        {sm.name}
                      </SubItem>
                    );
                    return sm.route ? (
                      <Link key={j} href={route(sm.route)}>
                        {node}
                      </Link>
                    ) : (
                      <div key={j}>{node}</div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </ScrollArea>
  );

  // ====== User dropdown (MEMAKAI user login) ======
  const onLogout = () => router.post(route("logout"));
  const onProfile = () => router.get(route("profile.edit"));

  const displayName = user?.name ?? "Pengguna";
  const email = user?.email ?? "";
  const avatar =
    user?.profile_photo_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff&size=128`;

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cx(
            "w-full flex items-center gap-3 rounded-md p-2 hover:bg-gray-100 transition-colors",
            collapsed ? "justify-center" : "justify-start"
          )}
          title={collapsed ? displayName : undefined}
        >
          <img
            src={avatar}
            alt={displayName}
            className="w-8 h-8 rounded-full shrink-0"
            referrerPolicy="no-referrer"
          />
          {!collapsed && (
            <>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-sm font-medium leading-tight truncate">{displayName}</span>
                {email ? <span className="text-xs text-gray-500 leading-tight truncate">{email}</span> : null}
              </div>
              <ChevronDown className="ml-auto w-4 h-4 text-gray-400" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Item informatif/akun (opsional) */}
        <DropdownMenuItem className="gap-2" onSelect={onProfile} >
          <UserIcon size={16} /> Profil
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Settings size={16} /> Pengaturan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-red-600" onSelect={onLogout}>
          <LogOut size={16} /> Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Topbar (mobile) */}
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
                <div className="p-3 border-t">
                  <UserDropdown />
                  <Button
                    variant="ghost"
                    className="mt-2 w-full justify-start gap-3 text-red-600"
                    onClick={onLogout}
                  >
                    <LogOut className="h-5 w-5" /> Keluar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-indigo-600">Aplikasi Keuangan</span>
              <span className="text-xs text-gray-500">Yayasan El-jufa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside
        className={cx(
          "hidden md:flex fixed top-0 left-0 h-screen border-r bg-white z-30 transition-[width] duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full w-full flex-col">
          {/* Header */}
          <div className={cx("flex items-center border-b", collapsed ? "px-2 py-3" : "px-4 py-3")}>
            {!collapsed ? (
              <div className="mr-2 flex items-center">
                <img src="/logo-kop-eljufa.png" alt="" className="w-24 h-24" />
                <div className="flex flex-col">
                <span className="  text-xl font-bold text-indigo-600">Aplikasi Keuangan</span>
                <span className="text-[11px] text-gray-500">Yayasan El-jufa</span>
                </div>
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

          {/* Body */}
          {renderTree(false)}

          {/* Footer user */}
          <div className="p-3 border-t">
            <UserDropdown />
          </div>
        </div>
      </aside>
    </>
  );
}
