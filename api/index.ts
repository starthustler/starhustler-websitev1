import type { Request, Response } from "express";
import { createApp } from "../server/app";

const app = createApp();

export default function handler(req: Request, res: Response) {
  const rawPath =
    typeof req.query.__cms_path === "string" ? req.query.__cms_path : "";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "__cms_path") continue;
    if (Array.isArray(value))
      value.forEach(item => query.append(key, String(item)));
    else if (value !== undefined) query.set(key, String(value));
  }
  req.url = `/${rawPath}${query.size ? `?${query.toString()}` : ""}`;
  return app(req, res);
}
