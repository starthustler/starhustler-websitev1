import { useState } from "react";
import { Check, Copy, Edit3, Eye, Plus, Send, Undo2, X } from "lucide-react";
import AdminShell from "../components/admin/AdminShell.jsx";
import { trpc } from "../lib/trpc";

const slugify = value =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminClassesPage() {
  const [editingId, setEditingId] = useState(null);
  const [draftSlug, setDraftSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const utils = trpc.useUtils();
  const query = trpc.classAdmin.list.useQuery(undefined, { retry: false });
  const status = trpc.classAdmin.setStatus.useMutation({
    onSuccess: () => utils.classAdmin.list.invalidate(),
  });
  const duplicate = trpc.classAdmin.duplicate.useMutation({
    onSuccess: () => utils.classAdmin.list.invalidate(),
  });
  const updateSlug = trpc.classAdmin.updateSlug.useMutation({
    onSuccess: async () => {
      await utils.classAdmin.list.invalidate();
      setEditingId(null);
      setDraftSlug("");
      setSlugError("");
    },
    onError: error => setSlugError(error.message),
  });
  const beginSlugEdit = item => {
    setEditingId(item.id);
    setDraftSlug(item.slug);
    setSlugError("");
  };
  const cancelSlugEdit = () => {
    setEditingId(null);
    setDraftSlug("");
    setSlugError("");
  };
  const saveSlug = item => {
    const slug = slugify(draftSlug);
    if (!slug) {
      setSlugError("Slug tidak boleh kosong.");
      return;
    }
    updateSlug.mutate({ id: item.id, slug });
  };
  return (
    <AdminShell>
      <div className="admin-title-row">
        <div>
          <p className="eyebrow">Content Management</p>
          <h1>Kelas</h1>
          <p>
            Buat, preview, dan publish landing page kelas tanpa mengubah source
            code.
          </p>
        </div>
        <a className="button button--primary" href="/admin/kelas/new">
          <Plus size={17} /> Create Class
        </a>
      </div>
      {query.error && (
        <div className="admin-alert admin-alert--error">
          Tidak dapat memuat data: {query.error.message}
        </div>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data || []).map(item => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  {item.featured && <small>Featured</small>}
                </td>
                <td>
                  {editingId === item.id ? (
                    <div className="admin-slug-editor">
                      <div className="admin-slug-editor__field">
                        <span>/kelas/</span>
                        <input
                          aria-label={`Slug ${item.name}`}
                          autoFocus
                          value={draftSlug}
                          onChange={event => {
                            setDraftSlug(slugify(event.target.value));
                            setSlugError("");
                          }}
                          onKeyDown={event => {
                            if (event.key === "Enter") saveSlug(item);
                            if (event.key === "Escape") cancelSlugEdit();
                          }}
                        />
                      </div>
                      <div className="admin-slug-editor__actions">
                        <button type="button" aria-label={`Simpan slug ${item.name}`} disabled={!draftSlug || updateSlug.isPending} onClick={() => saveSlug(item)}><Check size={15}/></button>
                        <button type="button" aria-label={`Batal edit slug ${item.name}`} onClick={cancelSlugEdit}><X size={15}/></button>
                      </div>
                      {slugError && <small className="admin-slug-editor__error">{slugError}</small>}
                    </div>
                  ) : (
                    <button className="admin-slug-trigger" type="button" onClick={() => beginSlugEdit(item)} title="Edit slug">
                      <span>/kelas/{item.slug}</span><Edit3 size={14}/>
                    </button>
                  )}
                </td>
                <td>
                  <span className={`admin-status admin-status--${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>{new Date(item.updatedAt).toLocaleString("id-ID")}</td>
                <td>
                  <div className="admin-actions">
                    <a
                      href={`/kelas/${item.slug}?preview=1`}
                      target="_blank"
                      rel="noreferrer"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </a>
                    <a href={`/admin/kelas/${item.id}/edit`} title="Edit">
                      <Edit3 size={16} />
                    </a>
                    <button
                      type="button"
                      title="Duplicate"
                      aria-label={`Duplicate ${item.name}`}
                      onClick={() => duplicate.mutate({ id: item.id })}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      title={
                        item.status === "published" ? "Unpublish" : "Publish"
                      }
                      aria-label={`${item.status === "published" ? "Unpublish" : "Publish"} ${item.name}`}
                      onClick={() =>
                        status.mutate({
                          id: item.id,
                          status:
                            item.status === "published" ? "draft" : "published",
                        })
                      }
                    >
                      {item.status === "published" ? (
                        <Undo2 size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!query.isLoading && !query.data?.length && (
              <tr>
                <td colSpan="5">Belum ada kelas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
