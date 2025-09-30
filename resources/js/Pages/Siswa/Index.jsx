// import { useState, useEffect } from "react";
// import { useForm, usePage, router } from "@inertiajs/react";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import Modal from "@/Components/UI/Modal";

// export default function Index() {
//     const { siswas, sekolahList } = usePage().props;

//     const [createOpen, setCreateOpen] = useState(false);
//     const [editOpen, setEditOpen] = useState(false);
//     const [editSiswa, setEditSiswa] = useState(null);

//     const createForm = useForm({ sekolah_id: "", kelas_id: "", lokal: "", nama_siswa: "" });
//     const editForm = useForm({ id: "", sekolah_id: "", kelas_id: "", lokal: "", nama_siswa: "" });

//     const [kelasOptionsCreate, setKelasOptionsCreate] = useState([]);
//     const [lokalOptionsCreate, setLokalOptionsCreate] = useState([]);

//     const [kelasOptionsEdit, setKelasOptionsEdit] = useState([]);
//     const [lokalOptionsEdit, setLokalOptionsEdit] = useState([]);

//     // Create: update kelas saat sekolah berubah
//     useEffect(() => {
//         if (createForm.data.sekolah_id) {
//             const sekolah = sekolahList.find(s => s.id === parseInt(createForm.data.sekolah_id));
//             setKelasOptionsCreate(sekolah?.kelas || []);
//             createForm.setData("kelas_id", "");
//             setLokalOptionsCreate([]);
//             createForm.setData("lokal", "");
//         } else {
//             setKelasOptionsCreate([]);
//             createForm.setData("kelas_id", "");
//             setLokalOptionsCreate([]);
//             createForm.setData("lokal", "");
//         }
//     }, [createForm.data.sekolah_id]);

//     // Create: update lokal saat kelas berubah
//     useEffect(() => {
//         if (createForm.data.kelas_id) {
//             const kelas = kelasOptionsCreate.find(k => k.id === parseInt(createForm.data.kelas_id));
//             if (kelas) {
//                 if (kelas.tingkat === "TK") {
//                     setLokalOptionsCreate(["Umum"]);
//                     createForm.setData("lokal", "Umum");
//                 } else {
//                     setLokalOptionsCreate(["A","B","C"]);
//                     createForm.setData("lokal", "");
//                 }
//             }
//         } else {
//             setLokalOptionsCreate([]);
//             createForm.setData("lokal", "");
//         }
//     }, [createForm.data.kelas_id]);

//     // Edit: update kelas saat sekolah berubah
//     useEffect(() => {
//         if (editForm.data.sekolah_id) {
//             const sekolah = sekolahList.find(s => s.id === parseInt(editForm.data.sekolah_id));
//             setKelasOptionsEdit(sekolah?.kelas || []);
//             editForm.setData("kelas_id", "");
//             setLokalOptionsEdit([]);
//             editForm.setData("lokal", "");
//         } else {
//             setKelasOptionsEdit([]);
//             editForm.setData("kelas_id", "");
//             setLokalOptionsEdit([]);
//             editForm.setData("lokal", "");
//         }
//     }, [editForm.data.sekolah_id]);

//     // Edit: update lokal saat kelas berubah
//     useEffect(() => {
//         if (editForm.data.kelas_id) {
//             const kelas = kelasOptionsEdit.find(k => k.id === parseInt(editForm.data.kelas_id));
//             if (kelas) {
//                 if (kelas.tingkat === "TK") {
//                     setLokalOptionsEdit(["Umum"]);
//                     editForm.setData("lokal", "Umum");
//                 } else {
//                     setLokalOptionsEdit(["A","B","C"]);
//                     editForm.setData("lokal", "");
//                 }
//             }
//         } else {
//             setLokalOptionsEdit([]);
//             editForm.setData("lokal", "");
//         }
//     }, [editForm.data.kelas_id]);

