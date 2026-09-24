import { useState } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { trpc } from "../lib/trpc";

export default function StudentClassesPage() {
  const utils = trpc.useUtils();
  const me = trpc.studentAuth.me.useQuery();
  const classes = trpc.student.classes.useQuery(undefined, { enabled: Boolean(me.data), retry: false });
  const logout = trpc.studentAuth.logout.useMutation({ onSuccess: () => { utils.studentAuth.me.setData(undefined, null); window.location.reload(); } });
  const login = trpc.studentAuth.login.useMutation({ onSuccess: () => window.location.reload() });
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  return <div className="site-page registration-page"><Navbar /><main className="student-portal-shell">
    {!me.data ? <form className="registration-card student-login" onSubmit={event => { event.preventDefault(); login.mutate(credentials); }}>
      <p className="eyebrow">Portal Peserta</p><h1>Masuk ke kelasmu</h1>
      <label><span>Email</span><input type="email" required value={credentials.email} onChange={e => setCredentials({ ...credentials, email: e.target.value })} /></label>
      <label><span>Password</span><input type="password" required value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} /></label>
      {login.error && <p className="registration-error">{login.error.message}</p>}
      <button className="button button--primary" disabled={login.isPending}>Masuk</button>
    </form> : <>
      <div className="student-portal-head"><div><p className="eyebrow">Portal Peserta</p><h1>Kelas Saya</h1><p>Halo, {me.data.name}</p></div><button className="button button--secondary" onClick={() => logout.mutate()}><LogOut size={16} /> Keluar</button></div>
      <div className="student-class-grid">{classes.data?.map(item => <article key={item.id}>
        <p className="eyebrow">Akses Aktif</p><h2>{item.className}</h2><p>{item.schedule}</p>
        {item.meetingUrl ? <a className="button button--primary" href={item.meetingUrl} target="_blank" rel="noreferrer">{item.meetingLabel} <ExternalLink size={16} /></a> : <p>Link sesi akan diumumkan oleh tim StartHustler.</p>}
      </article>)}</div>
    </>}
  </main><Footer /></div>;
}
