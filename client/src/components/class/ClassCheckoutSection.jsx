import { useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { formatRupiah } from "@shared/classContent";
import { trpc } from "../../lib/trpc";

export default function ClassCheckoutSection({ record, slug, content }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const checkout = trpc.checkout.create.useMutation({
    onSuccess: data => window.location.assign(data.paymentUrl),
  });
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const enabled = content.registration?.enabled !== false;

  return (
    <section className="class-checkout-section" id="daftar-kelas">
      <div className="section-shell class-checkout-section__layout">
        <div className="class-checkout-section__intro">
          <p className="eyebrow">Pendaftaran Kelas</p>
          <h2>Amankan tempatmu sekarang</h2>
          <p>Isi data peserta terlebih dahulu. Order akan tercatat sebelum kamu diarahkan ke checkout resmi DOKU.</p>
          <div className="registration-trust"><ShieldCheck size={20} /><span>Harga diverifikasi oleh server dan pembayaran diproses DOKU.</span></div>
        </div>
        <form className="registration-card class-checkout-card" onSubmit={event => {
          event.preventDefault();
          if (enabled) checkout.mutate({ slug, ...form });
        }}>
          <div className="class-checkout-card__product">
            <span>Kelas yang dipilih</span>
            <h3>{record.name}</h3>
            <strong>{formatRupiah(content.pricing.sellingPrice)}</strong>
            <small>{content.hero.scheduleText}</small>
          </div>
          <div className="class-checkout-card__heading">
            <p className="eyebrow">Data Peserta</p>
            <h2>Lengkapi pendaftaran</h2>
            <p>Link pembayaran juga akan dikirim ke emailmu.</p>
          </div>
          <label><span>Nama lengkap</span><input name="name" value={form.name} onChange={update} required minLength={2} autoComplete="name" /></label>
          <label><span>Email</span><input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" /></label>
          <label><span>Nomor WhatsApp</span><input name="phone" type="tel" value={form.phone} onChange={update} required minLength={8} autoComplete="tel" placeholder="08xxxxxxxxxx" /></label>
          {checkout.error && <p className="registration-error">{checkout.error.message}</p>}
          <button className="button button--primary" disabled={!enabled || checkout.isPending}>
            <LockKeyhole size={17} /> {!enabled ? "Pendaftaran belum dibuka" : checkout.isPending ? "Membuat checkout…" : "Lanjut ke Pembayaran"}
          </button>
          <small>Harga diambil langsung dari sistem StartHustler dan tidak dapat diubah dari browser.</small>
        </form>
      </div>
    </section>
  );
}
