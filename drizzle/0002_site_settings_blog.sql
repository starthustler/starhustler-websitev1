CREATE TABLE IF NOT EXISTS "site_settings" (
  "key" varchar(120) PRIMARY KEY,
  "value" text NOT NULL,
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

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
);

INSERT INTO "site_settings" ("key", "value") VALUES
  ('payment_provider', 'DOKU'),
  ('payment_url', 'https://pay.doku.com/p-link/p/JFB442avKB'),
  ('meta_pixel_id', ''),
  ('meta_capi_token', '')
ON CONFLICT ("key") DO NOTHING;
