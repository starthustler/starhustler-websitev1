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

  useEffect(() => {
    if (query.data)
      setForm(current => ({
        ...current,
        ...query.data,
        metaEvents: query.data.metaEvents || defaultEvents,
      }));
  }, [query.data]);

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
  const last = query.data?.metaLastServerEvent;

  return (
    <AdminShell>
      <form
        onSubmit={event => {
          event.preventDefault();
          save.mutate(form);
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
          <button className="button button--primary" disabled={save.isPending}>
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
