import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema.js";
import { authenticateLocalRequest } from "./localAuth.js";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = (await authenticateLocalRequest(opts.req)) ?? null;
    if (!user && process.env.JWT_SECRET && process.env.OAUTH_SERVER_URL) {
      const { sdk } = await import("./sdk.js");
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
