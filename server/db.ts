import { and, desc, eq, gt, isNotNull, isNull, lt, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  adminSessions,
  blogPosts,
  classEnrollments,
  classOrders,
  classes,
  emailDeliveries,
  passwordSetupTokens,
  paymentActivityLogs,
  paymentEvents,
  type InsertClass,
  type InsertUser,
  type User,
  siteSettings,
  studentSessions,
  students,
  users,
} from "../drizzle/schema.js";
import {
  DEFAULT_CLASS_RECORDS,
  DEFAULT_PAYMENT_URL,
  normalizeClassContent,
  type ClassContent,
  type ClassRecord,
  type PublishStatus,
} from "../shared/classContent.js";
import { ENV } from "./_core/env.js";
import { decryptSecret, encryptSecret } from "./integrations/secrets.js";
import { createHash, randomBytes } from "node:crypto";

let dbClient: ReturnType<typeof postgres> | null = null;
let database: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!database && process.env.DATABASE_URL) {
    try {
      dbClient = postgres(process.env.DATABASE_URL, {
        max: 1,
        prepare: false,
        connect_timeout: 10,
        idle_timeout: 20,
      });
      database = drizzle(dbClient);
    } catch (error) {
      console.warn("[Database] Failed to initialize:", error);
      dbClient = null;
      database = null;
    }
  }
  return database;
}

let appSchemaInitialization: Promise<void> | null = null;

