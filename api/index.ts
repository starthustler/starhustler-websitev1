import type { Request, Response } from "express";

type ServerApp = ReturnType<(typeof import("../server/app"))["createApp"]>;

let appPromise: Promise<ServerApp> | null = null;

function getApp() {
  if (!appPromise) {
    // Keep server initialization inside the request lifecycle. Besides reducing
    // cold-start work for health checks, this turns bootstrap failures into a
    // controlled JSON response instead of Vercel's opaque invocation error.
    appPromise = import("../server/app").then(({ createApp }) => createApp());
  }
  return appPromise;
}

export default async function handler(req: Request, res: Response) {
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

  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    appPromise = null;
    console.error("[API] Bootstrap failed", error);
    return res.status(500).json({
      ok: false,
      error: "API bootstrap failed",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
