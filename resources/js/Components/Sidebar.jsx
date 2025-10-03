import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
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
} from "lucide-react";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function Sidebar() {
  const { url, auth } = usePage();
  const user = auth?.user ?? { name: "Guest", email: "guest@example.com" };
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const menus = [
    { name: "Dashboard", icon: <Home size={18} className="mr-2" />, route: "dashboard" },
    {
      name: "Master Data",
      icon: <Settings size={18} className="mr-2" />,
      subMenu: [
        { name: "Sekolah", icon: <Layers size={16} />, route: "sekolahs.index" },
        { name: "Siswa", icon: <Users size={16} />, route: "siswas.index" },
        { name: "Kelas", icon: <Book size={16} />, route: "kelas.index" },
        { name: "Kategori", icon: <FileText size={16} />, route: "kategoris.index" },
      ],
    },
    {
      name: "Transaksi",
      icon: <Banknote size={18} className="mr-2" />,
      subMenu: [
        { name: "Tagihan", icon: <Banknote size={16} />, route: "tagihans.index" },
        { name: "Pembayaran", icon: <CreditCard size={16} />, route: "pembayarans.index" },
      ],
    },
    { name: "Laporan", icon: <Home size={18} className="mr-2" />, route: "laporan.index" },

    
  ];

  const isActive = (routeName) => url.includes(route(routeName, [], false));

  const renderMenu = (menu) => {
    if (!menu.subMenu) {
      return (
        <Link
          href={route(menu.route)}
          className={`flex items-center rounded-md px-3 py-2 text-sm ${
            isActive(menu.route)
              ? "bg-indigo-100 text-indigo-700 font-medium"
              : "text-gray-700 hover:bg-indigo-50"
          }`}
        >
          {menu.icon} {menu.name}
        </Link>
      );
    }

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleMenu(menu.name)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-indigo-50 rounded-md"
        >
          <span className="flex items-center">{menu.icon} {menu.name}</span>
          {openMenus[menu.name] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {openMenus[menu.name] && (
          <div className="pl-6 mt-1 flex flex-col space-y-1">
            {menu.subMenu.map((sub, j) => (
              <Link
                key={j}
                href={sub.route ? route(sub.route) : "#"}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  sub.route && isActive(sub.route)
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-indigo-50"
                }`}
              >
                {sub.icon && <span>{sub.icon}</span>} {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

return (
  <aside className="fixed top-0 left-0 w-64 bg-white border-r h-screen flex flex-col">
    {/* Header */}
    <div className="p-4 border-b">
      <h1 className="text-lg font-bold text-indigo-600">Aplikasi Keuangan</h1>
      <p className="text-xs text-gray-500">Enterprise</p>
    </div>

    {/* Menu */}
    <nav className="flex-1 overflow-y-auto p-2 space-y-1">
      {menus.map((menu, i) => (
        <div key={i}>{renderMenu(menu)}</div>
      ))}
    </nav>

    {/* Footer / User Profile dengan Dropdown */}
    <div className="p-4 border-t">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-gray-100">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
            <ChevronDown className="ml-auto w-4 h-4 text-gray-400" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          side="top"
          className="w-56 bg-white shadow-lg rounded-md border p-1"
        >
          <DropdownMenu.Item className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <Star size={16} /> Upgrade to Pro
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <UserIcon size={16} /> Account
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <Billing size={16} /> Billing
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <Bell size={16} /> Notifications
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t" />
          <DropdownMenu.Item className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 text-red-600 cursor-pointer">
            <LogOut size={16} /> Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </aside>
);

}