export async function ensureClassCmsSchema(): Promise<void> {
  if (appSchemaInitialization) return appSchemaInitialization;
  appSchemaInitialization = (async () => {
    const db = await getDb();
    if (!db) throw new Error("DATABASE_URL is not configured");

    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY,
        "openId" varchar(320) NOT NULL UNIQUE,
        "name" text,
        "email" varchar(320),
        "loginMethod" varchar(64),
        "role" varchar(16) NOT NULL DEFAULT 'user',
        "passwordHash" text,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "lastSignedIn" timestamptz NOT NULL DEFAULT now()
      )
    `)
    );
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS "students" (
        "id" serial PRIMARY KEY, "name" varchar(160) NOT NULL,
        "email" varchar(320) NOT NULL UNIQUE, "phone" varchar(32) NOT NULL,
        "passwordHash" text, "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "class_orders" (
        "id" serial PRIMARY KEY, "publicId" varchar(36) NOT NULL UNIQUE,
        "invoiceNumber" varchar(64) NOT NULL UNIQUE, "classId" integer NOT NULL,
        "studentId" integer NOT NULL, "amount" integer NOT NULL,
        "currency" varchar(3) NOT NULL DEFAULT 'IDR',
        "status" varchar(24) NOT NULL DEFAULT 'pending_payment',
        "paymentUrl" text, "paymentToken" text, "expiresAt" timestamptz,
        "paidAt" timestamptz, "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "class_orders_student_idx" ON "class_orders" ("studentId");
      CREATE INDEX IF NOT EXISTS "class_orders_class_idx" ON "class_orders" ("classId");
      CREATE INDEX IF NOT EXISTS "class_orders_status_idx" ON "class_orders" ("status");
      CREATE TABLE IF NOT EXISTS "class_enrollments" (
        "id" serial PRIMARY KEY, "classId" integer NOT NULL, "studentId" integer NOT NULL,
        "orderId" integer NOT NULL, "status" varchar(24) NOT NULL DEFAULT 'active',
        "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "class_enrollments_student_class_idx" ON "class_enrollments" ("studentId", "classId");
      CREATE TABLE IF NOT EXISTS "payment_events" (
        "id" serial PRIMARY KEY, "eventKey" varchar(128) NOT NULL UNIQUE,
        "orderId" integer, "status" varchar(32) NOT NULL, "payload" text NOT NULL,
        "receivedAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "payment_activity_logs" (
        "id" serial PRIMARY KEY, "orderId" integer, "invoiceNumber" varchar(64),
        "provider" varchar(32) NOT NULL DEFAULT 'DOKU', "environment" varchar(16),
        "eventType" varchar(40) NOT NULL, "status" varchar(16) NOT NULL,
        "title" varchar(180) NOT NULL, "message" text NOT NULL,
        "httpStatus" integer, "providerCode" varchar(80), "requestId" varchar(128),
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "payment_activity_logs_created_idx" ON "payment_activity_logs" ("createdAt");
      CREATE TABLE IF NOT EXISTS "password_setup_tokens" (
        "tokenHash" varchar(64) PRIMARY KEY, "studentId" integer NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(), "expiresAt" timestamptz NOT NULL,
        "usedAt" timestamptz
      );
      CREATE TABLE IF NOT EXISTS "student_sessions" (
        "tokenHash" varchar(64) PRIMARY KEY, "studentId" integer NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(), "expiresAt" timestamptz NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "email_deliveries" (
        "id" serial PRIMARY KEY, "orderId" integer NOT NULL, "kind" varchar(32) NOT NULL,
        "recipient" varchar(320) NOT NULL, "status" varchar(24) NOT NULL DEFAULT 'pending',
        "providerMessageId" varchar(160), "lastError" text, "attempts" integer NOT NULL DEFAULT 0,
        "sentAt" timestamptz, "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "email_deliveries_order_kind_idx" ON "email_deliveries" ("orderId", "kind");
    `));
    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "key" varchar(120) PRIMARY KEY,
        "value" text NOT NULL,
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `)
    );
    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" serial PRIMARY KEY,
        "slug" varchar(180) NOT NULL UNIQUE,
        "title" varchar(240) NOT NULL,
        "category" varchar(100) NOT NULL DEFAULT 'Catatan',
        "excerpt" text NOT NULL,
        "imageUrl" text NOT NULL DEFAULT '',
        "content" text NOT NULL,
        "status" varchar(16) NOT NULL DEFAULT 'draft',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "publishedAt" timestamptz
      )
    `)
    );
    await db.execute(
      sql.raw(`
      CREATE UNIQUE INDEX IF NOT EXISTS "one_admin_idx"
      ON "users" (("role")) WHERE "role" = 'admin'
    `)
    );
    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS "admin_sessions" (
        "tokenHash" varchar(64) PRIMARY KEY,
        "userId" integer NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "expiresAt" timestamptz NOT NULL
      )
    `)
    );
    await db.execute(
      sql.raw(`
      CREATE INDEX IF NOT EXISTS "admin_sessions_user_idx"
      ON "admin_sessions" ("userId")
    `)
    );
    await db.execute(
      sql.raw(`
      CREATE INDEX IF NOT EXISTS "admin_sessions_expiry_idx"
      ON "admin_sessions" ("expiresAt")
    `)
    );
    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS "classes" (
        "id" serial PRIMARY KEY,
        "name" varchar(180) NOT NULL,
        "slug" varchar(180) NOT NULL UNIQUE,
        "status" varchar(16) NOT NULL DEFAULT 'draft',
        "featured" integer NOT NULL DEFAULT 0,
        "contentJson" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `)
    );

    await db
      .insert(classes)
      .values(
        DEFAULT_CLASS_RECORDS.map(record => ({
          name: record.name,
          slug: record.slug,
          status: record.status,
          featured: record.featured ? 1 : 0,
          contentJson: JSON.stringify(record.content),
        }))
      )
      .onConflictDoNothing({ target: classes.slug });

    await db
      .insert(siteSettings)
      .values([
        { key: "payment_provider", value: "DOKU" },
        { key: "payment_url", value: DEFAULT_PAYMENT_URL },
        { key: "meta_pixel_id", value: "" },
        { key: "meta_capi_token", value: "" },
        { key: "meta_test_event_code", value: "" },
        { key: "meta_event_page_view", value: "true" },
        { key: "meta_event_view_content", value: "true" },
        { key: "meta_event_lead", value: "true" },
        { key: "meta_event_initiate_checkout", value: "true" },
        { key: "meta_event_purchase", value: "true" },
        { key: "checkout_mode", value: "payment_link" },
        { key: "doku_environment", value: "sandbox" },
        { key: "doku_client_id", value: "" },
        { key: "doku_secret_key", value: "" },
        { key: "doku_payment_due_minutes", value: "60" },
        { key: "resend_api_key", value: "" },
        { key: "resend_from_name", value: "Kelas StartHustler" },
        { key: "resend_from_email", value: "kelas@mail.starthustler.com" },
        { key: "resend_reply_to", value: "" },
      ])
      .onConflictDoNothing({ target: siteSettings.key });

    const seedMarker = await db
      .select({ key: siteSettings.key })
      .from(siteSettings)
      .where(eq(siteSettings.key, "catalogue_seed_v2"))
      .limit(1);
    if (!seedMarker[0]) {
      for (const record of DEFAULT_CLASS_RECORDS.slice(1)) {
        await db
          .update(classes)
          .set({
            name: record.name,
            status: record.status,
            featured: record.featured ? 1 : 0,
            contentJson: JSON.stringify(record.content),
            updatedAt: new Date(),
          })
          .where(eq(classes.slug, record.slug));
      }
      await db
        .insert(siteSettings)
        .values({ key: "catalogue_seed_v2", value: "applied" })
        .onConflictDoNothing({ target: siteSettings.key });
    }

    const mentorImageMarker = await db
      .select({ key: siteSettings.key })
      .from(siteSettings)
      .where(eq(siteSettings.key, "mentor_image_v2"))
      .limit(1);
    if (!mentorImageMarker[0]) {
      const solopreneurRows = await db
        .select()
        .from(classes)
        .where(eq(classes.slug, "kelas-solopreneur"))
        .limit(1);
      if (solopreneurRows[0]) {
        const content = parseContent(solopreneurRows[0].contentJson);
        if (
          content.mentor.imageUrl ===
          "/assets/starhustler-course-creators_4af6efe2.webp"
        ) {
          content.mentor.imageUrl = "/assets/bukan-sekadar-teori.png";
          await db
            .update(classes)
            .set({
              contentJson: JSON.stringify(content),
              updatedAt: new Date(),
            })
            .where(eq(classes.id, solopreneurRows[0].id));
        }
      }
      await db
        .insert(siteSettings)
        .values({ key: "mentor_image_v2", value: "applied" })
        .onConflictDoNothing({ target: siteSettings.key });
    }
  })().catch(error => {
    appSchemaInitialization = null;
    throw error;
  });
  return appSchemaInitialization;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  await ensureClassCmsSchema();
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const now = new Date();
  const values: InsertUser = {
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
    passwordHash: user.passwordHash ?? null,
    lastSignedIn: user.lastSignedIn ?? now,
    updatedAt: now,
  };
  await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({
      target: users.openId,
      set: {
        name: values.name,
        email: values.email,
        loginMethod: values.loginMethod,
        role: values.role,
        passwordHash: values.passwordHash,
        lastSignedIn: values.lastSignedIn,
        updatedAt: now,
      },
    });
}

