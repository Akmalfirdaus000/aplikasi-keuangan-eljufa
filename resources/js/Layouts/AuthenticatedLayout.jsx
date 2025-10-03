import { usePage } from "@inertiajs/react"
import Sidebar from "@/Components/Sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props
    const user = auth?.user ?? { name: "Guest" }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar fixed */}
            <Sidebar />

            {/* Main content area (digeser 64px biar gak ketiban sidebar) */}
            <div className="ml-64 flex flex-col min-h-screen">
                {/* Header */}
                {header && (
                    <header className="bg-white shadow flex-shrink-0">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                            <div>{header}</div>
                            <div className="text-gray-700 font-medium">
                                Halo, {user.name}
                            </div>
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* ✅ Toaster harus ada di root layout */}
            <Toaster />
        </div>
    )
}
