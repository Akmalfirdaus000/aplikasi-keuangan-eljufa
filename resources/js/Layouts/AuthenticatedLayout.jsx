import { usePage } from "@inertiajs/react"
import Sidebar from "@/Components/Sidebar"
import { Toaster } from "@/components/ui/toaster" // ✅ Import Toaster

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props
    const user = auth?.user ?? { name: "Guest" }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
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