export async function getUserByOpenId(openId: string) {
  await ensureClassCmsSchema();
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return rows[0];
}

export async function hasAdminUser(): Promise<boolean> {
  await ensureClassCmsSchema();
  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "admin"), isNotNull(users.passwordHash)))
    .limit(1);
  return Boolean(rows[0]);
}

export async function createInitialAdmin(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  await ensureClassCmsSchema();
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (await hasAdminUser()) throw new Error("Admin sudah dikonfigurasi");

  const now = new Date();
  const rows = await db
    .insert(users)
    .values({
      openId: input.email.toLowerCase(),
      name: input.name,
      email: input.email.toLowerCase(),
      loginMethod: "password",
      role: "admin",
      passwordHash: input.passwordHash,
      lastSignedIn: now,
      updatedAt: now,
    })
    .returning();
  if (!rows[0]) throw new Error("Admin tidak dapat dibuat");
  return rows[0];
}

export async function getAdminByEmail(
  email: string
): Promise<User | undefined> {
  await ensureClassCmsSchema();
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase()), eq(users.role, "admin")))
    .limit(1);
  return rows[0];
}

export async function createAdminSession(input: {
  tokenHash: string;
  userId: number;
  expiresAt: Date;
}) {
  await ensureClassCmsSchema();
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  await db.insert(adminSessions).values(input);
}

export async function getUserBySessionHash(tokenHash: string) {
  await ensureClassCmsSchema();
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select({ user: users })
    .from(adminSessions)
    .innerJoin(users, eq(adminSessions.userId, users.id))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        gt(adminSessions.expiresAt, new Date()),
        eq(users.role, "admin")
      )
    )
    .limit(1);
  return rows[0]?.user;
}

export async function deleteAdminSession(tokenHash: string) {
  await ensureClassCmsSchema();
  const db = await getDb();
  if (db)
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.tokenHash, tokenHash));
}

function parseContent(value: string): ClassContent {
  try {
    return normalizeClassContent(JSON.parse(value) as Partial<ClassContent>);
  } catch {
    return normalizeClassContent(null);
  }
}

