import { and, desc, eq, gt, isNotNull, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  adminSessions,
  blogPosts,
  classes,
  type InsertClass,
  type InsertUser,
  type User,
  siteSettings,
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
