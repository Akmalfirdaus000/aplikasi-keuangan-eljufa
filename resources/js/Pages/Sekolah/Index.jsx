// import { useState } from "react";
// import { useForm, usePage } from "@inertiajs/react";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import Modal from "@/Components/UI/Modal";

// export default function Index() {
//     const { sekolahs } = usePage().props;
//     const [createOpen, setCreateOpen] = useState(false);
//     const [editOpen, setEditOpen] = useState(false);
//     const [editSekolah, setEditSekolah] = useState(null);

//     const createForm = useForm({ nama_sekolah: "" });
//     const editForm = useForm({ nama_sekolah: "" });

//     const submitCreate = (e) => {
//         e.preventDefault();
//         createForm.post(route("sekolahs.store"), {
//             onSuccess: () => {
//                 setCreateOpen(false);
//                 createForm.reset();
//             },
//         });
//     };

//     const openEdit = (sekolah) => {
//         setEditSekolah(sekolah);
//         editForm.setData({
//             nama_sekolah: sekolah.nama_sekolah,
//             id: sekolah.id,
//         });
//         setEditOpen(true);
//     };

//     const submitEdit = (e) => {
//         e.preventDefault();
//         editForm.put(route("sekolahs.update", editForm.data.id), {
//             onSuccess: () => setEditOpen(false),
//         });
//     };

//     return (
//         <AuthenticatedLayout
//             header={<h1 className="text-xl font-bold">Master Data Sekolah</h1>}
//         >
//             <div className="mb-4 flex justify-end">
//                 <button
//                     onClick={() => setCreateOpen(true)}
//                     className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
//                 >
//                     Tambah Sekolah
//                 </button>
//             </div>

//             <div className="bg-white shadow rounded-md overflow-hidden">
//                 <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                                 #
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                                 Nama Sekolah
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                                 Aksi
//                             </th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                         {sekolahs.map((sekolah, index) => (
//                             <tr key={sekolah.id}>
//                                 <td className="px-6 py-4">{index + 1}</td>
//                                 <td className="px-6 py-4">
//                                     {sekolah.nama_sekolah}
//                                 </td>
//                                 <td className="px-6 py-4 space-x-2">
//                                     <button
//                                         onClick={() => openEdit(sekolah)}
//                                         className="text-indigo-600 hover:text-indigo-900"
//                                     >
//                                         Edit
//                                     </button>
//                                     <form
//                                         method="POST"
//                                         action={route(
//                                             "sekolahs.destroy",
//                                             sekolah.id
//                                         )}
//                                         className="inline"
//                                     >
//                                         <input
//                                             type="hidden"
//                                             name="_method"
//                                             value="DELETE"
//                                         />
//                                         <input
//                                             type="hidden"
//                                             name="_token"
//                                             value={usePage().props.csrf_token}
//                                         />
//                                         <button
//                                             onClick={() => {
//                                                 if (
//                                                     confirm(
//                                                         "Yakin ingin menghapus sekolah ini?"
//                                                     )
//                                                 ) {
//                                                     Inertia.delete(
//                                                         route(
//                                                             "sekolahs.destroy",
//                                                             sekolah.id
//                                                         ),
//                                                         {
//                                                             onSuccess: () =>
//                                                                 console.log(
//                                                                     "Sekolah dihapus"
//                                                                 ),
//                                                         }
//                                                     );
//                                                 }
//                                             }}
//                                             className="text-red-600 hover:text-red-900"
//                                         >
//                                             Hapus
//                                         </button>
//                                     </form>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Modal Create */}
//             <Modal
//                 open={createOpen}
//                 setOpen={setCreateOpen}
//                 title="Tambah Sekolah"
//             >
//                 <form onSubmit={submitCreate}>
//                     <input
//                         type="text"
//                         placeholder="Nama Sekolah"
//                         value={createForm.data.nama_sekolah}
//                         onChange={(e) =>
//                             createForm.setData("nama_sekolah", e.target.value)
//                         }
//                         className="w-full border px-3 py-2 rounded-md mb-2"
//                     />
//                     {createForm.errors.nama_sekolah && (
//                         <div className="text-red-600 text-sm mb-2">
//                             {createForm.errors.nama_sekolah}
//                         </div>
//                     )}
//                     <button
//                         type="submit"
//                         className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
//                         disabled={createForm.processing}
//                     >
//                         Simpan
//                     </button>
//                 </form>
//             </Modal>

//             {/* Modal Edit */}
//             {editSekolah && (
//                 <Modal
//                     open={editOpen}
//                     setOpen={setEditOpen}
//                     title="Edit Sekolah"
//                 >
//                     <form onSubmit={submitEdit}>
//                         <input
//                             type="text"
//                             value={editForm.data.nama_sekolah}
//                             onChange={(e) =>
//                                 editForm.setData("nama_sekolah", e.target.value)
//                             }
//                             className="w-full border px-3 py-2 rounded-md mb-2"
//                         />
//                         {editForm.errors.nama_sekolah && (
//                             <div className="text-red-600 text-sm mb-2">
//                                 {editForm.errors.nama_sekolah}
//                             </div>
//                         )}
//                         <button
//                             type="submit"
//                             className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
//                             disabled={editForm.processing}
//                         >
//                             Update
//                         </button>
//                     </form>
//                 </Modal>
//             )}
//         </AuthenticatedLayout>
//     );
// }