function toClassRecord(row: typeof classes.$inferSelect): ClassRecord {
  const status: PublishStatus =
    row.status === "published" ? "published" : "draft";
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status,
    featured: Boolean(row.featured),
    content: parseContent(row.contentJson),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function requireClassDb() {
  await ensureClassCmsSchema();
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db;
}

export async function listPublishedClasses(): Promise<ClassRecord[]> {
  const db = await requireClassDb();
  const rows = await db
    .select()
    .from(classes)
    .where(eq(classes.status, "published"))
    .orderBy(desc(classes.featured), desc(classes.updatedAt));
  return rows.map(toClassRecord);
}

export async function getPublishedClassBySlug(slug: string) {
  const row = await getClassBySlug(slug);
  return row?.status === "published" ? row : undefined;
}

export async function getClassBySlug(
  slug: string
): Promise<ClassRecord | undefined> {
  const db = await requireClassDb();
  const rows = await db
    .select()
    .from(classes)
    .where(eq(classes.slug, slug))
    .limit(1);
  return rows[0] ? toClassRecord(rows[0]) : undefined;
}

export async function listAllClasses(): Promise<ClassRecord[]> {
  const db = await requireClassDb();
  const rows = await db.select().from(classes).orderBy(desc(classes.updatedAt));
  return rows.map(toClassRecord);
}

export async function getClassById(
  id: number
): Promise<ClassRecord | undefined> {
  const db = await requireClassDb();
  const rows = await db
    .select()
    .from(classes)
    .where(eq(classes.id, id))
    .limit(1);
  return rows[0] ? toClassRecord(rows[0]) : undefined;
}

export async function createClass(input: {
  name: string;
  slug: string;
  status: PublishStatus;
  featured: boolean;
  content: ClassContent;
}): Promise<ClassRecord> {
  const db = await requireClassDb();
  const values: InsertClass = {
    name: input.name,
    slug: input.slug,
    status: input.status,
    featured: input.featured ? 1 : 0,
    contentJson: JSON.stringify(normalizeClassContent(input.content)),
  };
  const rows = await db
    .insert(classes)
    .values(values)
    .returning({ id: classes.id });
  const created = rows[0] ? await getClassById(rows[0].id) : undefined;
  if (!created) throw new Error("Class was created but could not be loaded");
  return created;
}

export async function updateClass(
  id: number,
  input: {
    name: string;
    slug: string;
    status: PublishStatus;
    featured: boolean;
    content: ClassContent;
  }
): Promise<ClassRecord> {
  const db = await requireClassDb();
  await db
    .update(classes)
    .set({
      name: input.name,
      slug: input.slug,
      status: input.status,
      featured: input.featured ? 1 : 0,
      contentJson: JSON.stringify(normalizeClassContent(input.content)),
      updatedAt: new Date(),
    })
    .where(eq(classes.id, id));
  const updated = await getClassById(id);
  if (!updated) throw new Error("Class not found");
  return updated;
}

export async function updateClassSlug(
  id: number,
  slug: string
): Promise<ClassRecord> {
  const current = await getClassById(id);
  if (!current) throw new Error("Class not found");
  const existing = await getClassBySlug(slug);
  if (existing && existing.id !== id) throw new Error("SLUG_ALREADY_EXISTS");
  try {
    return await updateClass(id, {
      ...current,
      slug,
      content: {
        ...current.content,
        seo: {
          ...current.content.seo,
          canonicalUrl: `https://www.starthustler.com/kelas/${slug}`,
        },
      },
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new Error("SLUG_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function deleteClass(id: number): Promise<void> {
  const db = await requireClassDb();
  await db.delete(classes).where(eq(classes.id, id));
}

export async function getPublicSettings() {
  const db = await requireClassDb();
  const rows = await db.select().from(siteSettings);
  const values = Object.fromEntries(rows.map(row => [row.key, row.value]));
  return {
    paymentProvider: values.payment_provider || "DOKU",
    paymentUrl: values.payment_url || DEFAULT_PAYMENT_URL,
    checkoutMode: values.checkout_mode === "integrated" ? "integrated" : "payment_link",
    metaPixelId: values.meta_pixel_id || "",
    metaEvents: {
      pageView: values.meta_event_page_view !== "false",
      viewContent: values.meta_event_view_content !== "false",
      lead: values.meta_event_lead !== "false",
      initiateCheckout: values.meta_event_initiate_checkout !== "false",
      purchase: values.meta_event_purchase !== "false",
    },
  };
}

export async function getAdminSettings() {
  const db = await requireClassDb();
  const rows = await db.select().from(siteSettings);
  const values = Object.fromEntries(rows.map(row => [row.key, row.value]));
  return {
    paymentProvider: values.payment_provider || "DOKU",
    paymentUrl: values.payment_url || DEFAULT_PAYMENT_URL,
    metaPixelId: values.meta_pixel_id || "",
    metaCapiConfigured: Boolean(values.meta_capi_token),
    metaTestEventCodeConfigured: Boolean(values.meta_test_event_code),
    metaEvents: {
      pageView: values.meta_event_page_view !== "false",
      viewContent: values.meta_event_view_content !== "false",
      lead: values.meta_event_lead !== "false",
      initiateCheckout: values.meta_event_initiate_checkout !== "false",
      purchase: values.meta_event_purchase !== "false",
    },
    metaLastServerEvent: parseMetaLastEvent(values.meta_last_server_event),
  };
}

function parseMetaLastEvent(value?: string) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function getMetaServerSettings() {
  const db = await requireClassDb();
  const rows = await db.select().from(siteSettings);
  const values = Object.fromEntries(rows.map(row => [row.key, row.value]));
  return {
    pixelId: values.meta_pixel_id || "",
    capiToken: values.meta_capi_token || "",
    testEventCode: values.meta_test_event_code || "",
    events: {
      pageView: values.meta_event_page_view !== "false",
      viewContent: values.meta_event_view_content !== "false",
      lead: values.meta_event_lead !== "false",
      initiateCheckout: values.meta_event_initiate_checkout !== "false",
      purchase: values.meta_event_purchase !== "false",
    },
  };
}

export async function updateAdminSettings(input: {
  paymentProvider: string;
  paymentUrl: string;
  metaPixelId: string;
  metaCapiToken?: string;
  clearMetaCapiToken?: boolean;
  metaTestEventCode?: string;
  clearMetaTestEventCode?: boolean;
  metaEvents: {
    pageView: boolean;
    viewContent: boolean;
    lead: boolean;
    initiateCheckout: boolean;
    purchase: boolean;
  };
}) {
  const db = await requireClassDb();
  const values: Record<string, string> = {
    payment_provider: input.paymentProvider,
    payment_url: input.paymentUrl,
    meta_pixel_id: input.metaPixelId,
    meta_event_page_view: String(input.metaEvents.pageView),
    meta_event_view_content: String(input.metaEvents.viewContent),
    meta_event_lead: String(input.metaEvents.lead),
    meta_event_initiate_checkout: String(input.metaEvents.initiateCheckout),
    meta_event_purchase: String(input.metaEvents.purchase),
  };
  if (input.clearMetaCapiToken) values.meta_capi_token = "";
  else if (input.metaCapiToken) values.meta_capi_token = input.metaCapiToken;
  if (input.clearMetaTestEventCode) values.meta_test_event_code = "";
  else if (input.metaTestEventCode)
    values.meta_test_event_code = input.metaTestEventCode;
  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      db
        .insert(siteSettings)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: new Date() },
        })
    )
  );
  return getAdminSettings();
}

