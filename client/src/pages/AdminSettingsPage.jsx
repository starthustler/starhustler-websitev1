import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import AdminShell from "../components/admin/AdminShell.jsx";
import { trpc } from "../lib/trpc";

export default function AdminSettingsPage() {
  const query = trpc.settingsAdmin.get.useQuery(undefined, { retry: false });
  const [form, setForm] = useState({ paymentProvider: "DOKU", paymentUrl: "", metaPixelId: "", metaCapiToken: "", clearMetaCapiToken: false });
  const [message, setMessage] = useState("");
  useEffect(() => { if (query.data) setForm(current => ({ ...current, ...query.data })); }, [query.data]);
  const save = trpc.settingsAdmin.update.useMutation({ onSuccess: data => { setForm(current => ({ ...current, ...data, metaCapiToken: "", clearMetaCapiToken: false })); setMessage("Pengaturan tersimpan."); }, onError: e => setMessage(e.message) });
  const field = (key, label, type = "text", placeholder = "") => <label className="admin-field"><span>{label}</span><input type={type} value={form[key]} placeholder={placeholder} onChange={e => setForm({ ...form, [key]: e.target.value })}/></label>;
  return <AdminShell><form onSubmit={e => { e.preventDefault(); save.mutate(form); }}>
    <div className="admin-title-row"><div><p className="eyebrow">Site Settings</p><h1>Pembayaran & Meta Ads</h1><p>Satu konfigurasi untuk semua halaman publik.</p>{message && <p className={message.includes("tersimpan") ? "admin-success" : "admin-error"}>{message}</p>}</div><button className="button button--primary" disabled={save.isPending}><Save size={16}/> Simpan</button></div>
    <section className="admin-panel" id="payment"><div className="admin-panel__heading"><h2>Pembayaran</h2><p>URL ini dipakai kelas yang mengaktifkan central payment.</p></div><div className="admin-form-grid">{field("paymentProvider", "Provider")}{field("paymentUrl", "Checkout URL", "url", "https://pay.doku.com/...")}</div></section>
    <section className="admin-panel" id="meta"><div className="admin-panel__heading"><h2>Meta Ads</h2><p>Pixel ID boleh terlihat di browser. Token CAPI disimpan di server dan tidak pernah ditampilkan kembali.</p></div><div className="admin-form-grid">{field("metaPixelId", "Meta Pixel ID")}{field("metaCapiToken", query.data?.metaCapiConfigured ? "Ganti CAPI Access Token (opsional)" : "CAPI Access Token", "password")}<label className="admin-toggle"><input type="checkbox" checked={form.clearMetaCapiToken} onChange={e => setForm({ ...form, clearMetaCapiToken: e.target.checked })}/><span>Hapus token CAPI tersimpan</span></label><p className="admin-field--wide">Status CAPI: <strong>{query.data?.metaCapiConfigured ? "Terpasang" : "Belum terpasang"}</strong></p></div></section>
  </form></AdminShell>;
}
