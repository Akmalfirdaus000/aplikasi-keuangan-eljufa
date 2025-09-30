import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  Home,
  User,
  Book,
  Layers,
  Banknote,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Settings,
  FileText,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const { url } = usePage();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const menus = [
    { name: "Dashboard", icon: <Home size={20} className="mr-2" />, route: "dashboard" },
    {
      name: "Master Data",
      icon: <Settings size={20} className="mr-2" />,
      subMenu: [
        { name: "Sekolah", icon: <Layers size={20} className="mr-2" />, route: "sekolahs.index" },
        { name: "Siswa", icon: <Users size={20} className="mr-2" />, route: "siswas.index" },
        { name: "Kelas", icon: <Book size={20} className="mr-2" />, route: "kelas.index" },
        { name: "Kategori", icon: <FileText size={20} className="mr-2" />, route: "kategoris.index" },
      ],
    },
    {
      name: "Transaksi",
      icon: <Banknote size={20} className="mr-2" />,
      subMenu: [
        { name: "Tagihan", icon: <Banknote size={20} className="mr-2" />, route: "tagihans.index" },
        { name: "Pembayaran", icon: <CreditCard size={20} className="mr-2" />, route: "pembayarans.index" },
      ],
    },
    {
      name: "Laporan",
      icon: <FileText size={20} className="mr-2" />,
      subMenu: [
        { name: "Laporan Tagihan", route: "laporan.tagihan" },
        { name: "Laporan Pembayaran", route: "laporan.pembayaran" },
      ],
    },
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
              : "text-gray-700 hover:bg-indigo-100"
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
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-indigo-100 rounded-md"
        >
          <span className="flex items-center">{menu.icon} {menu.name}</span>
          {openMenus[menu.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openMenus[menu.name] && (
          <div className="pl-6 mt-1 flex flex-col space-y-1">
            {menu.subMenu.map((sub, j) => (
              <Link
                key={j}
                href={sub.route ? route(sub.route) : "#"}
                className={`flex items-center rounded-md px-3 py-2 text-sm ${
                  sub.route && isActive(sub.route)
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-700 hover:bg-indigo-100"
                }`}
              >
                {sub.icon && <span className="mr-2">{sub.icon}</span>} {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white shadow-md h-screen p-4 flex flex-col">
      <div className="text-lg font-bold text-indigo-600 mb-6">Aplikasi Keuangan</div>
      <nav className="flex-1 overflow-y-auto space-y-1">
        {menus.map((menu, i) => (
          <div key={i}>{renderMenu(menu)}</div>
        ))}
      </nav>
    </aside>
  );
}
