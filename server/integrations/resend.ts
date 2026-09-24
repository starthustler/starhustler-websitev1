export type ResendSettings = {
  apiKey: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character);

export async function sendEmail(
  settings: ResendSettings,
  input: { to: string; subject: string; html: string }
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      ...(settings.replyTo ? { reply_to: settings.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, any>;
  if (!response.ok) throw new Error(String(payload?.message || `Resend gagal (${response.status})`));
  return { id: String(payload.id || "") };
}

const button = (label: string, url: string) =>
  `<a href="${escapeHtml(url)}" style="display:inline-block;background:#2c79ff;color:#fff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700">${escapeHtml(label)}</a>`;

const layout = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#f3f6fc;font-family:Arial,sans-serif;color:#0b1330"><div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#0b1330;color:#fff;padding:22px 28px;font-size:22px;font-weight:800">StartHustler</div><div style="background:#fff;padding:30px 28px"><h1 style="font-size:26px;line-height:1.2;margin:0 0 18px">${escapeHtml(title)}</h1>${body}<p style="margin-top:28px;color:#64708b;font-size:13px">Email otomatis dari StartHustler. Balas email ini jika membutuhkan bantuan.</p></div></div></body></html>`;

export function paymentEmailHtml(input: {
  name: string;
  className: string;
  invoiceNumber: string;
  amountLabel: string;
  paymentUrl: string;
  expiresLabel: string;
}) {
  return layout(
    "Selesaikan pendaftaran kelasmu",
    `<p>Halo ${escapeHtml(input.name)},</p><p>Registrasi untuk <strong>${escapeHtml(input.className)}</strong> sudah kami terima.</p><p>Invoice: <strong>${escapeHtml(input.invoiceNumber)}</strong><br>Nominal: <strong>${escapeHtml(input.amountLabel)}</strong><br>Berlaku sampai: ${escapeHtml(input.expiresLabel)}</p><p>${button("Bayar Sekarang", input.paymentUrl)}</p><p style="font-size:13px;color:#64708b">Akses kelas baru dikirim setelah pembayaran dikonfirmasi oleh DOKU.</p>`
  );
}

export function enrollmentEmailHtml(input: {
  name: string;
  className: string;
  schedule: string;
  meetingLabel: string;
  meetingUrl: string;
  setupUrl: string;
}) {
  const meeting = input.meetingUrl
    ? `<p><strong>${escapeHtml(input.meetingLabel)}</strong><br>${button("Buka Link Sesi", input.meetingUrl)}</p>`
    : `<p>Link sesi akan dikirim oleh tim StartHustler setelah jadwal dikonfirmasi.</p>`;
  return layout(
    "Pembayaran berhasil — akses kelas aktif",
    `<p>Halo ${escapeHtml(input.name)},</p><p>Pembayaran untuk <strong>${escapeHtml(input.className)}</strong> telah berhasil.</p><p><strong>Jadwal:</strong><br>${escapeHtml(input.schedule).replace(/\n/g, "<br>")}</p>${meeting}<p>${button("Buat Password Akun", input.setupUrl)}</p><p style="font-size:13px;color:#64708b">Tautan pembuatan password hanya dapat digunakan satu kali dan berlaku selama 24 jam.</p>`
  );
}
