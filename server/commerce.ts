import type { Request } from "express";
import { createDokuCheckout, DokuCheckoutError, getDokuOrderStatus, verifyDokuNotification } from "./integrations/doku.js";
import {
  enrollmentEmailHtml,
  paymentEmailHtml,
  sendEmail,
} from "./integrations/resend.js";
import { sendMetaEvent } from "./metaTracking.js";
import {
  formatClassSchedule,
  formatRupiah,
  getClassCheckoutAmount,
  normalizeClassContent,
} from "../shared/classContent.js";
import * as db from "./db.js";

const publicAppUrl = () =>
  (process.env.PUBLIC_APP_URL || "https://www.starthustler.com").replace(/\/$/, "");

async function sendOrderEmail(
  kind: "payment_link" | "enrollment_confirmation",
  detail: NonNullable<Awaited<ReturnType<typeof db.getOrderDetailsByPublicId>>>,
  html: string,
  subject: string
) {
  const settings = await db.getCommerceSettings();
  if (!settings.resend.apiKey) {
    await db.upsertEmailDelivery({
      orderId: detail.order.id,
      kind,
      recipient: detail.student.email,
      status: "skipped",
      lastError: "Resend API key belum terpasang",
    });
    return { sent: false };
  }
  try {
    const result = await sendEmail(settings.resend, {
      to: detail.student.email,
      subject,
      html,
    });
    await db.upsertEmailDelivery({
      orderId: detail.order.id,
      kind,
      recipient: detail.student.email,
      status: "sent",
      providerMessageId: result.id,
    });
    return { sent: true };
  } catch (error) {
    await db.upsertEmailDelivery({
      orderId: detail.order.id,
      kind,
      recipient: detail.student.email,
      status: "failed",
      lastError: error instanceof Error ? error.message : "Pengiriman email gagal",
    });
    console.error(`[Email] ${kind} failed`, error);
    return { sent: false };
  }
}

export async function createRegistrationCheckout(input: {
  slug: string;
  name: string;
  email: string;
  phone: string;
}) {
  const classRecord = await db.getPublishedClassBySlug(input.slug);
  if (!classRecord) throw new Error("Kelas tidak ditemukan atau belum diterbitkan.");
  if (!classRecord.content.registration.enabled)
    throw new Error("Pendaftaran terintegrasi belum dibuka untuk kelas ini.");
  const amount = getClassCheckoutAmount(classRecord.content);
  const settings = await db.getCommerceSettings();
  if (settings.checkoutMode !== "integrated")
    throw new Error("Checkout terintegrasi belum diaktifkan oleh admin.");
  if (!settings.doku.clientId || !settings.doku.secretKey)
    throw new Error("DOKU belum dikonfigurasi oleh admin.");

  const student = await db.upsertStudent(input);
  const order = await db.createClassOrder({
    classId: classRecord.id,
    studentId: student.id,
    amount,
  });
  await db.recordPaymentActivity({
    orderId: order.id,
    invoiceNumber: order.invoiceNumber,
    environment: settings.doku.environment,
    eventType: "checkout_requested",
    status: "info",
    title: "Permintaan checkout dibuat",
    message: "Data pendaftaran diterima. Request dasar yang kompatibel dengan semua channel sedang dikirim ke DOKU.",
  });
  try {
    const checkout = await createDokuCheckout({
      settings: settings.doku,
      invoiceNumber: order.invoiceNumber,
      returnId: order.publicId,
      amount,
      className: classRecord.name,
      customer: {
        id: String(student.id),
        name: student.name,
        email: student.email,
        phone: student.phone,
      },
      publicAppUrl: publicAppUrl(),
    });
    await db.setOrderCheckout(order.id, checkout);
    await db.recordPaymentActivity({
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      environment: settings.doku.environment,
      eventType: "checkout_created",
      status: "success",
      title: "Link pembayaran berhasil dibuat",
      message: "DOKU menerima transaksi dan mengembalikan link pembayaran.",
      httpStatus: 200,
      requestId: checkout.requestId,
    });
    const detail = await db.getOrderDetailsByPublicId(order.publicId);
    if (detail) {
      await sendOrderEmail(
        "payment_link",
        detail,
        paymentEmailHtml({
          name: student.name,
          className: classRecord.name,
          invoiceNumber: order.invoiceNumber,
          amountLabel: formatRupiah(amount),
          paymentUrl: checkout.paymentUrl,
          expiresLabel: checkout.expiresAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
        }),
        `Selesaikan pembayaran ${classRecord.name}`
      );
    }
    return {
      orderId: order.publicId,
      invoiceNumber: order.invoiceNumber,
      paymentUrl: checkout.paymentUrl,
      expiresAt: checkout.expiresAt.toISOString(),
    };
  } catch (error) {
    const diagnostic = error instanceof DokuCheckoutError ? error.diagnostic : undefined;
    const credentialHint = diagnostic?.httpStatus === 401 || diagnostic?.httpStatus === 403;
    await db.recordPaymentActivity({
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      environment: settings.doku.environment,
      eventType: "checkout_failed",
      status: "error",
      title: "DOKU menolak pembuatan checkout",
      message: credentialHint
        ? "Periksa apakah Client ID, Active Secret Key, dan pilihan Sandbox/Production sudah sesuai."
        : diagnostic?.httpStatus === 500
          ? "DOKU mengembalikan kesalahan internal setelah menerima request Checkout resmi (termasuk timestamp tanpa milidetik). Pastikan produk DOKU Checkout dan minimal satu channel pembayaran sudah aktif pada akun ini; gunakan Request ID saat menghubungi DOKU."
          : "Checkout belum berhasil. Periksa konfigurasi DOKU dan coba kembali.",
      httpStatus: diagnostic?.httpStatus,
      providerCode: diagnostic?.providerCode,
      requestId: diagnostic?.requestId,
    });
    console.error("[DOKU] Checkout creation failed", error);
    throw new Error("Pembayaran belum dapat dibuat. Silakan coba kembali. Detailnya sudah tercatat di panel admin.");
  }
}

