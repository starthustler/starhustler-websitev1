import { afterEach, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./integrations/secrets.js";

describe("encrypted integration settings", () => {
  const original = process.env.SETTINGS_ENCRYPTION_KEY;
  afterEach(() => {
    if (original === undefined) delete process.env.SETTINGS_ENCRYPTION_KEY;
    else process.env.SETTINGS_ENCRYPTION_KEY = original;
  });

  it("round trips without exposing plaintext", () => {
    process.env.SETTINGS_ENCRYPTION_KEY = "test-only-key-with-at-least-24-characters";
    const encrypted = encryptSecret("sensitive-value");
    expect(encrypted).toMatch(/^enc:v1:/);
    expect(encrypted).not.toContain("sensitive-value");
    expect(decryptSecret(encrypted)).toBe("sensitive-value");
  });
});
