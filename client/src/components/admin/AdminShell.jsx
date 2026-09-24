import { BookOpen, CreditCard, Gauge, GraduationCap, LogOut, Megaphone, ExternalLink, ReceiptText, Mail } from "lucide-react";
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
      <aside className="admin-sidebar">
        <BrandLogo light />
        <nav aria-label="Menu admin">
          <a href="/admin"><Gauge size={17} /> Dashboard</a>
          <a href="/admin/kelas"><GraduationCap size={17} /> Kelas</a>
          <a href="/admin/blog"><BookOpen size={17} /> Blog</a>
          <a href="/admin/orders"><ReceiptText size={17} /> Orders</a>
          <a href="/admin/settings#payment"><CreditCard size={17} /> Pembayaran</a>
          <a href="/admin/settings#email"><Mail size={17} /> Email</a>
          <a href="/admin/settings#meta"><Megaphone size={17} /> Meta Ads</a>
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={17} /> Lihat Website
          </a>
          <button type="button" onClick={() => auth.logout()}>
            <LogOut size={16} /> Keluar
          </button>
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
