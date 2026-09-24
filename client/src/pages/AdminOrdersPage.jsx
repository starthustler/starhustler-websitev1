import { CheckCircle2, CircleAlert, Clock3, Info, RefreshCw } from "lucide-react";
import AdminShell from "../components/admin/AdminShell.jsx";
import { trpc } from "../lib/trpc";
import { formatRupiah } from "@shared/classContent";

const orderLabels = {
  pending_payment: "Menunggu pembayaran",
  paid: "Sudah dibayar",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

const activityIcons = {
  success: CheckCircle2,
  error: CircleAlert,
  warning: CircleAlert,
  info: Info,
};

export default function AdminOrdersPage() {
  const utils = trpc.useUtils();
  const orders = trpc.commerceAdmin.orders.useQuery(undefined, { retry: false });
  const logs = trpc.commerceAdmin.paymentLogs.useQuery({ limit: 100 }, {
    retry: false,
    refetchInterval: 30_000,
  });
  const resend = trpc.commerceAdmin.resendEnrollmentEmail.useMutation({
    onSuccess: () => utils.commerceAdmin.orders.invalidate(),
  });
  const refresh = () => {
    orders.refetch();
    logs.refetch();
  };

  return <AdminShell>
    <div className="admin-title-row"><div><p className="eyebrow">Commerce</p><h1>Orders & Pembayaran</h1><p>Pantau peserta, transaksi DOKU, dan penyebab kendala dalam bahasa sederhana.</p></div><button className="button button--secondary" type="button" onClick={refresh} disabled={orders.isFetching || logs.isFetching}><RefreshCw size={17}/> Perbarui</button></div>

    <section className="admin-panel">
      <div className="admin-panel__heading"><h2>Aktivitas pembayaran terbaru</h2><p>Diperbarui otomatis setiap 30 detik. Credential dan data rahasia tidak pernah ditampilkan.</p></div>
      {logs.isError && <p className="admin-alert admin-alert--error">Log belum dapat dimuat. Coba klik Perbarui.</p>}
      <div className="payment-log-list">
        {(logs.data || []).map(item => {
          const Icon = activityIcons[item.status] || Clock3;
          return <article className={`payment-log payment-log--${item.status}`} key={item.id}>
            <div className="payment-log__icon"><Icon size={20}/></div>
            <div className="payment-log__body">
              <div className="payment-log__heading"><strong>{item.title}</strong><time>{new Date(item.createdAt).toLocaleString("id-ID")}</time></div>
              <p>{item.message}</p>
              <div className="payment-log__meta">
                {item.invoiceNumber && <span>Invoice: <b>{item.invoiceNumber}</b></span>}
                {item.environment && <span>Mode: <b>{item.environment === "production" ? "Production" : "Sandbox"}</b></span>}
                {item.httpStatus && <span>HTTP: <b>{item.httpStatus}</b></span>}
                {item.providerCode && <span>Kode DOKU: <b>{item.providerCode}</b></span>}
                {item.requestId && <span>Request ID: <code>{item.requestId}</code></span>}
              </div>
            </div>
          </article>;
        })}
        {!logs.isLoading && !logs.data?.length && <div className="payment-log-empty"><Clock3 size={22}/><p>Belum ada aktivitas pembayaran. Log akan muncul saat peserta mencoba mendaftar.</p></div>}
      </div>
    </section>

    <section className="admin-panel"><div className="admin-panel__heading"><h2>Daftar order</h2><p>Order dibuat sebelum website meminta link pembayaran ke DOKU.</p></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Invoice</th><th>Peserta</th><th>Kelas</th><th>Nominal</th><th>Status</th></tr></thead><tbody>
      {orders.data?.map(row => <tr key={row.id}><td><strong>{row.invoiceNumber}</strong><small>{new Date(row.createdAt).toLocaleString("id-ID")}</small></td><td><strong>{row.student.name}</strong><small>{row.student.email}<br />{row.student.phone}</small></td><td>{row.className}</td><td>{formatRupiah(row.amount)}</td><td><span className={`order-status order-status--${row.status}`}>{orderLabels[row.status] || row.status}</span>{row.status === "paid" && <button className="admin-inline-action" type="button" disabled={resend.isPending} onClick={() => resend.mutate({ orderId: row.publicId })}>Kirim ulang akses</button>}{row.status === "pending_payment" && row.paymentUrl && <a className="admin-inline-action" href={row.paymentUrl} target="_blank" rel="noreferrer">Buka payment</a>}</td></tr>)}
      {!orders.isLoading && !orders.data?.length && <tr><td colSpan="5">Belum ada order.</td></tr>}
    </tbody></table></div></section>
  </AdminShell>;
}
