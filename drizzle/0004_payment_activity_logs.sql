CREATE TABLE IF NOT EXISTS "payment_activity_logs" (
  "id" serial PRIMARY KEY,
  "orderId" integer,
  "invoiceNumber" varchar(64),
  "provider" varchar(32) NOT NULL DEFAULT 'DOKU',
  "environment" varchar(16),
  "eventType" varchar(40) NOT NULL,
  "status" varchar(16) NOT NULL,
  "title" varchar(180) NOT NULL,
  "message" text NOT NULL,
  "httpStatus" integer,
  "providerCode" varchar(80),
  "requestId" varchar(128),
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "payment_activity_logs_created_idx"
  ON "payment_activity_logs" ("createdAt");