//     const submitCreate = (e) => {
//         e.preventDefault();
//         router.post(route("siswas.store"), createForm.data, {
//             onSuccess: () => {
//                 setCreateOpen(false);
//                 createForm.reset();
//             },
//         });
//     };

//     const openEdit = (siswa) => {
//         setEditSiswa(siswa);
//         editForm.setData({
//             id: siswa.id,
//             nama_siswa: siswa.nama_siswa,
//             sekolah_id: siswa.kelas.sekolah.id,
//             kelas_id: siswa.kelas.id,
//             lokal: siswa.kelas.lokal,
//         });
//         setEditOpen(true);
//     };

//     const submitEdit = (e) => {
//         e.preventDefault();
//         router.put(route("siswas.update", editForm.data.id), editForm.data, {
//             onSuccess: () => setEditOpen(false),
//         });
//     };

//     const handleDelete = (id) => {
//         if (confirm("Yakin ingin menghapus siswa ini?")) {
//             router.delete(route("siswas.destroy", id));
//         }
//     };

//     return (
//         <AuthenticatedLayout header={<h1 className="text-xl font-bold">Master Data Siswa</h1>}>
//             <div className="mb-4 flex justify-end">
//                 <button
//                     onClick={() => setCreateOpen(true)}
//                     className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
//                 >
//                     Tambah Siswa
//                 </button>
//             </div>

//             {/* Table */}
//             <div className="bg-white shadow rounded-md overflow-hidden">
//                 <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sekolah</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokal</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                         {siswas.map((siswa, idx) => (
//                             <tr key={siswa.id}>
//                                 <td className="px-6 py-4">{idx + 1}</td>
//                                 <td className="px-6 py-4">{siswa.nama_siswa}</td>
//                                 <td className="px-6 py-4">{siswa.kelas.sekolah.nama_sekolah}</td>
//                                 <td className="px-6 py-4">{siswa.kelas.nama_kelas}</td>
//                                 <td className="px-6 py-4">{siswa.kelas.lokal}</td>
//                                 <td className="px-6 py-4 space-x-2">
//                                     <button onClick={() => openEdit(siswa)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
//                                     <button onClick={() => handleDelete(siswa.id)} className="text-red-600 hover:text-red-900">Hapus</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Modal Create */}
//            <Modal open={createOpen} setOpen={setCreateOpen} title="Tambah Siswa">
//     <form onSubmit={submitCreate} className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
//         {/* Pilih Sekolah */}
//         <div className="flex flex-col">
//             <label className="text-sm font-medium text-gray-700 mb-1">Sekolah</label>
//             <select
//                 value={createForm.data.sekolah_id}
//                 onChange={e => createForm.setData("sekolah_id", e.target.value)}
//                 className="w-full border px-3 py-2 rounded-md"
//             >
//                 <option value="">Pilih Sekolah</option>
//                 {sekolahList.map(s => (
//                     <option key={s.id} value={s.id}>{s.nama_sekolah}</option>
//                 ))}
//             </select>
//         </div>

//         {/* Pilih Kelas */}
//         <div className="flex flex-col">
//             <label className="text-sm font-medium text-gray-700 mb-1">Kelas</label>
//             <select
//                 value={createForm.data.kelas_id}
//                 onChange={e => createForm.setData("kelas_id", e.target.value)}
//                 className="w-full border px-3 py-2 rounded-md"
//                 disabled={!kelasOptionsCreate.length}
//             >
//                 <option value="">Pilih Kelas</option>
//                 {kelasOptionsCreate.map(k => (
//                     <option key={k.id} value={k.id}>{k.nama_kelas}</option>
//                 ))}
//             </select>
//         </div>

//         {/* Pilih Lokal */}
//         <div className="flex flex-col">
//             <label className="text-sm font-medium text-gray-700 mb-1">Lokal</label>
//             <select
//                 value={createForm.data.lokal}
//                 onChange={e => createForm.setData("lokal", e.target.value)}
//                 className="w-full border px-3 py-2 rounded-md"
//                 disabled={!lokalOptionsCreate.length}
//             >
//                 <option value="">Pilih Lokal</option>
//                 {lokalOptionsCreate.map(l => (
//                     <option key={l} value={l}>{l}</option>
//                 ))}
//             </select>
//         </div>

