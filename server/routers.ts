import {
  DEFAULT_CLASS_CONTENT,
  DEFAULT_CLASS_RECORDS,
  normalizeClassContent,
} from "../shared/classContent.js";
import {
  clearLocalSession,
  createLocalSession,
  hashPassword,
  toSafeUser,
  verifyPassword,
} from "./_core/localAuth.js";
import { systemRouter } from "./_core/systemRouter.js";
import { adminProcedure, publicProcedure, router } from "./_core/trpc.js";
import { storagePut } from "./storage.js";
import * as db from "./db.js";
import { sendMetaEvent, type MetaEventName } from "./metaTracking.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const classInput = z.object({
  name: z.string().trim().min(2).max(180),
  slug: slugSchema,
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  content: z.record(z.string(), z.unknown()),
});
const settingsInput = z.object({
  paymentProvider: z.string().trim().min(2).max(80),
  paymentUrl: z.string().trim().url().max(1000),
  metaPixelId: z.string().trim().max(80),
  metaCapiToken: z.string().trim().max(1000).optional(),
  clearMetaCapiToken: z.boolean().optional(),
  metaTestEventCode: z.string().trim().max(100).optional(),
  clearMetaTestEventCode: z.boolean().optional(),
  metaEvents: z.object({
    pageView: z.boolean(),
    viewContent: z.boolean(),
    lead: z.boolean(),
    initiateCheckout: z.boolean(),
    purchase: z.boolean(),
  }),
});
const publicMetaEventInput = z.object({
  eventName: z.enum(["PageView", "ViewContent", "Lead", "InitiateCheckout"]),
  eventId: z.string().uuid(),
  url: z.string().url().max(2000),
  contentName: z.string().trim().max(240).optional(),
  contentIds: z.array(z.string().trim().min(1).max(180)).max(20).optional(),
  value: z.number().finite().nonnegative().max(1_000_000_000).optional(),
  currency: z.literal("IDR").optional(),
  fbp: z.string().trim().max(255).optional(),
  fbc: z.string().trim().max(255).optional(),
});
const blogInput = z.object({
  title: z.string().trim().min(2).max(240),
  slug: slugSchema,
  category: z.string().trim().min(2).max(100),
  excerpt: z.string().trim().min(2).max(1000),
  imageUrl: z.string().trim().max(2000),
  content: z.string().trim().min(2).max(100000),
  status: z.enum(["draft", "published"]),
});

const notFound = () =>
  new TRPCError({ code: "NOT_FOUND", message: "Kelas tidak ditemukan" });
const fallbackClass = (slug: string) => {
  const record = DEFAULT_CLASS_RECORDS.find(item => item.slug === slug);
  return record
    ? {
        ...record,
        id: 0,
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
      }
    : undefined;
};

const credentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(12).max(128),
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    status: publicProcedure.query(async () => {
      if (!process.env.DATABASE_URL) {
        return { databaseConfigured: false, adminConfigured: false };
      }
      try {
        return {
          databaseConfigured: true,
          adminConfigured: await db.hasAdminUser(),
        };
      } catch {
        return { databaseConfigured: true, adminConfigured: false };
      }
    }),
    me: publicProcedure.query(opts =>
      opts.ctx.user ? toSafeUser(opts.ctx.user) : null
    ),
    setup: publicProcedure
      .input(
        credentialsSchema.extend({
          name: z.string().trim().min(2).max(120),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!process.env.DATABASE_URL) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Database admin belum terhubung",
          });
        }
        if (await db.hasAdminUser()) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin sudah dikonfigurasi",
          });
        }
        const user = await db.createInitialAdmin({
          name: input.name,
          email: input.email,
          passwordHash: await hashPassword(input.password),
        });
        await createLocalSession(ctx.req, ctx.res, user.id);
        return toSafeUser(user);
      }),
    login: publicProcedure
      .input(credentialsSchema)
      .mutation(async ({ input, ctx }) => {
        const user = process.env.DATABASE_URL
          ? await db.getAdminByEmail(input.email)
          : undefined;
        const valid = Boolean(
          user?.passwordHash &&
          (await verifyPassword(input.password, user.passwordHash))
        );
        if (!valid || !user) {
          await new Promise(resolve => setTimeout(resolve, 350));
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email atau password salah",
          });
        }
        await createLocalSession(ctx.req, ctx.res, user.id);
        return toSafeUser(user);
      }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      await clearLocalSession(ctx.req, ctx.res);
      return {
        success: true,
      } as const;
    }),
  }),
  classes: router({
    list: publicProcedure.query(async () => {
      try {
        return await db.listPublishedClasses();
      } catch (error) {
        console.error("[ClassCMS] Public list fallback:", error);
        return DEFAULT_CLASS_RECORDS;
      }
    }),
    bySlug: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        try {
          const record = await db.getPublishedClassBySlug(input.slug);
          if (!record) {
            const fallback = fallbackClass(input.slug);
            if (fallback) return fallback;
            throw notFound();
          }
          return record;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[ClassCMS] Public class fallback:", error);
          const fallback = fallbackClass(input.slug);
          if (fallback) return fallback;
          throw notFound();
        }
      }),
  }),
  settings: router({
    public: publicProcedure.query(async () => {
      try {
        return await db.getPublicSettings();
      } catch {
        return {
          paymentProvider: "DOKU",
          paymentUrl: DEFAULT_CLASS_CONTENT.pricing.paymentUrl,
          metaPixelId: "",
          metaEvents: {
            pageView: true,
            viewContent: true,
            lead: true,
            initiateCheckout: true,
            purchase: true,
          },
        };
      }
    }),
  }),
  tracking: router({
    event: publicProcedure
      .input(publicMetaEventInput)
      .mutation(async ({ input, ctx }) => {
        const target = new URL(input.url);
        const validHost =
          target.hostname === "starthustler.com" ||
          target.hostname.endsWith(".starthustler.com") ||
          target.hostname === "localhost";
        if (!validHost) return { sent: false, status: "skipped" as const };
        const origin = ctx.req.get("origin");
        if (origin && new URL(origin).origin !== target.origin)
          return { sent: false, status: "skipped" as const };
        return sendMetaEvent({
          eventName: input.eventName as MetaEventName,
          eventId: input.eventId,
          sourceUrl: input.url,
          customData:
            input.contentName || input.contentIds || input.value !== undefined
              ? {
                  content_name: input.contentName,
                  content_ids: input.contentIds,
                  content_type: input.contentIds?.length
                    ? "product"
                    : undefined,
                  value: input.value,
                  currency: input.currency,
                }
              : undefined,
          userData: {
            clientIp: ctx.req.ip,
            clientUserAgent: ctx.req.get("user-agent") || "",
            fbp: input.fbp,
            fbc: input.fbc,
          },
        });
      }),
  }),
  blog: router({
    list: publicProcedure.query(async () => {
      try {
        return await db.listPublishedBlogPosts();
      } catch {
        return [];
      }
    }),
    bySlug: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(({ input }) => db.getPublishedBlogPost(input.slug)),
  }),
  settingsAdmin: router({
    get: adminProcedure.query(() => db.getAdminSettings()),
    update: adminProcedure
      .input(settingsInput)
      .mutation(({ input }) => db.updateAdminSettings(input)),
    sendMetaTestEvent: adminProcedure.mutation(async () => {
      const settings = await db.getMetaServerSettings();
      if (!settings.pixelId || !settings.capiToken || !settings.testEventCode) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Pixel ID, CAPI token, dan Test Event Code harus terpasang.",
        });
      }
      return sendMetaEvent({
        eventName: "ViewContent",
        eventId: crypto.randomUUID(),
        sourceUrl: "https://www.starthustler.com/admin/settings#meta",
        customData: {
          content_name: "STARTHUSTLER Meta CAPI Test",
          content_ids: ["meta-capi-test"],
          content_type: "product",
          value: 0,
          currency: "IDR",
        },
        useTestEventCode: true,
      });
    }),
  }),
  blogAdmin: router({
    list: adminProcedure.query(() => db.listAllBlogPosts()),
    byId: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostById(input.id);
        if (!post)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Artikel tidak ditemukan",
          });
        return post;
      }),
    save: adminProcedure
      .input(blogInput.extend({ id: z.number().int().positive().nullable() }))
      .mutation(({ input }) => {
        const { id, ...post } = input;
        return db.saveBlogPost(id, post);
      }),
  }),
  classAdmin: router({
    health: adminProcedure.query(async () => {
      await db.ensureClassCmsSchema();
      return {
        database: true,
        storage: Boolean(
          process.env.BUILT_IN_FORGE_API_URL &&
          process.env.BUILT_IN_FORGE_API_KEY
        ),
      };
    }),
    list: adminProcedure.query(() => db.listAllClasses()),
    byId: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const record = await db.getClassById(input.id);
        if (!record) throw notFound();
        return record;
      }),
    bySlug: adminProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        const record = await db.getClassBySlug(input.slug);
        if (!record) throw notFound();
        return record;
      }),
    create: adminProcedure.input(classInput).mutation(({ input }) =>
      db.createClass({
        ...input,
        content: normalizeClassContent(input.content),
      })
    ),
    update: adminProcedure
      .input(classInput.extend({ id: z.number().int().positive() }))
      .mutation(({ input }) =>
        db.updateClass(input.id, {
          ...input,
          content: normalizeClassContent(input.content),
        })
      ),
    setStatus: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["draft", "published"]),
        })
      )
      .mutation(async ({ input }) => {
        const current = await db.getClassById(input.id);
        if (!current) throw notFound();
        return db.updateClass(input.id, { ...current, status: input.status });
      }),
    duplicate: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const current = await db.getClassById(input.id);
        if (!current) throw notFound();
        const suffix = Date.now().toString().slice(-6);
        return db.createClass({
          ...current,
          name: `${current.name} (Salinan)`,
          slug: `${current.slug}-salinan-${suffix}`,
          status: "draft",
          featured: false,
        });
      }),
    remove: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await db.deleteClass(input.id);
        return { success: true } as const;
      }),
    uploadImage: adminProcedure
      .input(
        z.object({
          fileName: z.string().min(1).max(200),
          dataUrl: z.string().max(8_000_000),
        })
      )
      .mutation(async ({ input }) => {
        const match = input.dataUrl.match(
          /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/
        );
        if (!match)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Format gambar tidak didukung",
          });
        const buffer = Buffer.from(match[2], "base64");
        if (buffer.byteLength > 5_000_000)
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: "Ukuran gambar maksimal 5 MB",
          });
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        return storagePut(`class-images/${safeName}`, buffer, match[1]);
      }),
  }),
});

export type AppRouter = typeof appRouter;
