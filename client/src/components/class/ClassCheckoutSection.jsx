import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { getSharedClassConfig } from "@shared/classContent";
import { trpc } from "../../lib/trpc";
import { Button } from "../PrimaryButton.jsx";
import { EventInfo, FormField, PriceDisplay } from "./ClassUi.jsx";

export default function ClassCheckoutSection({ record, slug, content }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const checkout = trpc.checkout.create.useMutation({
    onSuccess: data => window.location.assign(data.paymentUrl),
  });
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const enabled = content.registration?.enabled !== false;
  const shared = getSharedClassConfig(record.name, content);

  return (
    <section className="class-checkout-section">
      <div className="section-shell class-checkout-section__layout">
        <form id="daftar-kelas" className="registration-card class-checkout-card" onSubmit={event => {
          event.preventDefault();
          if (enabled) checkout.mutate({ slug, ...form });
        }}>
          <div className="class-checkout-card__product">
            <span>Kelas yang dipilih</span>
            <h3>{shared.name}</h3>
            <PriceDisplay
              label={shared.pricing.priceLabel}
              sellingPrice={shared.pricing.sellingPrice}
              originalPrice={shared.pricing.originalPrice}
              promoLabel={shared.pricing.promoLabel}
              variant="card"
            />
            <EventInfo
              variant="compact"
              items={[{ key: "schedule", value: shared.schedule.formatted }]}
            />
          </div>
          <div className="class-checkout-card__heading">
            <p className="eyebrow">Data Peserta</p>
            <h2>Lengkapi pendaftaran</h2>
            <p>Link pembayaran juga akan dikirim ke emailmu.</p>
          </div>
          <FormField label="Nama lengkap" name="name" value={form.name} onChange={update} required minLength={2} autoComplete="name" />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={update} required autoComplete="email" />
          <FormField label="Nomor WhatsApp" name="phone" type="tel" value={form.phone} onChange={update} required minLength={8} autoComplete="tel" placeholder="08xxxxxxxxxx" />
          {checkout.error && <p className="registration-error">{checkout.error.message}</p>}
          <Button
            type="submit"
            fullWidth
            disabled={!enabled || checkout.isPending}
            startIcon={<LockKeyhole aria-hidden="true" size={17} />}
          >
            {!enabled ? "Pendaftaran belum dibuka" : checkout.isPending ? "Membuat checkout…" : "Lanjut ke Pembayaran"}
          </Button>
        </form>
      </div>
    </section>
  );
}
