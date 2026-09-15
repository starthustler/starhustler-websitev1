import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth.js";
import { registerStorageProxy } from "./_core/storageProxy.js";
import { appRouter } from "./routers.js";
import { createContext } from "./_core/context.js";
import * as db from "./db.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    next();
  });
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ limit: "8mb", extended: true }));
  registerStorageProxy(app);
  if (process.env.OAUTH_SERVER_URL && process.env.JWT_SECRET) {
    registerOAuthRoutes(app);
  }
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  app.get("/api/health", async (_req, res) => {
    let adminConfigured = false;
    if (process.env.DATABASE_URL) {
      try {
        adminConfigured = await db.hasAdminUser();
      } catch {
        adminConfigured = false;
      }
    }
    res.json({
      ok: true,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      adminConfigured,
      authConfigured: adminConfigured,
    });
  });
  return app;
}
