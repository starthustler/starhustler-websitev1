import { useEffect, useState } from "react";
import { Save, Send } from "lucide-react";
import AdminShell from "../components/admin/AdminShell.jsx";
import { trpc } from "../lib/trpc";

const defaultEvents = {
  pageView: true,
  viewContent: true,
  lead: true,
  initiateCheckout: true,
  purchase: true,
};

export default function AdminSettingsPage() {
  const utils = trpc.useUtils();
  const query = trpc.settingsAdmin.get.useQuery(undefined, { retry: false });
  const commerceQuery = trpc.commerceAdmin.get.useQuery(undefined, { retry: false });
  const [form, setForm] = useState({
    paymentProvider: "DOKU",
    paymentUrl: "",
    metaPixelId: "",
    metaCapiToken: "",
    clearMetaCapiToken: false,
    metaTestEventCode: "",
    clearMetaTestEventCode: false,
    metaEvents: defaultEvents,
  });
  const [message, setMessage] = useState("");
  const [commerce, setCommerce] = useState({
    checkoutMode: "payment_link",
    dokuEnvironment: "sandbox",
    dokuClientId: "",
    dokuSecretKey: "",
    clearDokuClientId: false,
    clearDokuSecretKey: false,
    dokuPaymentDueMinutes: 60,
    resendApiKey: "",
    clearResendApiKey: false,
    resendFromName: "Kelas StartHustler",
    resendFromEmail: "kelas@mail.starthustler.com",
    resendReplyTo: "",
  });
  const [resendTestTo, setResendTestTo] = useState("");

  useEffect(() => {
    if (query.data)
      setForm(current => ({
        ...current,
        ...query.data,
        metaEvents: query.data.metaEvents || defaultEvents,
      }));
  }, [query.data]);
  useEffect(() => {
    if (commerceQuery.data) setCommerce(current => ({
      ...current,
      ...commerceQuery.data,
      dokuClientId: "",
      dokuSecretKey: "",
      resendApiKey: "",
    }));
  }, [commerceQuery.data]);

  const save = trpc.settingsAdmin.update.useMutation({
    onSuccess: async data => {
      setForm(current => ({
        ...current,
        ...data,
        metaCapiToken: "",
        clearMetaCapiToken: false,
        metaTestEventCode: "",
        clearMetaTestEventCode: false,
      }));
      await utils.settings.public.invalidate();
      setMessage("Pengaturan tersimpan.");
    },
    onError: error => setMessage(error.message),
  });
  const sendTest = trpc.settingsAdmin.sendMetaTestEvent.useMutation({
    onSuccess: async result => {
      await query.refetch();
      setMessage(
        result.sent
          ? "Test event berhasil dikirim ke Meta."
          : "Test event tidak terkirim. Periksa konfigurasi dan log server."
      );
    },
    onError: error => setMessage(error.message),
  });
  const saveCommerce = trpc.commerceAdmin.update.useMutation({
    onSuccess: data => {
      setCommerce(current => ({
        ...current,
        ...data,
        dokuClientId: "",
        dokuSecretKey: "",
        resendApiKey: "",
        clearDokuClientId: false,
        clearDokuSecretKey: false,
        clearResendApiKey: false,
      }));
      setMessage("Pengaturan pembayaran dan email tersimpan.");
    },
    onError: error => setMessage(error.message),
  });
  const sendEmailTest = trpc.commerceAdmin.sendResendTest.useMutation({
    onSuccess: () => setMessage("Test email berhasil dikirim."),
    onError: error => setMessage(error.message),
  });
  const field = (key, label, type = "text", placeholder = "") => (
    <label className="admin-field">
      <span>{label}</span>
      <input
        type={type}
        value={form[key] || ""}
        placeholder={placeholder}
        onChange={event => setForm({ ...form, [key]: event.target.value })}
      />
    </label>
  );
  const eventLabels = {
    pageView: "PageView",
    viewContent: "ViewContent",
    lead: "Lead",
    initiateCheckout: "InitiateCheckout",
    purchase: "Purchase",
  };
  const commerceField = (key, label, type = "text", placeholder = "") => (
    <label className="admin-field">
      <span>{label}</span>
      <input
        type={type}
        value={commerce[key] || ""}
        placeholder={placeholder}
        onChange={event => setCommerce({
          ...commerce,
          [key]: type === "number" ? Number(event.target.value) : event.target.value,
        })}
      />
    </label>
  );
  const last = query.data?.metaLastServerEvent;

  return (
    <AdminShell>
      <form
        onSubmit={event => {
          event.preventDefault();
          save.mutate(form);
          saveCommerce.mutate(commerce);
        }}
      >
        <div className="admin-title-row">
          <div>
            <p className="eyebrow">Site Settings</p>
            <h1>Pembayaran & Meta Ads</h1>
            <p>Satu konfigurasi untuk semua halaman publik.</p>
            {message && (
              <p
                className={
                  message.includes("berhasil") || message.includes("tersimpan")
                    ? "admin-success"
                    : "admin-error"
                }
              >
                {message}
              </p>
            )}
          </div>
          <button className="button button--primary" disabled={save.isPending || saveCommerce.isPending}>
            <Save size={16} /> Simpan
          </button>
        </div>
        <section className="admin-panel" id="payment">
          <div className="admin-panel__heading">
            <h2>Pembayaran</h2>
            <p>URL ini dipakai kelas yang mengaktifkan central payment.</p>
          </div>
          <div className="admin-form-grid">
            {field("paymentProvider", "Provider")}
            {field(
              "paymentUrl",
              "Checkout URL",
              "url",
              "https://pay.doku.com/..."
            )}
            <label className="admin-field">
              <span>Checkout Mode</span>
              <select value={commerce.checkoutMode} onChange={event => setCommerce({ ...commerce, checkoutMode: event.target.value })}>
                <option value="payment_link">Payment Link Lama</option>
                <option value="integrated">DOKU Checkout Terintegrasi</option>
              </select>
            </label>
            <label className="admin-field">
              <span>DOKU Environment</span>
              <select value={commerce.dokuEnvironment} onChange={event => setCommerce({ ...commerce, dokuEnvironment: event.target.value })}>
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
            </label>
            {commerceField("dokuClientId", commerceQuery.data?.dokuClientIdConfigured ? "Ganti DOKU Client ID (opsional)" : "DOKU Client ID", "password")}
            {commerceField("dokuSecretKey", commerceQuery.data?.dokuSecretKeyConfigured ? "Ganti DOKU Secret Key (opsional)" : "DOKU Secret Key", "password")}
            {commerceField("dokuPaymentDueMinutes", "Payment Due (menit)", "number")}
            <div className="admin-field"><span>Status DOKU</span><p>Client ID: <strong>{commerceQuery.data?.dokuClientIdConfigured ? "Terpasang" : "Belum"}</strong></p><p>Secret: <strong>{commerceQuery.data?.dokuSecretKeyConfigured ? "Terpasang" : "Belum"}</strong></p><p>Webhook: <code>/api/payments/doku/webhook</code></p></div>
            <label className="admin-toggle"><input type="checkbox" checked={commerce.clearDokuClientId} onChange={e => setCommerce({ ...commerce, clearDokuClientId: e.target.checked })} /><span>Hapus Client ID tersimpan</span></label>
            <label className="admin-toggle"><input type="checkbox" checked={commerce.clearDokuSecretKey} onChange={e => setCommerce({ ...commerce, clearDokuSecretKey: e.target.checked })} /><span>Hapus Secret Key tersimpan</span></label>
          </div>
        </section>
        <section className="admin-panel" id="email">
          <div className="admin-panel__heading"><h2>Email Transaksional</h2><p>Resend mengirim link pembayaran dan akses kelas setelah webhook DOKU terverifikasi.</p></div>
          <div className="admin-form-grid">
            {commerceField("resendApiKey", commerceQuery.data?.resendApiKeyConfigured ? "Ganti Resend API Key (opsional)" : "Resend API Key", "password")}
            {commerceField("resendFromName", "From Name")}
            {commerceField("resendFromEmail", "From Email", "email")}
            {commerceField("resendReplyTo", "Reply-To", "email")}
            <label className="admin-toggle"><input type="checkbox" checked={commerce.clearResendApiKey} onChange={e => setCommerce({ ...commerce, clearResendApiKey: e.target.checked })} /><span>Hapus Resend API Key tersimpan</span></label>
            <div className="admin-field"><span>Status Resend</span><p><strong>{commerceQuery.data?.resendApiKeyConfigured ? "API key terpasang" : "Belum dikonfigurasi"}</strong></p></div>
            <label className="admin-field"><span>Kirim test ke</span><input type="email" value={resendTestTo} onChange={e => setResendTestTo(e.target.value)} placeholder="email@contoh.com" /></label>
            <div className="admin-field"><span>&nbsp;</span><button type="button" className="button button--secondary" disabled={!resendTestTo || sendEmailTest.isPending} onClick={() => sendEmailTest.mutate({ to: resendTestTo })}><Send size={16} /> Kirim Test Email</button></div>
          </div>
        </section>
        <section className="admin-panel" id="meta">
          <div className="admin-panel__heading">
            <h2>Meta Pixel & Conversions API</h2>
            <p>
              Pixel ID boleh berada di browser. Token CAPI dan Test Event Code
              disimpan server-side dan tidak pernah ditampilkan kembali.
            </p>
          </div>
          <div className="admin-form-grid">
            {field(
              "metaPixelId",
              "Meta Pixel ID",
              "text",
              "Contoh: 123456789012345"
            )}
            {field(
              "metaCapiToken",
              query.data?.metaCapiConfigured
                ? "Ganti CAPI Access Token (opsional)"
                : "CAPI Access Token",
              "password"
            )}
            {field(
              "metaTestEventCode",
              query.data?.metaTestEventCodeConfigured
                ? "Ganti Test Event Code (opsional)"
                : "Test Event Code",
              "password",
              "TEST12345"
            )}
            <div className="admin-field">
              <span>Status integrasi</span>
              <p>
                Pixel:{" "}
                <strong>
                  {query.data?.metaPixelId ? "Terpasang" : "Belum terpasang"}
                </strong>
              </p>
              <p>
                CAPI:{" "}
                <strong>
                  {query.data?.metaCapiConfigured
                    ? "Terpasang"
                    : "Belum terpasang"}
                </strong>
              </p>
              <p>
                Test code:{" "}
                <strong>
                  {query.data?.metaTestEventCodeConfigured
                    ? "Terpasang"
                    : "Belum terpasang"}
                </strong>
              </p>
            </div>
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={form.clearMetaCapiToken}
                onChange={event =>
                  setForm({ ...form, clearMetaCapiToken: event.target.checked })
                }
              />
              <span>Hapus token CAPI tersimpan</span>
            </label>
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={form.clearMetaTestEventCode}
                onChange={event =>
                  setForm({
                    ...form,
                    clearMetaTestEventCode: event.target.checked,
                  })
                }
              />
              <span>Hapus Test Event Code tersimpan</span>
            </label>
          </div>
          <div className="admin-meta-events">
            <h3>Event aktif</h3>
            <div className="admin-meta-events__grid">
              {Object.entries(eventLabels).map(([key, label]) => (
                <label className="admin-toggle" key={key}>
                  <input
                    type="checkbox"
                    checked={form.metaEvents?.[key] !== false}
                    onChange={event =>
                      setForm({
                        ...form,
                        metaEvents: {
                          ...form.metaEvents,
                          [key]: event.target.checked,
                        },
                      })
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="admin-meta-status">
            <div>
              <h3>Aktivitas server terakhir</h3>
              {last ? (
                <p>
                  <strong>{last.eventName}</strong> · {last.status} ·{" "}
                  {new Date(last.sentAt).toLocaleString("id-ID")}
                </p>
              ) : (
                <p>Belum ada event server yang tercatat.</p>
              )}
            </div>
            <button
              type="button"
              className="button button--secondary"
              disabled={
                sendTest.isPending ||
                !query.data?.metaCapiConfigured ||
                !query.data?.metaTestEventCodeConfigured
              }
              onClick={() => sendTest.mutate()}
            >
              <Send size={16} /> Send Test Event
            </button>
          </div>
          <p className="admin-meta-note">
            Lead hanya dikirim setelah form lead berhasil. Purchase hanya boleh
            dipanggil oleh webhook/status pembayaran yang sudah
            terverifikasi—bukan dari klik atau halaman sukses.
          </p>
        </section>
      </form>
    </AdminShell>
  );
}
