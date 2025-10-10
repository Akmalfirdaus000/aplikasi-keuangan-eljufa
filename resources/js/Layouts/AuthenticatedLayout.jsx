"use client"

import { usePage } from "@inertiajs/react"
import Sidebar from "@/Components/Sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function AuthenticatedLayout({ header, children }) {
  const { auth } = usePage().props
  const user = auth?.user ?? { name: "Guest" }

  return (
    // pakai CSS var dari Sidebar. default 16rem biar aman saat SSR
    <div className="min-h-screen bg-gray-100 md:pl-[var(--sbw,16rem)]">
      {/* Sidebar handles desktop and mobile topbar */}
      <Sidebar />

      {/* Header sticky, kasih padding-top di mobile karena topbar tinggi ~48px */}
      {header && (
        <header className="bg-white sticky top-0 z-20 border-b md:pt-0 ">
          <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="min-w-0">{header}</div>
            <div className="text-gray-700 font-medium hidden sm:block">
              Halo, {user.name}
            </div>
          </div>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 ">
        <div className="mx-auto max-w-screen-2xl ">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  )
}
