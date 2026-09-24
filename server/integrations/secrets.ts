import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

function encryptionKey() {
  const master = process.env.SETTINGS_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!master || master.length < 24) return null;
  return createHash("sha256").update(master).digest();
}

export function canEncryptSecrets() {
  return Boolean(encryptionKey());
}

export function encryptSecret(value: string) {
  if (!value) return "";
  const key = encryptionKey();
  if (!key) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY belum terpasang. Tambahkan secret minimal 24 karakter di Vercel."
    );
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptSecret(value?: string) {
  if (!value) return "";
  if (!value.startsWith(PREFIX)) return value;
  const key = encryptionKey();
  if (!key) return "";
  try {
    const [ivText, tagText, encryptedText] = value.slice(PREFIX.length).split(".");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivText, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
}
