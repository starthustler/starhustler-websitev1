import { useState } from "react";
import { KeyRound } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { trpc } from "../lib/trpc";

export default function StudentActivationPage({ token }) {
  const info = trpc.studentAuth.activationInfo.useQuery({ token }, { retry: false });
  const [password, setPassword] = useState("");
  const activate = trpc.studentAuth.activate.useMutation({
    onSuccess: () => window.location.assign("/akun/kelas"),
  });
  return <div className="site-page registration-page"><Navbar /><main className="payment-status-shell">
    <form className="registration-card payment-status-card" onSubmit={event => { event.preventDefault(); activate.mutate({ token, password }); }}>
      <KeyRound size={48} className="status-pending" />
      <p className="eyebrow">Aktivasi Akun Peserta</p>
      <h1>Buat password</h1>
      {info.data && <p>Halo {info.data.name}. Akun akan dibuat untuk {info.data.emailMasked}.</p>}
      {info.error && <p className="registration-error">{info.error.message}</p>}
      {info.data && <label><span>Password minimal 12 karakter</span><input type="password" minLength={12} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label>}
      {activate.error && <p className="registration-error">{activate.error.message}</p>}
      {info.data && <button className="button button--primary" disabled={activate.isPending}>{activate.isPending ? "Mengaktifkan…" : "Aktifkan Akun"}</button>}
    </form>
  </main><Footer /></div>;
}
