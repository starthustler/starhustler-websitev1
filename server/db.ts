import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { classes, InsertClass, InsertUser, users } from "../drizzle/schema";
import {
  DEFAULT_CLASS_RECORD,
  normalizeClassContent,
  type ClassContent,
  type ClassRecord,
  type PublishStatus,
} from "../shared/classContent";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

let classCmsInitialization: Promise<void> | null = null;

export async function ensureClassCmsSchema(): Promise<void> {
  if (classCmsInitialization) return classCmsInitialization;
  classCmsInitialization = (async () => {
    const db = await getDb();
    if (!db) throw new Error("DATABASE_URL is not configured");

    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS \`classes\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(180) NOT NULL,
        \`slug\` varchar(180) NOT NULL,
        \`status\` enum('draft','published') NOT NULL DEFAULT 'draft',
        \`featured\` int NOT NULL DEFAULT 0,
        \`contentJson\` longtext NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`classes_slug_unique\` (\`slug\`)
      )
    `)
    );

    await db
      .insert(classes)
      .ignore()
      .values({
        name: DEFAULT_CLASS_RECORD.name,
        slug: DEFAULT_CLASS_RECORD.slug,
        status: DEFAULT_CLASS_RECORD.status,
        featured: 1,
        contentJson: JSON.stringify(DEFAULT_CLASS_RECORD.content),
      });
  })().catch(error => {
    classCmsInitialization = null;
    throw error;
  });
  return classCmsInitialization;
}

function parseContent(value: string): ClassContent {
  try {
    return normalizeClassContent(JSON.parse(value) as Partial<ClassContent>);
  } catch {
    return normalizeClassContent(null);
  }
}

function toClassRecord(row: typeof classes.$inferSelect): ClassRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
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

export async function getPublishedClassBySlug(
  slug: string
): Promise<ClassRecord | undefined> {
  const db = await requireClassDb();
  const rows = await db
    .select()
    .from(classes)
    .where(eq(classes.slug, slug))
    .limit(1);
  const row = rows[0];
  return row?.status === "published" ? toClassRecord(row) : undefined;
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
  const result = await db.insert(classes).values(values);
  const id = Number(result[0].insertId);
  const created = await getClassById(id);
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
