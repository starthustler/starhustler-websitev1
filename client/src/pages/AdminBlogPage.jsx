import { Edit3, Plus } from "lucide-react";
import AdminShell from "../components/admin/AdminShell.jsx";
import { trpc } from "../lib/trpc";

export default function AdminBlogPage() {
  const query = trpc.blogAdmin.list.useQuery(undefined, { retry: false });
  return <AdminShell>
    <div className="admin-title-row"><div><p className="eyebrow">Content Management</p><h1>Blog</h1><p>Kelola gambar cover dan isi artikel yang tampil untuk pengunjung.</p></div><a className="button button--primary" href="/admin/blog/new"><Plus size={17}/> Tulis Artikel</a></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Judul</th><th>Slug</th><th>Status</th><th>Updated</th><th>Aksi</th></tr></thead><tbody>
      {(query.data || []).map(post => <tr key={post.id}><td><strong>{post.title}</strong><small>{post.category}</small></td><td>/blog/{post.slug}</td><td><span className={`admin-status admin-status--${post.status}`}>{post.status}</span></td><td>{new Date(post.updatedAt).toLocaleString("id-ID")}</td><td><div className="admin-actions"><a href={`/admin/blog/${post.id}/edit`} title="Edit"><Edit3 size={16}/></a></div></td></tr>)}
      {!query.isLoading && !query.data?.length && <tr><td colSpan="5">Belum ada artikel CMS. Artikel lama tetap tampil sebagai fallback.</td></tr>}
    </tbody></table></div>
  </AdminShell>;
}