export async function setMetaLastServerEvent(value: {
  eventName: string;
  eventId: string;
  sentAt: string;
  status: "sent" | "failed" | "skipped";
}) {
  const db = await requireClassDb();
  await db
    .insert(siteSettings)
    .values({
      key: "meta_last_server_event",
      value: JSON.stringify(value),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: JSON.stringify(value), updatedAt: new Date() },
    });
}

export type BlogPostInput = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  content: string;
  status: PublishStatus;
};

const toBlogPost = (row: typeof blogPosts.$inferSelect) => ({
  ...row,
  status:
    row.status === "published" ? ("published" as const) : ("draft" as const),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  publishedAt: row.publishedAt?.toISOString() || null,
});

export async function listPublishedBlogPosts() {
  const db = await requireClassDb();
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.updatedAt));
  return rows.map(toBlogPost);
}

export async function getPublishedBlogPost(slug: string) {
  const db = await requireClassDb();
  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);
  return rows[0] ? toBlogPost(rows[0]) : undefined;
}

export async function listAllBlogPosts() {
  const db = await requireClassDb();
  return (
    await db.select().from(blogPosts).orderBy(desc(blogPosts.updatedAt))
  ).map(toBlogPost);
}

export async function getBlogPostById(id: number) {
  const db = await requireClassDb();
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return rows[0] ? toBlogPost(rows[0]) : undefined;
}

export async function saveBlogPost(id: number | null, input: BlogPostInput) {
  const db = await requireClassDb();
  const values = {
    ...input,
    updatedAt: new Date(),
    publishedAt: input.status === "published" ? new Date() : null,
  };
  if (id) {
    await db.update(blogPosts).set(values).where(eq(blogPosts.id, id));
    return getBlogPostById(id);
  }
  const rows = await db
    .insert(blogPosts)
    .values(values)
    .returning({ id: blogPosts.id });
  return rows[0] ? getBlogPostById(rows[0].id) : undefined;
}

async function settingsMap() {
  const db = await requireClassDb();
  const rows = await db.select().from(siteSettings);
  return Object.fromEntries(rows.map(row => [row.key, row.value]));
}

export async function getCommerceSettings() {
  const values = await settingsMap();
  const environment =
    (process.env.DOKU_ENVIRONMENT || values.doku_environment) === "production"
      ? ("production" as const)
      : ("sandbox" as const);
  return {
    checkoutMode: values.checkout_mode === "integrated" ? "integrated" : "payment_link",
    doku: {
      environment,
      clientId: process.env.DOKU_CLIENT_ID || decryptSecret(values.doku_client_id),
      secretKey: process.env.DOKU_SECRET_KEY || decryptSecret(values.doku_secret_key),
      paymentDueMinutes: Math.min(1440, Math.max(15, Number(values.doku_payment_due_minutes) || 60)),
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY || decryptSecret(values.resend_api_key),
      fromName: values.resend_from_name || "Kelas StartHustler",
      fromEmail: values.resend_from_email || "kelas@mail.starthustler.com",
      replyTo: values.resend_reply_to || "",
    },
  };
}

