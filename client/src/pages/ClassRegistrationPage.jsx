import { useState } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { trpc } from "../lib/trpc";
import { formatRupiah, getSharedClassConfig } from "@shared/classContent";

export default function ClassRegistrationPage({ slug }) {
  const classQuery = trpc.classes.bySlug.useQuery({ slug }, { retry: 1 });
  const checkout = trpc.checkout.create.useMutation({
    onSuccess: data => window.location.assign(data.paymentUrl),
  });
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const record = classQuery.data;
  const shared = record ? getSharedClassConfig(record.name, record.content) : null;
  const update = event => setForm({ ...form, [event.target.name]: event.target.value });
  return (
    <div className="site-page registration-page">
      <Navbar />
      <main className="registration-shell">
        <a className="registration-back" href={`/kelas/${slug}`}><ArrowLeft size={17} /> Kembali ke detail kelas</a>
        {!record ? (
          <div className="registration-card"><h1>{classQuery.isLoading ? "Memuat kelas…" : "Kelas tidak ditemukan"}</h1></div>
        ) : (
          <div className="registration-grid">
            <section className="registration-summary">
              <p className="eyebrow">Pendaftaran Kelas</p>
              <h1>{shared.name}</h1>
              <p>{shared.shortDescription}</p>
              <div className="registration-price">
                <span>{shared.pricing.priceLabel}</span>
                <strong>{formatRupiah(shared.pricing.sellingPrice)}</strong>
              </div>
              <p><strong>Jadwal</strong><br />{shared.schedule.formatted}</p>
              <div className="registration-trust"><ShieldCheck size={20} /><span>Pembayaran diproses dengan aman oleh DOKU.</span></div>
            </section>
            <form className="registration-card" onSubmit={event => {
              event.preventDefault();
              checkout.mutate({ slug, ...form });
            }}>
              <div><p className="eyebrow">Data Peserta</p><h2>Lengkapi pendaftaran</h2><p>Link pembayaran juga akan dikirim ke emailmu.</p></div>
              <label><span>Nama lengkap</span><input name="name" value={form.name} onChange={update} required minLength={2} autoComplete="name" /></label>
              <label><span>Email</span><input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" /></label>
              <label><span>Nomor WhatsApp</span><input name="phone" type="tel" value={form.phone} onChange={update} required minLength={8} autoComplete="tel" placeholder="08xxxxxxxxxx" /></label>
              {checkout.error && <p className="registration-error">{checkout.error.message}</p>}
              <button className="button button--primary" disabled={checkout.isPending}>
                <LockKeyhole size={17} /> {checkout.isPending ? "Membuat checkout…" : "Lanjut ke Pembayaran"}
              </button>
              <small>Harga diambil langsung dari sistem StartHustler dan tidak dapat diubah dari browser.</small>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
