import AdminShell from "../components/admin/AdminShell.jsx";
import { trpc } from "../lib/trpc";
import { formatRupiah } from "@shared/classContent";

export default function AdminOrdersPage() {
  const utils = trpc.useUtils();
  const query = trpc.commerceAdmin.orders.useQuery(undefined, { retry: false });
  const resend = trpc.commerceAdmin.resendEnrollmentEmail.useMutation({
    onSuccess: () => utils.commerceAdmin.orders.invalidate(),
  });
  return <AdminShell><div className="admin-title-row"><div><p className="eyebrow">Commerce</p><h1>Orders & Peserta</h1><p>Status transaksi DOKU dan pendaftaran kelas.</p></div></div>
    <section className="admin-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Invoice</th><th>Peserta</th><th>Kelas</th><th>Nominal</th><th>Status</th></tr></thead><tbody>
      {query.data?.map(row => <tr key={row.id}><td><strong>{row.invoiceNumber}</strong><small>{new Date(row.createdAt).toLocaleString("id-ID")}</small></td><td><strong>{row.student.name}</strong><small>{row.student.email}<br />{row.student.phone}</small></td><td>{row.className}</td><td>{formatRupiah(row.amount)}</td><td><span className={`order-status order-status--${row.status}`}>{row.status}</span>{row.status === "paid" && <button className="admin-inline-action" type="button" disabled={resend.isPending} onClick={() => resend.mutate({ orderId: row.publicId })}>Kirim ulang akses</button>}{row.status === "pending_payment" && row.paymentUrl && <a className="admin-inline-action" href={row.paymentUrl} target="_blank" rel="noreferrer">Buka payment</a>}</td></tr>)}
      {!query.isLoading && !query.data?.length && <tr><td colSpan="5">Belum ada order.</td></tr>}
    </tbody></table></div></section>
  </AdminShell>;
}
