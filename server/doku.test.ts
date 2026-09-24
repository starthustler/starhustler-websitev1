import { describe, expect, it } from "vitest";
import {
  createDokuSignature,
  digestBody,
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
});