export async function getPublicOrderStatus(publicId: string) {
  let detail = await db.getOrderDetailsByPublicId(publicId);
  if (!detail) return undefined;
  if (detail.order.status === "pending_payment" && Date.now() - detail.order.createdAt.getTime() > 60_000) {
    await reconcileDokuOrder(detail).catch(error => console.error("[DOKU] Status reconciliation failed", error));
    detail = await db.getOrderDetailsByPublicId(publicId) || detail;
  }
  return {
    orderId: detail.order.publicId,
    invoiceNumber: detail.order.invoiceNumber,
    className: detail.classRow.name,
    amount: detail.order.amount,
    status: detail.order.status,
    paymentUrl: detail.order.status === "pending_payment" ? detail.order.paymentUrl : null,
    expiresAt: detail.order.expiresAt?.toISOString() || null,
    paidAt: detail.order.paidAt?.toISOString() || null,
  };
}

async function deliverPaidOrder(
  detail: NonNullable<Awaited<ReturnType<typeof db.getOrderDetailsByPublicId>>>,
  setupToken: string,
  eventKey: string,
) {
  const content = normalizeClassContent(JSON.parse(detail.classRow.contentJson));
  const setupUrl = `${publicAppUrl()}/akun/aktivasi/${setupToken}`;
  await sendOrderEmail(
    "enrollment_confirmation",
    detail,
    enrollmentEmailHtml({
      name: detail.student.name,
      className: detail.classRow.name,
      schedule: formatClassSchedule(content.schedule),
      meetingLabel: content.registration.meetingLabel,
      meetingUrl: content.registration.meetingUrl,
      setupUrl,
    }),
    `Pembayaran berhasil — ${detail.classRow.name}`
  );
  await sendMetaEvent({
    eventName: "Purchase",
    eventId: eventKey,
    sourceUrl: `${publicAppUrl()}/pembayaran/${detail.order.publicId}`,
    customData: {
      content_name: detail.classRow.name,
      content_ids: [detail.classRow.slug],
      content_type: "product",
      value: detail.order.amount,
      currency: "IDR",
      order_id: detail.order.invoiceNumber,
    },
    userData: { email: detail.student.email, phone: detail.student.phone },
  });
}

async function applyDokuStatus(input: {
  detail: NonNullable<Awaited<ReturnType<typeof db.getOrderDetailsByPublicId>>>;
  status: string;
  eventKey: string;
  payload: string;
  requestId?: string;
  source: "webhook" | "status_check";
}) {
  const result = await db.recordPaymentAndActivate({
    eventKey: input.eventKey,
    invoiceNumber: input.detail.order.invoiceNumber,
    status: input.status,
    payload: input.payload,
  });
  if (result.kind !== "duplicate") {
    const paid = result.kind === "paid";
    const settings = await db.getCommerceSettings();
    await db.recordPaymentActivity({
      orderId: input.detail.order.id,
      invoiceNumber: input.detail.order.invoiceNumber,
      environment: settings.doku.environment,
      eventType: input.source === "webhook" ? "webhook_processed" : "status_reconciled",
      status: paid ? "success" : "info",
      title: paid ? "Pembayaran berhasil dikonfirmasi" : "Status DOKU berhasil diperiksa",
      message: paid
        ? "Order otomatis menjadi Berhasil dan email akses mulai diproses."
        : `DOKU melaporkan status ${input.status}.`,
      requestId: input.requestId,
    });
  }
  if (result.kind === "paid") {
    await deliverPaidOrder(input.detail, result.setupToken, input.eventKey);
  }
  return result;
}

