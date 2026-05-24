-- ══════════════════════════════════════════════
-- SyntaxPress Admin Dashboard — Initial Schema
-- ══════════════════════════════════════════════
-- Run this in your Supabase SQL Editor or via CLI:
--   supabase db push
--
-- All tables have Row Level Security ENABLED from the start.
-- Only authenticated admin users can read/write.

-- ──────────────────────────────────────────────
-- Custom enum types
-- ──────────────────────────────────────────────

CREATE TYPE admin_role AS ENUM ('owner', 'editor', 'viewer');
CREATE TYPE design_status AS ENUM ('draft', 'staged', 'published', 'archived');
CREATE TYPE listing_status AS ENUM ('draft', 'ready', 'published', 'failed');
CREATE TYPE platform AS ENUM ('shopify', 'etsy', 'redbubble', 'teepublic', 'society6', 'zazzle');

-- ──────────────────────────────────────────────
-- Admin Users
-- ──────────────────────────────────────────────
-- Tracks which auth users have admin access.
-- The auth.users table is managed by Supabase Auth;
-- this table extends it with role information.

CREATE TABLE admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL UNIQUE,
  role       admin_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can see admin_users rows
CREATE POLICY "admin_users_select"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

-- Only the owner can modify admin_users
CREATE POLICY "admin_users_insert"
  ON admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
    )
    OR NOT EXISTS (SELECT 1 FROM admin_users) -- Allow first user (bootstrap)
  );

CREATE POLICY "admin_users_update"
  ON admin_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ──────────────────────────────────────────────
-- Designs
-- ──────────────────────────────────────────────
-- Core entity: a single design that gets distributed
-- across platforms. One design → many exports → many listings.

CREATE TABLE designs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  collection       TEXT,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  target_who       TEXT[] NOT NULL DEFAULT '{}',
  target_what      TEXT[] NOT NULL DEFAULT '{}',
  target_when      TEXT[] NOT NULL DEFAULT '{}',
  status           design_status NOT NULL DEFAULT 'draft',
  source_file_path TEXT,
  created_by       UUID NOT NULL REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_designs_status ON designs(status);
CREATE INDEX idx_designs_collection ON designs(collection);
CREATE INDEX idx_designs_slug ON designs(slug);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- Admins can read all designs
CREATE POLICY "designs_select"
  ON designs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Owners and editors can insert
CREATE POLICY "designs_insert"
  ON designs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Owners and editors can update
CREATE POLICY "designs_update"
  ON designs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Only owners can delete
CREATE POLICY "designs_delete"
  ON designs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ──────────────────────────────────────────────
-- Design Exports
-- ──────────────────────────────────────────────
-- Platform-specific image exports for each design.
-- Each row = one sized/formatted file for one platform.

CREATE TABLE design_exports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id  UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  platform   platform NOT NULL,
  file_path  TEXT NOT NULL,
  width      INT NOT NULL,
  height     INT NOT NULL,
  format     TEXT NOT NULL DEFAULT 'png',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(design_id, platform, width, height)
);

CREATE INDEX idx_exports_design ON design_exports(design_id);

ALTER TABLE design_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exports_select"
  ON design_exports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "exports_insert"
  ON design_exports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "exports_update"
  ON design_exports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "exports_delete"
  ON design_exports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ──────────────────────────────────────────────
-- Platform Listings
-- ──────────────────────────────────────────────
-- Tracks the listing state for each design on each platform.
-- Stores generated copy (title, description, tags) per platform.

CREATE TABLE platform_listings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id    UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  platform     platform NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  status       listing_status NOT NULL DEFAULT 'draft',
  external_id  TEXT,
  external_url TEXT,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(design_id, platform)
);

CREATE INDEX idx_listings_design ON platform_listings(design_id);
CREATE INDEX idx_listings_platform_status ON platform_listings(platform, status);

ALTER TABLE platform_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_select"
  ON platform_listings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "listings_insert"
  ON platform_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "listings_update"
  ON platform_listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "listings_delete"
  ON platform_listings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ──────────────────────────────────────────────
-- Storage Buckets
-- ──────────────────────────────────────────────
-- Run these in the Supabase dashboard under Storage,
-- or via the storage API. Included here for documentation.
--
-- Bucket: design-assets (private — admin-only access)
--   Stores source files, exports, mockups.
--   RLS: only authenticated admin users can read/write.

INSERT INTO storage.buckets (id, name, public)
VALUES ('design-assets', 'design-assets', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "design_assets_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'design-assets'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "design_assets_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'design-assets'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "design_assets_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'design-assets'
    AND EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ──────────────────────────────────────────────
-- Updated-at trigger (reusable)
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON platform_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