//         {/* Nama Siswa */}
//         <div className="flex flex-col col-span-full">
//             <label className="text-sm font-medium text-gray-700 mb-1">Nama Siswa</label>
//             <input
//                 type="text"
//                 placeholder="Nama Siswa"
//                 value={createForm.data.nama_siswa}
//                 onChange={e => createForm.setData("nama_siswa", e.target.value)}
//                 className="w-full border px-3 py-2 rounded-md"
//             />
//             {createForm.errors.nama_siswa && (
//                 <div className="text-red-600 text-sm mt-1">{createForm.errors.nama_siswa}</div>
//             )}
//         </div>

//         {/* Tombol Simpan */}
//         <div className="col-span-full flex justify-end">
//             <button
//                 type="submit"
//                 className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
//                 disabled={createForm.processing}
//             >
//                 Simpan
//             </button>
//         </div>
//     </form>
// </Modal>


//             {/* Modal Edit */}
//           {editSiswa && (
//     <Modal open={editOpen} setOpen={setEditOpen} title="Edit Siswa">
//         <form onSubmit={submitEdit} className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
//             {/* Pilih Sekolah */}
//             <div className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 mb-1">Sekolah</label>
//                 <select
//                     value={editForm.data.sekolah_id}
//                     onChange={e => editForm.setData("sekolah_id", e.target.value)}
//                     className="w-full border px-3 py-2 rounded-md"
//                 >
//                     <option value="">Pilih Sekolah</option>
//                     {sekolahList.map(s => (
//                         <option key={s.id} value={s.id}>{s.nama_sekolah}</option>
//                     ))}
//                 </select>
//             </div>

//             {/* Pilih Kelas */}
//             <div className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 mb-1">Kelas</label>
//                 <select
//                     value={editForm.data.kelas_id}
//                     onChange={e => editForm.setData("kelas_id", e.target.value)}
//                     className="w-full border px-3 py-2 rounded-md"
//                     disabled={!kelasOptionsEdit.length}
//                 >
//                     <option value="">Pilih Kelas</option>
//                     {kelasOptionsEdit.map(k => (
//                         <option key={k.id} value={k.id}>{k.nama_kelas}</option>
//                     ))}
//                 </select>
//             </div>

//             {/* Pilih Lokal */}
//             <div className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 mb-1">Lokal</label>
//                 <select
//                     value={editForm.data.lokal}
//                     onChange={e => editForm.setData("lokal", e.target.value)}
//                     className="w-full border px-3 py-2 rounded-md"
//                     disabled={!lokalOptionsEdit.length}
//                 >
//                     <option value="">Pilih Lokal</option>
//                     {lokalOptionsEdit.map(l => (
//                         <option key={l} value={l}>{l}</option>
//                     ))}
//                 </select>
//             </div>

//             {/* Nama Siswa */}
//             <div className="flex flex-col col-span-full">
//                 <label className="text-sm font-medium text-gray-700 mb-1">Nama Siswa</label>
//                 <input
//                     type="text"
//                     value={editForm.data.nama_siswa}
//                     onChange={e => editForm.setData("nama_siswa", e.target.value)}
//                     className="w-full border px-3 py-2 rounded-md"
//                 />
//                 {editForm.errors.nama_siswa && (
//                     <div className="text-red-600 text-sm mt-1">{editForm.errors.nama_siswa}</div>
//                 )}
//             </div>

//             {/* Tombol Update */}
//             <div className="col-span-full flex justify-end">
//                 <button
//                     type="submit"
//                     className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
//                     disabled={editForm.processing}
//                 >
//                     Update
//                 </button>
//             </div>
//         </form>
//     </Modal>
// )}

//         </AuthenticatedLayout>
//     );
// }