const reconciliationThrottle = new Map<string, number>();

async function reconcileDokuOrder(
  detail: NonNullable<Awaited<ReturnType<typeof db.getOrderDetailsByPublicId>>>,
) {
  const lastChecked = reconciliationThrottle.get(detail.order.invoiceNumber) || 0;
  if (Date.now() - lastChecked < 30_000) return;
  reconciliationThrottle.set(detail.order.invoiceNumber, Date.now());
  const settings = await db.getCommerceSettings();
  if (!settings.doku.clientId || !settings.doku.secretKey) return;
  const provider = await getDokuOrderStatus({
    settings: settings.doku,
    invoiceNumber: detail.order.invoiceNumber,
  });
  if (provider.invoiceNumber !== detail.order.invoiceNumber) throw new Error("Nomor invoice DOKU tidak cocok.");
  if (Number.isFinite(provider.amount) && provider.amount !== detail.order.amount) throw new Error("Nominal DOKU tidak cocok.");
  return applyDokuStatus({
    detail,
    status: provider.status,
    eventKey: `status-check:${detail.order.invoiceNumber}:${provider.status.toUpperCase()}`,
    payload: JSON.stringify(provider.payload),
    requestId: provider.requestId,
    source: "status_check",
  });
}

export async function reconcileRecentPendingOrders(limit = 5) {
  const pending = await db.listPendingOrdersForReconciliation(limit);
  const results = await Promise.allSettled(pending.map(detail => reconcileDokuOrder(detail)));
  return { checked: pending.length, failed: results.filter(result => result.status === "rejected").length };
}

export async function handleDokuWebhook(req: Request, rawBody: string) {
  const settings = await db.getCommerceSettings();
  if (!settings.doku.secretKey) return { status: 503, body: "DOKU is not configured" };
  if (!verifyDokuNotification({
    rawBody,
    headers: req.headers,
    secretKey: settings.doku.secretKey,
    requestTarget: req.path,
  })) {
    await db.recordPaymentActivity({
      environment: settings.doku.environment,
      eventType: "webhook_rejected",
      status: "warning",
      title: "Notifikasi DOKU ditolak",
      message: "Signature notifikasi tidak valid. Tidak ada status transaksi yang diubah.",
      requestId: req.get("request-id") || undefined,
    });
    return { status: 401, body: "Invalid signature" };
  }
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: "Invalid JSON" };
  }
  const invoiceNumber = String(payload?.order?.invoice_number || "");
  const status = String(payload?.transaction?.status || payload?.order?.status || "UNKNOWN");
  const amount = Number(payload?.order?.amount);
  const eventKey = String(
    req.get("request-id") || payload?.transaction?.original_request_id || `${invoiceNumber}:${status}`
  );
  if (!invoiceNumber) return { status: 400, body: "Missing invoice" };
  const detail = await db.getOrderDetailsByInvoice(invoiceNumber);
  if (!detail) return { status: 404, body: "Unknown invoice" };
  if (!Number.isFinite(amount) || amount !== detail.order.amount)
    return { status: 400, body: "Amount mismatch" };

  await applyDokuStatus({
    detail,
    status,
    eventKey,
    payload: rawBody,
    requestId: req.get("request-id") || undefined,
    source: "webhook",
  });
  return { status: 200, body: "OK" };
}

export async function sendResendTest(to: string) {
  const settings = await db.getCommerceSettings();
  if (!settings.resend.apiKey) throw new Error("Resend API key belum terpasang.");
  return sendEmail(settings.resend, {
    to,
    subject: "Test email StartHustler",
    html: `<div style="font-family:Arial,sans-serif"><h1>Resend berhasil terhubung</h1><p>Email transaksional StartHustler siap digunakan.</p></div>`,
  });
}

export async function resendEnrollmentConfirmation(publicId: string) {
  const detail = await db.getOrderDetailsByPublicId(publicId);
  if (!detail) throw new Error("Order tidak ditemukan.");
  if (detail.order.status !== "paid") throw new Error("Email akses hanya dapat dikirim untuk order paid.");
  const token = await db.createPasswordSetupToken(detail.student.id);
  const content = normalizeClassContent(JSON.parse(detail.classRow.contentJson));
  return sendOrderEmail(
    "enrollment_confirmation",
    detail,
    enrollmentEmailHtml({
      name: detail.student.name,
      className: detail.classRow.name,
      schedule: formatClassSchedule(content.schedule),
      meetingLabel: content.registration.meetingLabel,
      meetingUrl: content.registration.meetingUrl,
      setupUrl: `${publicAppUrl()}/akun/aktivasi/${token}`,
    }),
    `Akses kelas — ${detail.classRow.name}`
  );
}