export async function getCommerceAdminSettings() {
  const settings = await getCommerceSettings();
  return {
    checkoutMode: settings.checkoutMode,
    dokuEnvironment: settings.doku.environment,
    dokuClientIdConfigured: Boolean(settings.doku.clientId),
    dokuSecretKeyConfigured: Boolean(settings.doku.secretKey),
    dokuPaymentDueMinutes: settings.doku.paymentDueMinutes,
    resendApiKeyConfigured: Boolean(settings.resend.apiKey),
    resendFromName: settings.resend.fromName,
    resendFromEmail: settings.resend.fromEmail,
    resendReplyTo: settings.resend.replyTo,
  };
}

export async function updateCommerceSettings(input: {
  checkoutMode: "payment_link" | "integrated";
  dokuEnvironment: "sandbox" | "production";
  dokuClientId?: string;
  dokuSecretKey?: string;
  clearDokuClientId?: boolean;
  clearDokuSecretKey?: boolean;
  dokuPaymentDueMinutes: number;
  resendApiKey?: string;
  clearResendApiKey?: boolean;
  resendFromName: string;
  resendFromEmail: string;
  resendReplyTo: string;
}) {
  const db = await requireClassDb();
  const values: Record<string, string> = {
    checkout_mode: input.checkoutMode,
    doku_environment: input.dokuEnvironment,
    doku_payment_due_minutes: String(input.dokuPaymentDueMinutes),
    resend_from_name: input.resendFromName,
    resend_from_email: input.resendFromEmail,
    resend_reply_to: input.resendReplyTo,
  };
  if (input.clearDokuClientId) values.doku_client_id = "";
  else if (input.dokuClientId) values.doku_client_id = encryptSecret(input.dokuClientId);
  if (input.clearDokuSecretKey) values.doku_secret_key = "";
  else if (input.dokuSecretKey) values.doku_secret_key = encryptSecret(input.dokuSecretKey);
  if (input.clearResendApiKey) values.resend_api_key = "";
  else if (input.resendApiKey) values.resend_api_key = encryptSecret(input.resendApiKey);
  await Promise.all(Object.entries(values).map(([key, value]) =>
    db.insert(siteSettings).values({ key, value, updatedAt: new Date() }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    })
  ));
  return getCommerceAdminSettings();
}

export async function upsertStudent(input: { name: string; email: string; phone: string }) {
  const db = await requireClassDb();
  const email = input.email.trim().toLowerCase();
  const rows = await db.insert(students).values({ ...input, email }).onConflictDoUpdate({
    target: students.email,
    set: { name: input.name, phone: input.phone, updatedAt: new Date() },
  }).returning();
  return rows[0];
}

export async function createClassOrder(input: {
  classId: number;
  studentId: number;
  amount: number;
}) {
  const db = await requireClassDb();
  const publicId = crypto.randomUUID();
  // Some DOKU Checkout channels reject symbols in invoice numbers. Keep the
  // identifier short and strictly alphanumeric so one invoice works across
  // every payment method enabled on the merchant account.
  const invoiceNumber = `SH${Date.now().toString(36).toUpperCase()}${randomBytes(3).toString("hex").toUpperCase()}`;
  const rows = await db.insert(classOrders).values({
    publicId,
    invoiceNumber,
    classId: input.classId,
    studentId: input.studentId,
    amount: input.amount,
  }).returning();
  return rows[0];
}

export async function setOrderCheckout(orderId: number, input: {
  paymentUrl: string;
  paymentToken: string;
  expiresAt: Date;
}) {
  const db = await requireClassDb();
  await db.update(classOrders).set({ ...input, updatedAt: new Date() }).where(eq(classOrders.id, orderId));
}

export async function recordPaymentActivity(input: {
  orderId?: number;
  invoiceNumber?: string;
  provider?: string;
  environment?: string;
  eventType: string;
  status: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  httpStatus?: number;
  providerCode?: string;
  requestId?: string;
}) {
  const db = await requireClassDb();
  await db.insert(paymentActivityLogs).values({
    ...input,
    provider: input.provider || "DOKU",
  });
}

export async function listPaymentActivityForAdmin(limit = 100) {
  const db = await requireClassDb();
  return db.select().from(paymentActivityLogs)
    .orderBy(desc(paymentActivityLogs.createdAt))
    .limit(Math.min(250, Math.max(1, limit)));
}

export async function getOrderDetailsByPublicId(publicId: string) {
  const db = await requireClassDb();
  const rows = await db.select({ order: classOrders, student: students, classRow: classes })
    .from(classOrders)
    .innerJoin(students, eq(classOrders.studentId, students.id))
    .innerJoin(classes, eq(classOrders.classId, classes.id))
    .where(eq(classOrders.publicId, publicId)).limit(1);
  return rows[0];
}

