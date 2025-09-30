import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Users, CreditCard, DollarSign } from 'lucide-react';

export default function Dashboard() {
    // Dummy data
    const stats = {
        siswa: 120,
        tagihan: 50000000,
        pembayaran: 35000000,
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Statistik Ringkas */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Card Siswa */}
                        <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                                <Users className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Jumlah Siswa
                                </h3>
                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {stats.siswa}
                                </p>
                            </div>
                        </div>

                        {/* Card Tagihan */}
                        <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                <CreditCard className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Total Tagihan
                                </h3>
                                <p className="mt-1 text-2xl font-bold text-red-600">
                                    Rp {new Intl.NumberFormat('id-ID').format(stats.tagihan)}
                                </p>
                            </div>
                        </div>

                        {/* Card Pembayaran */}
                        <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                    Total Pembayaran
                                </h3>
                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    Rp {new Intl.NumberFormat('id-ID').format(stats.pembayaran)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pesan Selamat Datang */}
                    <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">
                        <div className="p-6 text-gray-800">
                            <h3 className="text-lg font-semibold">
                                Selamat datang 🎓
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Gunakan menu di sidebar untuk mengelola siswa, kelas, kategori, tagihan, dan pembayaran.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
