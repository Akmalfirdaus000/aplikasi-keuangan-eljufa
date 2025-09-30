// import { useState } from "react";
// import { usePage, router, useForm } from "@inertiajs/react";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import Modal from "@/Components/UI/Modal";

// export default function Index() {
//     const { kategoriList } = usePage().props;
//     const [kategoriData, setKategoriData] = useState(kategoriList);
//     const [createOpen, setCreateOpen] = useState(false);
//     const [editOpen, setEditOpen] = useState(false);
//     const [editKategori, setEditKategori] = useState(null);

//     const createForm = useForm({ nama_kategori: "" });
//     const editForm = useForm({ id: "", nama_kategori: "" });

//     const submitCreate = (e) => {
//         e.preventDefault();
//         router.post(route("kategori.store"), createForm.data, {
//             onSuccess: () => {
//                 setCreateOpen(false);
//                 createForm.reset();
//             },
//         });
//     };

//     const openEdit = (kategori) => {
//         setEditKategori(kategori);
//         editForm.setData({ id: kategori.id, nama_kategori: kategori.nama_kategori });
//         setEditOpen(true);
//     };

//     const submitEdit = (e) => {
//         e.preventDefault();
//         router.put(route("kategori.update", editForm.data.id), editForm.data, {
//             onSuccess: () => setEditOpen(false),
//         });
//     };

//     const handleDelete = (id) => {
//         if (!confirm("Yakin ingin menghapus kategori ini?")) return;

//         router.delete(route("kategori.destroy", id), {
//             onSuccess: () => setKategoriData((prev) => prev.filter((k) => k.id !== id)),
//         });
//     };

//     return (
//         <AuthenticatedLayout header={<h1 className="text-xl font-bold">Master Data Kategori</h1>}>
//             <div className="mb-4 flex justify-end">
//                 <button
//                     onClick={() => setCreateOpen(true)}
//                     className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
//                 >
//                     Tambah Kategori
//                 </button>
//             </div>

//             <div className="bg-white shadow rounded-md overflow-hidden">
//                 <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                         {kategoriData.map((kategori, index) => (
//                             <tr key={kategori.id}>
//                                 <td className="px-6 py-4">{index + 1}</td>
//                                 <td className="px-6 py-4">{kategori.nama_kategori}</td>
//                                 <td className="px-6 py-4 space-x-2">
//                                     <button
//                                         onClick={() => openEdit(kategori)}
//                                         className="text-indigo-600 hover:text-indigo-900"
//                                     >
//                                         Edit
//                                     </button>
//                                     <button
//                                         onClick={() => handleDelete(kategori.id)}
//                                         className="text-red-600 hover:text-red-900"
//                                     >
//                                         Hapus
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Modal Tambah */}
//             <Modal open={createOpen} setOpen={setCreateOpen} title="Tambah Kategori">
//                 <form onSubmit={submitCreate} className="space-y-2">
//                     <input
//                         type="text"
//                         placeholder="Nama Kategori"
//                         value={createForm.data.nama_kategori}
//                         onChange={(e) => createForm.setData("nama_kategori", e.target.value)}
//                         className="w-full border px-3 py-2 rounded-md"
//                     />
//                     {createForm.errors.nama_kategori && (
//                         <div className="text-red-600 text-sm">{createForm.errors.nama_kategori}</div>
//                     )}
//                     <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
//                         Simpan
//                     </button>
//                 </form>
//             </Modal>

//             {/* Modal Edit */}
//             {editKategori && (
//                 <Modal open={editOpen} setOpen={setEditOpen} title="Edit Kategori">
//                     <form onSubmit={submitEdit} className="space-y-2">
//                         <input
//                             type="text"
//                             value={editForm.data.nama_kategori}
//                             onChange={(e) => editForm.setData("nama_kategori", e.target.value)}
//                             className="w-full border px-3 py-2 rounded-md"
//                         />
//                         {editForm.errors.nama_kategori && (
//                             <div className="text-red-600 text-sm">{editForm.errors.nama_kategori}</div>
//                         )}
//                         <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
//                             Update
//                         </button>
//                     </form>
//                 </Modal>
//             )}
//         </AuthenticatedLayout>
//     );
// }
