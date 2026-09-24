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

export function digestBody(rawBody: string) {
  return createHash("sha256").update(rawBody).digest("base64");
}

export function createDokuSignature(input: {
  clientId: string;
  secretKey: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  digest: string;
}) {
  const component = [
    `Client-Id:${input.clientId}`,
    `Request-Id:${input.requestId}`,
    `Request-Timestamp:${input.requestTimestamp}`,
    `Request-Target:${input.requestTarget}`,
    `Digest:${input.digest}`,
  ].join("\n");
  return `HMACSHA256=${createHmac("sha256", input.secretKey)
    .update(component)
    .digest("base64")}`;
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
  const requestTimestamp = new Date().toISOString();
  const body = JSON.stringify({
    order: {
      amount: input.amount,
      invoice_number: input.invoiceNumber,
      currency: "IDR",
      payment_due_date: input.settings.paymentDueMinutes,
      callback_url_result: `${input.publicAppUrl}/pembayaran/${input.returnId}`,
      line_items: [
        {
          id: input.invoiceNumber,
          name: input.className,
          price: input.amount,
          quantity: 1,
        },
      ],
    },
    customer: {
      id: input.customer.id,
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
    },
    additional_info: {
      override_notification_url: `${input.publicAppUrl}/api/payments/doku/webhook`,
    },
  });
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
    const message =
      payload?.error?.message ||
      payload?.response?.message ||
      `DOKU checkout gagal (${response.status})`;
    throw new Error(String(message));
  }
  return {
    paymentUrl: String(payload.response.payment.url),
    paymentToken: String(payload.response.payment.token || ""),
    expiresAt: payload.response.payment.expired_date
      ? new Date(payload.response.payment.expired_date)
      : new Date(Date.now() + input.settings.paymentDueMinutes * 60_000),
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
}) {
  const header = (name: string) => {
    const value = input.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] || "" : value || "";
  };
  const clientId = header("client-id");
  const requestId = header("request-id");
  const requestTimestamp = header("request-timestamp");
  const requestTarget = header("request-target") || "/api/payments/doku/webhook";
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
