import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { parse as parseCookieHeader } from "cookie";
import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema.js";
import { COOKIE_NAME } from "../../shared/const.js";
import * as db from "../db.js";
import { getSessionCookieOptions } from "./cookies.js";

const scrypt = promisify(scryptCallback);
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

const sessionHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, saltText, hashText] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltText || !hashText) return false;
  const expected = Buffer.from(hashText, "base64url");
  const actual = (await scrypt(
    password,
    Buffer.from(saltText, "base64url"),
    expected.length
  )) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function readSessionToken(req: Request) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  return cookies[COOKIE_NAME] || null;
}

export async function authenticateLocalRequest(req: Request) {
  const token = readSessionToken(req);
  if (!token || !process.env.DATABASE_URL) return null;
  return db.getUserBySessionHash(sessionHash(token));
}

export async function createLocalSession(
  req: Request,
  res: Response,
  userId: number
) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await db.createAdminSession({
    tokenHash: sessionHash(token),
    userId,
    expiresAt,
  });
  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS,
  });
}

export async function clearLocalSession(req: Request, res: Response) {
  const token = readSessionToken(req);
  if (token && process.env.DATABASE_URL) {
    await db.deleteAdminSession(sessionHash(token));
  }
  res.clearCookie(COOKIE_NAME, {
    ...getSessionCookieOptions(req),
    sameSite: "lax",
    maxAge: -1,
  });
}

export type SafeUser = Omit<User, "passwordHash">;

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
