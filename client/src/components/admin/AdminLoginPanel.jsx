import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { trpc } from "../../lib/trpc";

export default function AdminLoginPanel({ onAuthenticated }) {
  const status = trpc.auth.status.useQuery(undefined, { retry: 1 });
  const setup = trpc.auth.setup.useMutation();
  const login = trpc.auth.login.useMutation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmation: "",
  });

  const needsSetup =
    status.data?.databaseConfigured && !status.data.adminConfigured;
  const mutation = needsSetup ? setup : login;

  const update = event =>
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const submit = async event => {
    event.preventDefault();
    if (needsSetup && form.password !== form.confirmation) return;
    const user = await mutation.mutateAsync(
      needsSetup
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password }
    );
    await onAuthenticated(user);
  };

  if (status.isLoading) {
    return (
      <main className="admin-state">
        <p>Memeriksa konfigurasi admin…</p>
      </main>
    );
  }

  if (!status.data?.databaseConfigured) {
    return (
      <main className="admin-state">
        <ShieldCheck size={40} />
        <h1>Admin belum siap</h1>
        <p>
          Database CMS belum terhubung. Hubungkan database dari Vercel terlebih
          dahulu.
        </p>
      </main>
    );
  }

  const mismatch =
    needsSetup &&
    form.confirmation.length > 0 &&
    form.password !== form.confirmation;

  return (
    <main className="admin-state admin-auth-state">
      <ShieldCheck size={40} />
      <p className="eyebrow">Protected Admin</p>
      <h1>{needsSetup ? "Aktifkan Admin StartHustler" : "Masuk ke Admin"}</h1>
      <p>
        {needsSetup
          ? "Buat akun pemilik pertama. Setelah aktif, halaman setup akan terkunci permanen."
          : "Gunakan akun pemilik untuk mengelola halaman kelas."}
      </p>
      <form className="admin-auth-form" onSubmit={submit}>
        {needsSetup && (
          <label className="admin-field">
            <span>Nama</span>
            <input
              name="name"
              value={form.name}
              onChange={update}
              autoComplete="name"
              minLength={2}
              required
            />
          </label>
        )}
        <label className="admin-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            autoComplete="username"
            required
          />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            autoComplete={needsSetup ? "new-password" : "current-password"}
            minLength={12}
            required
          />
          {needsSetup && <small>Minimal 12 karakter.</small>}
        </label>
        {needsSetup && (
          <label className="admin-field">
            <span>Ulangi password</span>
            <input
              name="confirmation"
              type="password"
              value={form.confirmation}
              onChange={update}
              autoComplete="new-password"
              minLength={12}
              required
            />
          </label>
        )}
        {mismatch && <p className="admin-error">Password belum sama.</p>}
        {mutation.error && (
          <p className="admin-error">{mutation.error.message}</p>
        )}
        <button
          className="button button--primary"
          type="submit"
          disabled={mutation.isPending || mismatch}
        >
          {mutation.isPending
            ? "Memproses…"
            : needsSetup
              ? "Aktifkan Admin"
              : "Masuk"}
        </button>
      </form>
    </main>
  );
}
