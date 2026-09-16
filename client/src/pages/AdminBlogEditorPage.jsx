import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import AdminShell from "../components/admin/AdminShell.jsx";
import { trpc } from "../lib/trpc";

const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export default function AdminBlogEditorPage({ id }) {
  const isNew = id === "new"; const numericId = Number(id);
  const query = trpc.blogAdmin.byId.useQuery({ id: numericId }, { enabled: !isNew && Number.isInteger(numericId), retry: false });
  const [form, setForm] = useState({ title: "Artikel Baru", slug: "artikel-baru", category: "Catatan", excerpt: "", imageUrl: "", content: "", status: "draft" });
  const [message, setMessage] = useState("");
  useEffect(() => { if (query.data) setForm({ title: query.data.title, slug: query.data.slug, category: query.data.category, excerpt: query.data.excerpt, imageUrl: query.data.imageUrl, content: query.data.content, status: query.data.status }); }, [query.data]);
  const save = trpc.blogAdmin.save.useMutation({ onSuccess: data => { setMessage("Artikel tersimpan."); if (isNew && data) window.location.href = `/admin/blog/${data.id}/edit`; }, onError: e => setMessage(e.message) });
  const upload = trpc.classAdmin.uploadImage.useMutation({ onSuccess: data => setForm(current => ({ ...current, imageUrl: data.url })) });
  const choose = event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => upload.mutate({ fileName: file.name, dataUrl: String(reader.result) }); reader.readAsDataURL(file); };
  const input = (key, label) => <label className="admin-field"><span>{label}</span><input value={form[key]} onChange={e => setForm({ ...form, [key]: key === "slug" ? slugify(e.target.value) : e.target.value })}/></label>;
  return <AdminShell><form onSubmit={e => { e.preventDefault(); save.mutate({ id: isNew ? null : numericId, ...form }); }}>
    <div className="admin-editor-bar"><a href="/admin/blog"><ArrowLeft size={17}/> Kembali</a><button className="button button--primary" disabled={save.isPending}><Save size={16}/> Simpan</button></div>
    <div className="admin-title-row"><div><p className="eyebrow">Blog Editor</p><h1>{form.title}</h1>{message && <p className={message.includes("tersimpan") ? "admin-success" : "admin-error"}>{message}</p>}</div></div>
    <div className="admin-blog-editor-grid">
      <section className="admin-panel"><div className="admin-panel__heading"><h2>1. Gambar & Publikasi</h2></div><div className="admin-form-grid">{input("imageUrl", "Cover Image URL")}<label className="admin-upload"><ImagePlus size={16}/>{upload.isPending ? "Mengunggah…" : "Upload cover"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={choose}/></label>{form.imageUrl && <div className="admin-image-preview admin-field--wide"><img src={form.imageUrl} alt="Preview cover"/></div>}<label className="admin-field"><span>Status</span><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option></select></label></div></section>
      <section className="admin-panel"><div className="admin-panel__heading"><h2>2. Isi Artikel</h2><p>Gunakan satu paragraf per baris kosong. Baris yang diawali ## menjadi subjudul.</p></div><div className="admin-form-grid">{input("title", "Judul")}{input("slug", "Slug")}{input("category", "Kategori")}<label className="admin-field admin-field--wide"><span>Excerpt</span><textarea rows="3" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}/></label><label className="admin-field admin-field--wide"><span>Konten</span><textarea rows="18" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}/></label></div></section>
    </div>
  </form></AdminShell>;
}
