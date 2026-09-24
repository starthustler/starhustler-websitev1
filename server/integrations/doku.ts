import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type DokuSettings = {
  environment: "sandbox" | "production";
  clientId: string;
  secretKey: string;
  paymentDueMinutes: number;
};

export type CheckoutCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export class DokuCheckoutError extends Error {
  constructor(
    message: string,
    public readonly diagnostic: {
      environment: DokuSettings["environment"];
      httpStatus: number;
      requestId: string;
      providerCode?: string;
      providerMessage?: string;
    },
  ) {
    super(message);
    this.name = "DokuCheckoutError";
  }
}

export function normalizeDokuPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function digestBody(rawBody: string) {
  return createHash("sha256").update(rawBody).digest("base64");
}

/**
 * DOKU's official Checkout/Postman examples use ISO-8601 UTC timestamps with
 * second precision. JavaScript's toISOString() includes milliseconds, which is
 * valid ISO-8601 but is not the exact wire format used by DOKU's reference
 * implementation. Keep our signed header byte-for-byte compatible with it.
 */
export function createDokuRequestTimestamp(date = new Date()) {
  return `${date.toISOString().slice(0, 19)}Z`;
}

export function createDokuSignature(input: {
  clientId: string;
  secretKey: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  digest?: string;
}) {
  const component = [
    `Client-Id:${input.clientId}`,
    `Request-Id:${input.requestId}`,
    `Request-Timestamp:${input.requestTimestamp}`,
    `Request-Target:${input.requestTarget}`,
    ...(input.digest ? [`Digest:${input.digest}`] : []),
  ].join("\n");
  return `HMACSHA256=${createHmac("sha256", input.secretKey)
    .update(component)
    .digest("base64")}`;
}

export async function getDokuOrderStatus(input: {
  settings: DokuSettings;
  invoiceNumber: string;
}) {
  const target = `/orders/v1/status/${encodeURIComponent(input.invoiceNumber)}`;
  const requestId = crypto.randomUUID();
  const requestTimestamp = createDokuRequestTimestamp();
  const signature = createDokuSignature({
    clientId: input.settings.clientId,
    secretKey: input.settings.secretKey,
    requestId,
    requestTimestamp,
    requestTarget: target,
  });
  const host = input.settings.environment === "production"
    ? "https://api.doku.com"
    : "https://api-sandbox.doku.com";
  const response = await fetch(`${host}${target}`, {
    method: "GET",
    headers: {
      "Client-Id": input.settings.clientId,
      "Request-Id": requestId,
      "Request-Timestamp": requestTimestamp,
      Signature: signature,
    },
    signal: AbortSignal.timeout(15_000),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, any>;
  if (!response.ok) {
    const messages = getDokuErrorMessages(payload);
    throw new DokuCheckoutError("Status transaksi DOKU belum dapat diperiksa.", {
      environment: input.settings.environment,
      httpStatus: response.status,
      requestId,
      providerCode: getDokuProviderCode(payload),
      providerMessage: messages.join("; ") || undefined,
    });
  }
  return {
    requestId,
    payload,
    status: String(payload?.transaction?.status || payload?.order?.status || "UNKNOWN"),
    amount: Number(payload?.order?.amount),
    invoiceNumber: String(payload?.order?.invoice_number || input.invoiceNumber),
  };
}

export function buildDokuCheckoutBody(input: {
  settings: Pick<DokuSettings, "paymentDueMinutes">;
  invoiceNumber: string;
  returnId: string;
  amount: number;
  className: string;
  customer: CheckoutCustomer;
  publicAppUrl: string;
}) {
  // Keep the Checkout request on DOKU's documented "Basic Request" shape.
  // Customer data remains in StartHustler and the notification URL is
  // configured in DOKU Back Office. Sending an override URL requires a
  // matching pre-configured path and can make an otherwise valid request fail.
  return {
    order: {
      amount: input.amount,
      invoice_number: input.invoiceNumber,
    },
    payment: {
      payment_due_date: input.settings.paymentDueMinutes,
    },
  };
}

export function parseDokuExpiry(value: unknown) {
  if (typeof value !== "string") return undefined;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (!match) return undefined;
  const [, year, month, day, hour, minute, second] = match;
  // DOKU returns yyyyMMddHHmmss in Western Indonesian Time (UTC+7).
  const timestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) - 7,
    Number(minute),
    Number(second),
  );
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getDokuErrorMessages(payload: Record<string, any>) {
  const messages = Array.isArray(payload?.message) ? payload.message : [];
  const details = messages
    .map((item: unknown) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      const entry = item as Record<string, unknown>;
      return [entry.code, entry.message].filter(Boolean).map(String).join(": ");
    })
    .filter(Boolean);
  const fallback = payload?.error?.message || payload?.response?.message;
  if (details.length) return details;
  return fallback ? [String(fallback)] : [];
}

