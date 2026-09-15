import {
  DEFAULT_CLASS_CONTENT,
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

const notFound = () =>
  new TRPCError({ code: "NOT_FOUND", message: "Kelas tidak ditemukan" });

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
        return [
          {
            id: 0,
            name: "Kelas Solopreneur",
            slug: "kelas-solopreneur",
            status: "published" as const,
            featured: true,
            content: DEFAULT_CLASS_CONTENT,
            createdAt: new Date(0).toISOString(),
            updatedAt: new Date(0).toISOString(),
          },
        ];
      }
    }),
    bySlug: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        try {
          const record = await db.getPublishedClassBySlug(input.slug);
          if (!record && input.slug === "kelas-solopreneur") {
            return {
              id: 0,
              name: "Kelas Solopreneur",
              slug: "kelas-solopreneur",
              status: "published" as const,
              featured: true,
              content: DEFAULT_CLASS_CONTENT,
              createdAt: new Date(0).toISOString(),
              updatedAt: new Date(0).toISOString(),
            };
          }
          if (!record) throw notFound();
          return record;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[ClassCMS] Public class fallback:", error);
          if (input.slug === "kelas-solopreneur") {
            return {
              id: 0,
              name: "Kelas Solopreneur",
              slug: "kelas-solopreneur",
              status: "published" as const,
              featured: true,
              content: DEFAULT_CLASS_CONTENT,
              createdAt: new Date(0).toISOString(),
              updatedAt: new Date(0).toISOString(),
            };
          }
          throw notFound();
        }
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
