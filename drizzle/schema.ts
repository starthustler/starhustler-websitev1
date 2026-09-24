import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/** Users stay provider-neutral so local admin auth can coexist with OAuth. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 320 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  passwordHash: text("passwordHash"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const adminSessions = pgTable("admin_sessions", {
  tokenHash: varchar("tokenHash", { length: 64 }).primaryKey(),
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  status: varchar("status", { length: 16 }).default("draft").notNull(),
  featured: integer("featured").default(0).notNull(),
  contentJson: text("contentJson").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ClassRow = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  category: varchar("category", { length: 100 }).default("Catatan").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("imageUrl").default("").notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 16 }).default("draft").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  publishedAt: timestamp("publishedAt", { withTimezone: true }),
});

export type SiteSettingRow = typeof siteSettings.$inferSelect;
export type BlogPostRow = typeof blogPosts.$inferSelect;

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 32 }).notNull(),
  passwordHash: text("passwordHash"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const classOrders = pgTable(
  "class_orders",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("publicId", { length: 36 }).notNull().unique(),
    invoiceNumber: varchar("invoiceNumber", { length: 64 }).notNull().unique(),
    classId: integer("classId").notNull(),
    studentId: integer("studentId").notNull(),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).default("IDR").notNull(),
    status: varchar("status", { length: 24 }).default("pending_payment").notNull(),
    paymentUrl: text("paymentUrl"),
    paymentToken: text("paymentToken"),
    expiresAt: timestamp("expiresAt", { withTimezone: true }),
    paidAt: timestamp("paidAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index("class_orders_student_idx").on(table.studentId),
    index("class_orders_class_idx").on(table.classId),
    index("class_orders_status_idx").on(table.status),
  ]
);

export const classEnrollments = pgTable(
  "class_enrollments",
  {
    id: serial("id").primaryKey(),
    classId: integer("classId").notNull(),
    studentId: integer("studentId").notNull(),
    orderId: integer("orderId").notNull(),
    status: varchar("status", { length: 24 }).default("active").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [uniqueIndex("class_enrollments_student_class_idx").on(table.studentId, table.classId)]
);

export const paymentEvents = pgTable("payment_events", {
  id: serial("id").primaryKey(),
  eventKey: varchar("eventKey", { length: 128 }).notNull().unique(),
  orderId: integer("orderId"),
  status: varchar("status", { length: 32 }).notNull(),
  payload: text("payload").notNull(),
  receivedAt: timestamp("receivedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentActivityLogs = pgTable(
  "payment_activity_logs",
  {
    id: serial("id").primaryKey(),
    orderId: integer("orderId"),
    invoiceNumber: varchar("invoiceNumber", { length: 64 }),
    provider: varchar("provider", { length: 32 }).default("DOKU").notNull(),
    environment: varchar("environment", { length: 16 }),
    eventType: varchar("eventType", { length: 40 }).notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    message: text("message").notNull(),
    httpStatus: integer("httpStatus"),
    providerCode: varchar("providerCode", { length: 80 }),
    requestId: varchar("requestId", { length: 128 }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index("payment_activity_logs_created_idx").on(table.createdAt)]
);

export const passwordSetupTokens = pgTable("password_setup_tokens", {
  tokenHash: varchar("tokenHash", { length: 64 }).primaryKey(),
  studentId: integer("studentId").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  usedAt: timestamp("usedAt", { withTimezone: true }),
});

export const studentSessions = pgTable("student_sessions", {
  tokenHash: varchar("tokenHash", { length: 64 }).primaryKey(),
  studentId: integer("studentId").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
});

export const emailDeliveries = pgTable(
  "email_deliveries",
  {
    id: serial("id").primaryKey(),
    orderId: integer("orderId").notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    recipient: varchar("recipient", { length: 320 }).notNull(),
    status: varchar("status", { length: 24 }).default("pending").notNull(),
    providerMessageId: varchar("providerMessageId", { length: 160 }),
    lastError: text("lastError"),
    attempts: integer("attempts").default(0).notNull(),
    sentAt: timestamp("sentAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [uniqueIndex("email_deliveries_order_kind_idx").on(table.orderId, table.kind)]
);
