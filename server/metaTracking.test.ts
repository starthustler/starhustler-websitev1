import { describe, expect, it } from "vitest";
import {
  buildHashedUserData,
  normalizeEmail,
  normalizePhone,
  sha256,
} from "./metaTracking.js";

describe("Meta CAPI user data", () => {
  it("normalizes and hashes email and phone before payload creation", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
    expect(normalizePhone("+62 812-3456-7890")).toBe("6281234567890");
    expect(
      buildHashedUserData({
        email: "  User@Example.COM ",
        phone: "+62 812-3456-7890",
      })
    ).toEqual({
      em: [sha256("user@example.com")],
      ph: [sha256("6281234567890")],
    });
  });

  it("keeps browser identifiers and request metadata un-hashed", () => {
    expect(
      buildHashedUserData({
        clientIp: "203.0.113.4",
        clientUserAgent: "Test Browser",
        fbp: "fb.1.123.456",
        fbc: "fb.1.123.abc",
      })
    ).toEqual({
      client_ip_address: "203.0.113.4",
      client_user_agent: "Test Browser",
      fbp: "fb.1.123.456",
      fbc: "fb.1.123.abc",
    });
  });
});
