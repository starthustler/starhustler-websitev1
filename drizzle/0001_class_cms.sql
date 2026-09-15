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
);

CREATE TABLE IF NOT EXISTS "admin_sessions" (
  "tokenHash" varchar(64) PRIMARY KEY,
  "userId" integer NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "expiresAt" timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS "admin_sessions_user_idx" ON "admin_sessions" ("userId");
CREATE INDEX IF NOT EXISTS "admin_sessions_expiry_idx" ON "admin_sessions" ("expiresAt");

CREATE TABLE IF NOT EXISTS "classes" (
  "id" serial PRIMARY KEY,
  "name" varchar(180) NOT NULL,
  "slug" varchar(180) NOT NULL UNIQUE,
  "status" varchar(16) NOT NULL DEFAULT 'draft',
  "featured" integer NOT NULL DEFAULT 0,
  "contentJson" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
