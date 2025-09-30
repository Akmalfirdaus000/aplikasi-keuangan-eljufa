import { usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button, Card, Input, Select } from "@/Components/ui";




import { useForm } from "@inertiajs/react";

export default function Index() {
  const { tagihans = [] } = usePage().props;
  const paymentForm = useForm({ tagihan_id: "", nominal: "" });

  const submitPayment = (e) => {
    e.preventDefault();
    router.post(route("pembayarans.store"), paymentForm.data, {
      onSuccess: () => paymentForm.reset(),
    });
  };

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-bold">Pembayaran</h1>}>
      <div className="mb-4">
        <form onSubmit={submitPayment} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={paymentForm.data.tagihan_id}
            onChange={(e) => paymentForm.setData("tagihan_id", e.target.value)}
          >
            <option value="">Pilih Tagihan</option>
            {tagihans.map((t) => (
              <option key={t.id} value={t.id}>
                {t.siswa?.nama_siswa || "-"} | {t.kelas?.nama_kelas || "-"} | Sisa: Rp {t.sisa_tagihan.toLocaleString()}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Nominal"
            value={paymentForm.data.nominal}
            onChange={(e) => paymentForm.setData("nominal", e.target.value)}
          />

          <Button type="submit">Bayar</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tagihans.map((tagihan) => (
          <Card key={tagihan.id} className="p-4">
            <div className="font-semibold mb-1">{tagihan.siswa?.nama_siswa || "-"}</div>
            <div className="text-sm text-gray-600 mb-1">{tagihan.kelas?.nama_kelas || "-"}</div>
            <div className="text-sm text-gray-600 mb-1">{tagihan.kategori?.nama_kategori || "-"}</div>
            <div className="text-sm text-gray-800 mb-2">
              Total: Rp {tagihan.total_tagihan.toLocaleString()} | Sisa: Rp {tagihan.sisa_tagihan.toLocaleString()}
            </div>
          </Card>
        ))}
      </div>
    </AuthenticatedLayout>
  );
}
