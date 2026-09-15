import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./_core/localAuth";

describe("local admin password security", () => {
  it("stores a salted hash and accepts only the original password", async () => {
    const password = "contoh-password-kuat-123";
    const encoded = await hashPassword(password);

    expect(encoded).toMatch(/^scrypt\$/);
    expect(encoded).not.toContain(password);
    await expect(verifyPassword(password, encoded)).resolves.toBe(true);
    await expect(verifyPassword("password-yang-salah", encoded)).resolves.toBe(
      false
    );
  });

  it("rejects malformed stored hashes", async () => {
    await expect(verifyPassword("anything", "not-a-valid-hash")).resolves.toBe(
      false
    );
  });
});
