import { and, desc, eq, gt, isNotNull, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  adminSessions,
  classes,
  type InsertClass,
  type InsertUser,
  type User,
  users,
} from "../drizzle/schema.js";
import {
  DEFAULT_CLASS_RECORD,
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
      .values({
        name: DEFAULT_CLASS_RECORD.name,
        slug: DEFAULT_CLASS_RECORD.slug,
        status: DEFAULT_CLASS_RECORD.status,
        featured: 1,
        contentJson: JSON.stringify(DEFAULT_CLASS_RECORD.content),
      })
      .onConflictDoNothing({ target: classes.slug });
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
