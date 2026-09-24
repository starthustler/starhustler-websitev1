import { describe, expect, it } from "vitest";
import {
  buildDokuCheckoutBody,
  createDokuSignature,
  digestBody,
  parseDokuExpiry,
  verifyDokuNotification,
} from "./integrations/doku.js";

describe("DOKU signature", () => {
  it("creates deterministic HMAC signatures", () => {
    const body = JSON.stringify({ order: { invoice_number: "SH-TEST", amount: 200000 } });
    const signature = createDokuSignature({
      clientId: "CLIENT-1",
      secretKey: "secret-for-test-only",
      requestId: "request-1",
      requestTimestamp: "2026-09-24T04:00:00.000Z",
      requestTarget: "/checkout/v1/payment",
      digest: digestBody(body),
    });
    expect(signature).toMatch(/^HMACSHA256=[A-Za-z0-9+/=]+$/);
    expect(signature).toBe(createDokuSignature({
      clientId: "CLIENT-1",
      secretKey: "secret-for-test-only",
      requestId: "request-1",
      requestTimestamp: "2026-09-24T04:00:00.000Z",
      requestTarget: "/checkout/v1/payment",
      digest: digestBody(body),
    }));
  });

  it("accepts valid webhook signatures and rejects tampered bodies", () => {
    const rawBody = JSON.stringify({ order: { invoice_number: "SH-TEST", amount: 200000 } });
    const digest = digestBody(rawBody);
    const headers = {
      "client-id": "CLIENT-1",
      "request-id": "request-2",
      "request-timestamp": "2026-09-24T04:00:00.000Z",
      "request-target": "/api/payments/doku/webhook",
      digest,
      signature: createDokuSignature({
        clientId: "CLIENT-1",
        secretKey: "secret-for-test-only",
        requestId: "request-2",
        requestTimestamp: "2026-09-24T04:00:00.000Z",
        requestTarget: "/api/payments/doku/webhook",
        digest,
      }),
    };
    expect(verifyDokuNotification({ rawBody, headers, secretKey: "secret-for-test-only" })).toBe(true);
    expect(verifyDokuNotification({ rawBody: `${rawBody} `, headers, secretKey: "secret-for-test-only" })).toBe(false);
  });

  it("builds the Checkout payload using DOKU's payment object", () => {
    const payload = buildDokuCheckoutBody({
      settings: { paymentDueMinutes: 60 },
      invoiceNumber: "SH-TEST",
      returnId: "return-1",
      amount: 200000,
      className: "Kelas Solopreneur",
      customer: {
        id: "customer-1",
        name: "Test User",
        email: "test@example.com",
        phone: "08123456789",
      },
      publicAppUrl: "https://www.starthustler.com",
    });

    expect(payload.payment).toEqual({ payment_due_date: 60 });
    expect(payload.order).not.toHaveProperty("payment_due_date");
    expect(payload.order.callback_url_result).toBe(
      "https://www.starthustler.com/pembayaran/return-1",
    );
  });

  it("parses DOKU expiry timestamps as Western Indonesian Time", () => {
    expect(parseDokuExpiry("20240712104711")?.toISOString()).toBe(
      "2024-07-12T03:47:11.000Z",
    );
    expect(parseDokuExpiry("not-a-date")).toBeUndefined();
  });
});
