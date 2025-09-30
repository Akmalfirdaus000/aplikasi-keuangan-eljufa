// import { useState } from "react";
// import { useForm, usePage, router } from "@inertiajs/react";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import Modal from "@/Components/UI/Modal";

// export default function Index() {
//     const { kelasList, sekolahList } = usePage().props;

//     const [createOpen, setCreateOpen] = useState(false);
//     const [editOpen, setEditOpen] = useState(false);
//     const [editKelas, setEditKelas] = useState(null);

//     const createForm = useForm({ sekolah_id: "", tingkat: "", nama_kelas: "", lokal: "" });
//     const editForm = useForm({ id: "", sekolah_id: "", tingkat: "", nama_kelas: "", lokal: "" });

//     const tingkatOptions = ["TK", "1", "2", "3", "4", "5", "6"];
//     const lokalOptions = ["A", "B", "C", "Umum"];

//     const submitCreate = (e) => {
//         e.preventDefault();
//         router.post(route("kelas.store"), createForm.data, {
//             onSuccess: () => {
//                 setCreateOpen(false);
//                 createForm.reset();
//             },
//         });
//     };

//     const openEdit = (kelas) => {
//         setEditKelas(kelas);
//         editForm.setData({
//             id: kelas.id,
//             sekolah_id: kelas.sekolah.id,
//             tingkat: kelas.tingkat,
//             nama_kelas: kelas.nama_kelas,
//             lokal: kelas.lokal,
//         });
//         setEditOpen(true);
//     };

//     const submitEdit = (e) => {
//         e.preventDefault();
//         router.put(route("kelas.update", editForm.data.id), editForm.data, {
//             onSuccess: () => setEditOpen(false),
//         });
//     };

//  const handleDelete = (id) => {
//         if (!confirm("Yakin ingin menghapus kelas ini?")) return;

//         router.delete(route("kelas.destroy", id), {
//             onSuccess: () => {
//                 // Hapus kelas dari state supaya tabel otomatis update
//                 setKelasData((prev) => prev.filter((k) => k.id !== id));
//             },
//             onError: (errors) => console.error(errors),
//         });
//     };

//     return (
//         <AuthenticatedLayout header={<h1 className="text-xl font-bold">Master Data Kelas</h1>}>
//             <div className="mb-4 flex justify-end">
//                 <button
//                     onClick={() => setCreateOpen(true)}
//                     className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
//                 >
//                     Tambah Kelas
//                 </button>
//             </div>

//             <div className="bg-white shadow rounded-md overflow-hidden">
//                 <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sekolah</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tingkat</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kelas</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokal</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                         {kelasList.map((kelas, index) => (
//                             <tr key={kelas.id}>
//                                 <td className="px-6 py-4">{index + 1}</td>
//                                 <td className="px-6 py-4">{kelas.sekolah.nama_sekolah}</td>
//                                 <td className="px-6 py-4">{kelas.tingkat}</td>
//                                 <td className="px-6 py-4">{kelas.nama_kelas}</td>
//                                 <td className="px-6 py-4">{kelas.lokal}</td>
//                                 <td className="px-6 py-4 space-x-2">
//                                     <button onClick={() => openEdit(kelas)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
//                                     <button
//                                         onClick={() => handleDelete(kelas.id)}
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

//             {/* Modal Create */}
//             <Modal open={createOpen} setOpen={setCreateOpen} title="Tambah Kelas">
//                 <form onSubmit={submitCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <select value={createForm.data.sekolah_id} onChange={e => createForm.setData("sekolah_id", e.target.value)} className="w-full border px-3 py-2 rounded-md">
//                         <option value="">Pilih Sekolah</option>
//                         {sekolahList.map(s => <option key={s.id} value={s.id}>{s.nama_sekolah}</option>)}
//                     </select>

//                     <select value={createForm.data.tingkat} onChange={e => createForm.setData("tingkat", e.target.value)} className="w-full border px-3 py-2 rounded-md">
//                         <option value="">Pilih Tingkat</option>
//                         {tingkatOptions.map(t => <option key={t} value={t}>{t}</option>)}
//                     </select>

//                     <input type="text" placeholder="Nama Kelas" value={createForm.data.nama_kelas} onChange={e => createForm.setData("nama_kelas", e.target.value)} className="w-full border px-3 py-2 rounded-md" />

//                     <select value={createForm.data.lokal} onChange={e => createForm.setData("lokal", e.target.value)} className="w-full border px-3 py-2 rounded-md">
//                         <option value="">Pilih Lokal</option>
//                         {lokalOptions.map(l => <option key={l} value={l}>{l}</option>)}
//                     </select>

//                     <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 col-span-full" disabled={createForm.processing}>Simpan</button>
//                 </form>
//             </Modal>

//             {/* Modal Edit */}
//             {editKelas && (
//                 <Modal open={editOpen} setOpen={setEditOpen} title="Edit Kelas">
//                     <form onSubmit={submitEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <select value={editForm.data.sekolah_id} onChange={e => editForm.setData("sekolah_id", e.target.value)} className="w-full border px-3 py-2 rounded-md">
//                             <option value="">Pilih Sekolah</option>
//                             {sekolahList.map(s => <option key={s.id} value={s.id}>{s.nama_sekolah}</option>)}
//                         </select>

//                         <select value={editForm.data.tingkat} onChange={e => editForm.setData("tingkat", e.target.value)} className="w-full border px-3 py-2 rounded-md">
//                             <option value="">Pilih Tingkat</option>
//                             {tingkatOptions.map(t => <option key={t} value={t}>{t}</option>)}
//                         </select>

//                         <input type="text" value={editForm.data.nama_kelas} onChange={e => editForm.setData("nama_kelas", e.target.value)} className="w-full border px-3 py-2 rounded-md" />

//                         <select value={editForm.data.lokal} onChange={e => editForm.setData("lokal", e.target.value)} className="w-full border px-3 py-2 rounded-md">
//                             <option value="">Pilih Lokal</option>
//                             {lokalOptions.map(l => <option key={l} value={l}>{l}</option>)}
//                         </select>

//                         <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 col-span-full" disabled={editForm.processing}>Update</button>
//                     </form>
//                 </Modal>
//             )}
//         </AuthenticatedLayout>
//     );
// }
