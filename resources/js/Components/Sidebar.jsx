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
    ChevronUp
} from "lucide-react";

export default function Sidebar() {
    const { url } = usePage();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (name) => {
        setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const menus = [
        {
            name: "Dashboard",
            icon: <Home size={20} className="mr-2" />,
            route: "dashboard",
        },
        {
            name: "Master Data",
            subMenu: [
                { name: "Sekolah", icon: <Layers size={20} className="mr-2" />, route: "sekolahs.index" },
                { name: "Siswa", icon: <User size={20} className="mr-2" />, route: "siswas.index" },
                { name: "Kelas", icon: <Book size={20} className="mr-2" />, route: "kelas.index" },
                { name: "Kategori", icon: <Layers size={20} className="mr-2" />, route: "kategoris.index" },
            ],
        },
        {
            name: "Transaksi",
            subMenu: [
                { name: "Tagihan", icon: <Banknote size={20} className="mr-2" />, route: "tagihans.index" },
                { name: "Pembayaran", icon: <CreditCard size={20} className="mr-2" />, route: "pembayarans.index" },
            ],
        },
    ];

    const isActive = (routeName) => url.includes(route(routeName, [], false));

    return (
        <aside className="w-64 bg-white shadow-md h-screen p-4 flex flex-col">
            <div className="text-lg font-bold text-indigo-600 mb-6">
                Aplikasi Keuangan
            </div>

            <nav className="flex-1 overflow-y-auto">
                {menus.map((menu, i) => (
                    <div key={i} className="mb-1">
                        {!menu.subMenu ? (
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
                        ) : (
                            <div>
                                <button
                                    type="button"
                                    onClick={() => toggleMenu(menu.name)}
                                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-indigo-100 rounded-md"
                                >
                                    <span>{menu.name}</span>
                                    {openMenus[menu.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {openMenus[menu.name] && (
                                    <div className="pl-4 mt-1 flex flex-col space-y-1">
                                        {menu.subMenu.map((sub, j) => (
                                            <Link
                                                key={j}
                                                href={route(sub.route)}
                                                className={`flex items-center rounded-md px-3 py-2 text-sm ${
                                                    isActive(sub.route)
                                                        ? "bg-indigo-100 text-indigo-700 font-medium"
                                                        : "text-gray-700 hover:bg-indigo-100"
                                                }`}
                                            >
                                                {sub.icon} {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
