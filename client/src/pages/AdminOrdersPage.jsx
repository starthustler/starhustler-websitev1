import { useState } from "react";
import { CheckCircle2, CircleAlert, Clock3, Info, RefreshCw } from "lucide-react";
import AdminShell from "../components/admin/AdminShell.jsx";
import { trpc } from "../lib/trpc";
import { formatRupiah } from "@shared/classContent";

const orderLabels = { pending_payment: "Pending", paid: "Berhasil", failed: "Gagal", expired: "Gagal" };
const activityIcons = { success: CheckCircle2, error: CircleAlert, warning: CircleAlert, info: Info };

function EmailStatus({ delivery }) {
  const status = delivery?.status === "sent" ? "sent" : delivery?.status === "failed" ? "failed" : "pending";
  const label = status === "sent" ? "Terkirim" : status === "failed" ? "Gagal" : "Belum Terkirim";
  return <div className="email-delivery-status" title={delivery?.lastError || ""}>
    <span className={`order-status order-status--email-${status}`}>{label}</span>
    {delivery && <small>{delivery.sentAt ? new Date(delivery.sentAt).toLocaleString("id-ID") : `${delivery.attempts || 0} percobaan`}</small>}
    {delivery?.lastError && <small className="email-delivery-status__error">{delivery.lastError}</small>}
  </div>;
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();
  const orders = trpc.commerceAdmin.orders.useQuery({ page, pageSize: 25 }, { retry: false, refetchInterval: 30_000 });
  const logs = trpc.commerceAdmin.paymentLogs.useQuery({ limit: 25 }, { retry: false, refetchInterval: 30_000 });
  const resend = trpc.commerceAdmin.resendEnrollmentEmail.useMutation({ onSuccess: () => utils.commerceAdmin.orders.invalidate() });
  const refresh = () => { orders.refetch(); logs.refetch(); };
  const summary = orders.data?.summary || { paid: 0, pending: 0, failed: 0 };

  return <AdminShell>
    <div className="admin-title-row"><div><p className="eyebrow">Commerce</p><h1>Orders & Pembayaran</h1><p>Pantau peserta, pembayaran DOKU, dan email konfirmasi dari satu halaman.</p></div><button className="button button--secondary" type="button" onClick={refresh} disabled={orders.isFetching || logs.isFetching}><RefreshCw size={17}/> Perbarui</button></div>

    <section className="order-summary-grid" aria-label="Ringkasan pembayaran">
      <article className="order-summary-card order-summary-card--paid"><CheckCircle2/><span>Pembayaran Berhasil</span><strong>{summary.paid}</strong></article>
      <article className="order-summary-card order-summary-card--pending"><Clock3/><span>Pembayaran Pending</span><strong>{summary.pending}</strong></article>
      <article className="order-summary-card order-summary-card--failed"><CircleAlert/><span>Pembayaran Gagal</span><strong>{summary.failed}</strong></article>
    </section>

    <section className="admin-panel"><div className="admin-panel__heading"><h2>Daftar Order</h2><p>Menampilkan maksimal 25 transaksi per halaman. Status pending direkonsiliasi otomatis dengan DOKU.</p></div>
      {orders.isError && <p className="admin-alert admin-alert--error">Order belum dapat dimuat. Coba klik Perbarui.</p>}
      <div className="admin-table-wrap"><table className="admin-table admin-orders-table"><thead><tr><th>Order</th><th>Peserta</th><th>Kelas</th><th>Nominal</th><th>Pembayaran</th><th>Email</th></tr></thead><tbody>
        {orders.data?.items.map(row => <tr key={row.id}>
          <td data-label="Order"><strong>{row.invoiceNumber}</strong><small>{new Date(row.createdAt).toLocaleString("id-ID")}</small></td>
          <td data-label="Peserta"><strong>{row.student.name}</strong><small>{row.student.email}<br />{row.student.phone}</small></td>
          <td data-label="Kelas">{row.className}</td><td data-label="Nominal">{formatRupiah(row.amount)}</td>
          <td data-label="Pembayaran"><span className={`order-status order-status--${row.status}`}>{orderLabels[row.status] || row.status}</span>{row.status === "pending_payment" && row.paymentUrl && <a className="admin-inline-action" href={row.paymentUrl} target="_blank" rel="noreferrer">Buka checkout</a>}</td>
          <td data-label="Email"><EmailStatus delivery={row.emailDelivery}/>{row.status === "paid" && <button className="admin-inline-action" type="button" disabled={resend.isPending} onClick={() => resend.mutate({ orderId: row.publicId })}>Kirim ulang akses</button>}</td>
        </tr>)}
        {!orders.isLoading && !orders.data?.items.length && <tr><td colSpan="6">Belum ada order.</td></tr>}
      </tbody></table></div>
      {orders.data && orders.data.pagination.totalPages > 1 && <nav className="admin-pagination" aria-label="Pagination order"><button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Sebelumnya</button><span>Halaman {page} dari {orders.data.pagination.totalPages}</span><button type="button" disabled={page >= orders.data.pagination.totalPages} onClick={() => setPage(value => value + 1)}>Berikutnya</button></nav>}
    </section>

    <section className="admin-panel"><div className="admin-panel__heading"><h2>Aktivitas Pembayaran Terbaru</h2><p>25 aktivitas terakhir. Credential dan data rahasia tidak pernah ditampilkan.</p></div>
      {logs.isError && <p className="admin-alert admin-alert--error">Log belum dapat dimuat. Coba klik Perbarui.</p>}
      <div className="payment-log-list">
        {(logs.data || []).map(item => { const Icon = activityIcons[item.status] || Clock3; return <article className={`payment-log payment-log--${item.status}`} key={item.id}><div className="payment-log__icon"><Icon size={20}/></div><div className="payment-log__body"><div className="payment-log__heading"><strong>{item.title}</strong><time>{new Date(item.createdAt).toLocaleString("id-ID")}</time></div><p>{item.message}</p><div className="payment-log__meta">{item.invoiceNumber && <span>Invoice: <b>{item.invoiceNumber}</b></span>}{item.environment && <span>Mode: <b>{item.environment === "production" ? "Production" : "Sandbox"}</b></span>}{item.httpStatus && <span>HTTP: <b>{item.httpStatus}</b></span>}{item.providerCode && <span>Kode DOKU: <b>{item.providerCode}</b></span>}{item.requestId && <span>Request ID: <code>{item.requestId}</code></span>}</div></div></article>; })}
        {!logs.isLoading && !logs.data?.length && <div className="payment-log-empty"><Clock3 size={22}/><p>Belum ada aktivitas pembayaran.</p></div>}
      </div>
    </section>
  </AdminShell>;
}
