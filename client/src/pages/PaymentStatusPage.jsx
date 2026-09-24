import { CheckCircle2, Clock3, ExternalLink } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { trpc } from "../lib/trpc";
import { formatRupiah } from "@shared/classContent";

export default function PaymentStatusPage({ orderId }) {
  const query = trpc.checkout.status.useQuery(
    { orderId },
    { retry: 2, refetchInterval: data => data?.state?.data?.status === "pending_payment" ? 5000 : false }
  );
  const order = query.data;
  const paid = order?.status === "paid";
  return <div className="site-page registration-page"><Navbar /><main className="payment-status-shell">
    <section className="registration-card payment-status-card">
      {paid ? <CheckCircle2 size={54} className="status-paid" /> : <Clock3 size={54} className="status-pending" />}
      <p className="eyebrow">Status Pembayaran</p>
      <h1>{paid ? "Pembayaran berhasil" : "Menunggu pembayaran"}</h1>
      {!order ? <p>{query.isLoading ? "Memeriksa transaksi…" : query.error?.message}</p> : <>
        <p><strong>{order.className}</strong><br />{order.invoiceNumber}<br />{formatRupiah(order.amount)}</p>
        {paid ? <p>Email akses kelas dan tautan pembuatan password telah dikirim. Periksa folder Spam jika belum terlihat.</p> : <>
          <p>Halaman ini memperbarui status secara otomatis setelah DOKU mengonfirmasi pembayaran.</p>
          {order.paymentUrl && <a className="button button--primary" href={order.paymentUrl}>Lanjutkan Pembayaran <ExternalLink size={16} /></a>}
        </>}
      </>}
    </section>
  </main><Footer /></div>;
}
