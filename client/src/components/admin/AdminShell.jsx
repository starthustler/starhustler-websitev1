import { LogOut } from "lucide-react";
import { BrandLogo } from "../BrandLogo.jsx";
import { useAuth } from "../../_core/hooks/useAuth";
import AdminLoginPanel from "./AdminLoginPanel.jsx";

export default function AdminShell({ children }) {
  const auth = useAuth();
  if (auth.loading)
    return (
      <main className="admin-state">
        <p>Memeriksa akses admin…</p>
      </main>
    );
  if (!auth.user) return <AdminLoginPanel onAuthenticated={auth.acceptUser} />;
  if (auth.user.role !== "admin")
    return (
      <main className="admin-state">
        <h1>Akses ditolak</h1>
        <p>Akun ini tidak memiliki role admin.</p>
        <button
          className="button button--primary"
          type="button"
          onClick={() => auth.logout()}
        >
          Keluar
        </button>
      </main>
    );
  return (
    <div className="admin-page">
      <header className="admin-header">
        <BrandLogo light />
        <nav>
          <a href="/admin/kelas">Kelola Kelas</a>
          <a href="/" target="_blank" rel="noreferrer">
            Lihat Website
          </a>
          <button type="button" onClick={() => auth.logout()}>
            <LogOut size={16} /> Keluar
          </button>
        </nav>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
