import { BookOpen, CreditCard, GraduationCap, Megaphone, ReceiptText } from "lucide-react";
import AdminShell from "../components/admin/AdminShell.jsx";

const cards = [
  ["Kelas", "Kelola landing page, harga, kurikulum, dan visibilitas.", "/admin/kelas", GraduationCap],
  ["Blog", "Upload cover, tulis artikel, lalu publish ke halaman Blog.", "/admin/blog", BookOpen],
  ["Pembayaran", "Atur satu URL checkout utama untuk semua kelas.", "/admin/settings#payment", CreditCard],
  ["Log Pembayaran", "Pantau permintaan checkout, respons DOKU, dan kendala transaksi.", "/admin/orders", ReceiptText],
  ["Meta Ads", "Kelola Pixel ID dan token Conversions API secara aman.", "/admin/settings#meta", Megaphone],
];

export default function AdminDashboardPage() {
  return <AdminShell>
    <div className="admin-title-row"><div><p className="eyebrow">StartHustler CMS</p><h1>Dashboard</h1><p>Pusat pengelolaan konten, pembayaran, dan tracking website.</p></div></div>
    <div className="admin-dashboard-grid">
      {cards.map(([title, copy, href, Icon]) => <a href={href} key={title}><Icon size={24}/><h2>{title}</h2><p>{copy}</p></a>)}
    </div>
  </AdminShell>;
}