export async function getOrderDetailsByInvoice(invoiceNumber: string) {
  const db = await requireClassDb();
  const rows = await db.select({ order: classOrders, student: students, classRow: classes })
    .from(classOrders)
    .innerJoin(students, eq(classOrders.studentId, students.id))
    .innerJoin(classes, eq(classOrders.classId, classes.id))
    .where(eq(classOrders.invoiceNumber, invoiceNumber)).limit(1);
  return rows[0];
}

export async function listPendingOrdersForReconciliation(limit = 5) {
  const db = await requireClassDb();
  return db.select({ order: classOrders, student: students, classRow: classes })
    .from(classOrders)
    .innerJoin(students, eq(classOrders.studentId, students.id))
    .innerJoin(classes, eq(classOrders.classId, classes.id))
    .where(and(
      eq(classOrders.status, "pending_payment"),
      isNotNull(classOrders.paymentUrl),
      lt(classOrders.createdAt, new Date(Date.now() - 60_000)),
    ))
    .orderBy(desc(classOrders.createdAt))
    .limit(Math.min(10, Math.max(1, limit)));
}

export async function recordPaymentAndActivate(input: {
  eventKey: string;
  invoiceNumber: string;
  status: string;
  payload: string;
}) {
  const db = await requireClassDb();
  const detail = await getOrderDetailsByInvoice(input.invoiceNumber);
  if (!detail) return { kind: "unknown_order" as const };
  const success = ["SUCCESS", "COMPLETED", "PAID"].includes(input.status.toUpperCase());
  return db.transaction(async tx => {
    const inserted = await tx.insert(paymentEvents).values({
      eventKey: input.eventKey,
      orderId: detail.order.id,
      status: input.status,
      payload: input.payload,
    }).onConflictDoNothing({ target: paymentEvents.eventKey }).returning({ id: paymentEvents.id });
    if (!inserted.length) return { kind: "duplicate" as const, detail };
    // DOKU Checkout may emit FAILED while a buyer changes payment method. Only
    // a provider-confirmed success is terminal for enrollment activation.
    if (!success) return { kind: "updated" as const, detail };
    const transitioned = await tx.update(classOrders)
      .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
      .where(and(eq(classOrders.id, detail.order.id), ne(classOrders.status, "paid")))
      .returning({ id: classOrders.id });
    if (!transitioned.length) return { kind: "already_paid" as const, detail };
    await tx.insert(classEnrollments).values({
      classId: detail.order.classId,
      studentId: detail.order.studentId,
      orderId: detail.order.id,
      status: "active",
    }).onConflictDoUpdate({
      target: [classEnrollments.studentId, classEnrollments.classId],
      set: { orderId: detail.order.id, status: "active", updatedAt: new Date() },
    });
    const setupToken = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(setupToken).digest("hex");
    await tx.insert(passwordSetupTokens).values({
      tokenHash,
      studentId: detail.order.studentId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return { kind: "paid" as const, detail, setupToken };
  });
}

export async function getValidPasswordSetupToken(token: string) {
  const db = await requireClassDb();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const rows = await db.select({ token: passwordSetupTokens, student: students })
    .from(passwordSetupTokens)
    .innerJoin(students, eq(passwordSetupTokens.studentId, students.id))
    .where(and(
      eq(passwordSetupTokens.tokenHash, tokenHash),
      gt(passwordSetupTokens.expiresAt, new Date()),
      isNull(passwordSetupTokens.usedAt)
    )).limit(1);
  return rows[0];
}

export async function createPasswordSetupToken(studentId: number) {
  const db = await requireClassDb();
  const token = randomBytes(32).toString("base64url");
  await db.insert(passwordSetupTokens).values({
    tokenHash: createHash("sha256").update(token).digest("hex"),
    studentId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  return token;
}

export async function activateStudentPassword(token: string, passwordHash: string) {
  const db = await requireClassDb();
  const record = await getValidPasswordSetupToken(token);
  if (!record) return undefined;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await db.transaction(async tx => {
    await tx.update(students).set({ passwordHash, updatedAt: new Date() }).where(eq(students.id, record.student.id));
    await tx.update(passwordSetupTokens).set({ usedAt: new Date() }).where(eq(passwordSetupTokens.tokenHash, tokenHash));
  });
  return record.student;
}

export async function getStudentByEmail(email: string) {
  const db = await requireClassDb();
  const rows = await db.select().from(students).where(eq(students.email, email.trim().toLowerCase())).limit(1);
  return rows[0];
}

export async function createStudentSession(input: { tokenHash: string; studentId: number; expiresAt: Date }) {
  const db = await requireClassDb();
  await db.delete(studentSessions).where(lt(studentSessions.expiresAt, new Date()));
  await db.insert(studentSessions).values(input);
}

export async function getStudentBySessionHash(tokenHash: string) {
  const db = await requireClassDb();
  const rows = await db.select({ student: students }).from(studentSessions)
    .innerJoin(students, eq(studentSessions.studentId, students.id))
    .where(and(eq(studentSessions.tokenHash, tokenHash), gt(studentSessions.expiresAt, new Date()))).limit(1);
  return rows[0]?.student;
}

export async function deleteStudentSession(tokenHash: string) {
  const db = await requireClassDb();
  await db.delete(studentSessions).where(eq(studentSessions.tokenHash, tokenHash));
}

export async function listStudentEnrollments(studentId: number) {
  const db = await requireClassDb();
  const rows = await db.select({ enrollment: classEnrollments, classRow: classes })
    .from(classEnrollments)
    .innerJoin(classes, eq(classEnrollments.classId, classes.id))
    .where(and(eq(classEnrollments.studentId, studentId), eq(classEnrollments.status, "active")))
    .orderBy(desc(classEnrollments.createdAt));
  return rows.map(row => ({
    id: row.enrollment.id,
    classId: row.classRow.id,
    className: row.classRow.name,
    slug: row.classRow.slug,
    content: parseContent(row.classRow.contentJson),
  }));
}

export async function upsertEmailDelivery(input: {
  orderId: number;
  kind: string;
  recipient: string;
  status: string;
  providerMessageId?: string;
  lastError?: string;
}) {
  const db = await requireClassDb();
  const values = {
    ...input,
    attempts: 1,
    sentAt: input.status === "sent" ? new Date() : null,
    updatedAt: new Date(),
  };
  await db.insert(emailDeliveries).values(values).onConflictDoUpdate({
    target: [emailDeliveries.orderId, emailDeliveries.kind],
    set: {
      status: input.status,
      providerMessageId: input.providerMessageId || null,
      lastError: input.lastError || null,
      attempts: sql`${emailDeliveries.attempts} + 1`,
      sentAt: input.status === "sent" ? new Date() : null,
      updatedAt: new Date(),
    },
  });
}

export async function listOrdersForAdmin(page = 1, pageSize = 25) {
  const db = await requireClassDb();
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(25, Math.max(1, pageSize));
  const rows = await db.select({
    order: classOrders,
    student: students,
    classRow: classes,
    email: emailDeliveries,
  })
    .from(classOrders)
    .innerJoin(students, eq(classOrders.studentId, students.id))
    .innerJoin(classes, eq(classOrders.classId, classes.id))
    .leftJoin(emailDeliveries, and(
      eq(emailDeliveries.orderId, classOrders.id),
      eq(emailDeliveries.kind, "enrollment_confirmation"),
    ))
    .orderBy(desc(classOrders.createdAt))
    .limit(safePageSize)
    .offset((safePage - 1) * safePageSize);
  const [totalRows, paidRows, pendingRows, failedRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(classOrders),
    db.select({ count: sql<number>`count(*)::int` }).from(classOrders).where(eq(classOrders.status, "paid")),
    db.select({ count: sql<number>`count(*)::int` }).from(classOrders).where(eq(classOrders.status, "pending_payment")),
    db.select({ count: sql<number>`count(*)::int` }).from(classOrders).where(sql`${classOrders.status} in ('failed', 'expired')`),
  ]);
  const total = totalRows[0]?.count || 0;
  return {
    items: rows.map(({ order, student, classRow, email }) => ({
      ...order,
      student: { name: student.name, email: student.email, phone: student.phone },
      className: classRow.name,
      emailDelivery: email ? {
        status: email.status,
        attempts: email.attempts,
        sentAt: email.sentAt,
        lastError: email.lastError,
        updatedAt: email.updatedAt,
      } : null,
    })),
    summary: {
      paid: paidRows[0]?.count || 0,
      pending: pendingRows[0]?.count || 0,
      failed: failedRows[0]?.count || 0,
    },
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    },
  };
}

export async function listOrdersForExport() {
  const db = await requireClassDb();
  const rows = await db.select({
    order: classOrders,
    student: students,
    classRow: classes,
  })
    .from(classOrders)
    .innerJoin(students, eq(classOrders.studentId, students.id))
    .innerJoin(classes, eq(classOrders.classId, classes.id))
    .orderBy(desc(classOrders.createdAt));

  return rows.map(({ order, student, classRow }) => ({
    orderId: order.invoiceNumber,
    name: student.name,
    email: student.email,
    phone: student.phone,
    className: classRow.name,
    amount: order.amount,
    paymentStatus: order.status,
    paymentMethod: "",
    createdAt: order.createdAt,
    paidAt: order.paidAt,
  }));
}
