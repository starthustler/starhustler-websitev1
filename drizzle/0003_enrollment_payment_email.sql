CREATE TABLE IF NOT EXISTS "students" (
  "id" serial PRIMARY KEY,
  "name" varchar(160) NOT NULL,
  "email" varchar(320) NOT NULL UNIQUE,
  "phone" varchar(32) NOT NULL,
  "passwordHash" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "class_orders" (
  "id" serial PRIMARY KEY,
  "publicId" varchar(36) NOT NULL UNIQUE,
  "invoiceNumber" varchar(64) NOT NULL UNIQUE,
  "classId" integer NOT NULL,
  "studentId" integer NOT NULL,
  "amount" integer NOT NULL,
  "currency" varchar(3) NOT NULL DEFAULT 'IDR',
  "status" varchar(24) NOT NULL DEFAULT 'pending_payment',
  "paymentUrl" text,
  "paymentToken" text,
  "expiresAt" timestamptz,
  "paidAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "class_orders_student_idx" ON "class_orders" ("studentId");
CREATE INDEX IF NOT EXISTS "class_orders_class_idx" ON "class_orders" ("classId");
CREATE INDEX IF NOT EXISTS "class_orders_status_idx" ON "class_orders" ("status");

CREATE TABLE IF NOT EXISTS "class_enrollments" (
  "id" serial PRIMARY KEY,
  "classId" integer NOT NULL,
  "studentId" integer NOT NULL,
  "orderId" integer NOT NULL,
  "status" varchar(24) NOT NULL DEFAULT 'active',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "class_enrollments_student_class_idx"
  ON "class_enrollments" ("studentId", "classId");

CREATE TABLE IF NOT EXISTS "payment_events" (
  "id" serial PRIMARY KEY,
  "eventKey" varchar(128) NOT NULL UNIQUE,
  "orderId" integer,
  "status" varchar(32) NOT NULL,
  "payload" text NOT NULL,
  "receivedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "password_setup_tokens" (
  "tokenHash" varchar(64) PRIMARY KEY,
  "studentId" integer NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "expiresAt" timestamptz NOT NULL,
  "usedAt" timestamptz
);

CREATE TABLE IF NOT EXISTS "student_sessions" (
  "tokenHash" varchar(64) PRIMARY KEY,
  "studentId" integer NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "expiresAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_deliveries" (
  "id" serial PRIMARY KEY,
  "orderId" integer NOT NULL,
  "kind" varchar(32) NOT NULL,
  "recipient" varchar(320) NOT NULL,
  "status" varchar(24) NOT NULL DEFAULT 'pending',
  "providerMessageId" varchar(160),
  "lastError" text,
  "attempts" integer NOT NULL DEFAULT 0,
  "sentAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "email_deliveries_order_kind_idx"
  ON "email_deliveries" ("orderId", "kind");

INSERT INTO "site_settings" ("key", "value") VALUES
  ('checkout_mode', 'payment_link'),
  ('doku_environment', 'sandbox'),
  ('doku_client_id', ''),
  ('doku_secret_key', ''),
  ('doku_payment_due_minutes', '60'),
  ('resend_api_key', ''),
  ('resend_from_name', 'Kelas StartHustler'),
  ('resend_from_email', 'kelas@mail.starthustler.com'),
  ('resend_reply_to', '')
ON CONFLICT ("key") DO NOTHING;
