import { createHash, randomBytes } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies.js";
import * as db from "../db.js";

const COOKIE_NAME = "sh_student_session";
const DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function authenticateStudent(req: Request) {
  const cookies = parseCookieHeader(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  return token ? db.getStudentBySessionHash(hash(token)) : undefined;
}

export async function createStudentLoginSession(req: Request, res: Response, studentId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + DURATION_MS);
  await db.createStudentSession({ tokenHash: hash(token), studentId, expiresAt });
  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    sameSite: "lax",
    maxAge: DURATION_MS,
  });
}

export async function clearStudentLoginSession(req: Request, res: Response) {
  const cookies = parseCookieHeader(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (token) await db.deleteStudentSession(hash(token));
  res.clearCookie(COOKIE_NAME, {
    ...getSessionCookieOptions(req),
    sameSite: "lax",
    maxAge: -1,
  });
}