function getDokuProviderCode(payload: Record<string, any>) {
  const first = Array.isArray(payload?.message) ? payload.message[0] : undefined;
  if (first && typeof first === "object" && first.code) return String(first.code);
  return payload?.error?.code || payload?.response?.code || payload?.code
    ? String(payload?.error?.code || payload?.response?.code || payload?.code)
    : undefined;
}

export async function createDokuCheckout(input: {
  settings: DokuSettings;
  invoiceNumber: string;
  returnId: string;
  amount: number;
  className: string;
  customer: CheckoutCustomer;
  publicAppUrl: string;
}) {
  const target = "/checkout/v1/payment";
  const requestId = crypto.randomUUID();
  const requestTimestamp = createDokuRequestTimestamp();
  const body = JSON.stringify(buildDokuCheckoutBody(input));
  const digest = digestBody(body);
  const signature = createDokuSignature({
    clientId: input.settings.clientId,
    secretKey: input.settings.secretKey,
    requestId,
    requestTimestamp,
    requestTarget: target,
    digest,
  });
  const host =
    input.settings.environment === "production"
      ? "https://api.doku.com"
      : "https://api-sandbox.doku.com";
  const response = await fetch(`${host}${target}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Id": input.settings.clientId,
      "Request-Id": requestId,
      "Request-Timestamp": requestTimestamp,
      Signature: signature,
    },
    body,
    signal: AbortSignal.timeout(15_000),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, any>;
  if (!response.ok || !payload?.response?.payment?.url) {
    const messages = getDokuErrorMessages(payload);
    const providerCode = getDokuProviderCode(payload);
    console.error("[DOKU] Checkout API rejected request", {
      environment: input.settings.environment,
      httpStatus: response.status,
      requestId,
      providerCode,
      messages,
    });
    throw new DokuCheckoutError("Checkout DOKU belum berhasil dibuat.", {
      environment: input.settings.environment,
      httpStatus: response.status,
      requestId,
      providerCode,
      providerMessage: messages.join("; ") || undefined,
    });
  }
  return {
    paymentUrl: String(payload.response.payment.url),
    paymentToken: String(
      payload.response.payment.token_id || payload.response.payment.token || "",
    ),
    expiresAt:
      parseDokuExpiry(payload.response.payment.expired_date) ||
      new Date(Date.now() + input.settings.paymentDueMinutes * 60_000),
    requestId,
  };
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyDokuNotification(input: {
  rawBody: string;
  headers: Record<string, string | string[] | undefined>;
  secretKey: string;
  requestTarget?: string;
}) {
  const header = (name: string) => {
    const value = input.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] || "" : value || "";
  };
  const clientId = header("client-id");
  const requestId = header("request-id");
  const requestTimestamp = header("request-timestamp");
  // DOKU signs the path configured as its Notification URL. Request-Target is
  // a signing component, not a header sent with the callback.
  const requestTarget = input.requestTarget || header("request-target") || "/api/payments/doku/webhook";
  const suppliedDigest = header("digest");
  const digest = digestBody(input.rawBody);
  if (suppliedDigest && !safeEqual(suppliedDigest, digest)) return false;
  const expected = createDokuSignature({
    clientId,
    secretKey: input.secretKey,
    requestId,
    requestTimestamp,
    requestTarget,
    digest,
  });
  return Boolean(clientId && requestId && requestTimestamp && safeEqual(header("signature"), expected));
}
