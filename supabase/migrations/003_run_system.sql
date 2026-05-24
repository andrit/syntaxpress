-- ══════════════════════════════════════════════
-- SyntaxPress — Run System & Staging Pipeline
-- ══════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Runs — production batch containers
-- ──────────────────────────────────────────────

CREATE TYPE run_status AS ENUM ('planning', 'in_progress', 'completed', 'archived');

CREATE TABLE runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  status           run_status NOT NULL DEFAULT 'planning',
  target_platforms platform[] NOT NULL DEFAULT '{}',
  design_count     INT NOT NULL DEFAULT 0,
  created_by       UUID NOT NULL REFERENCES auth.users(id),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_runs_status ON runs(status);

ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runs_select" ON runs FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "runs_insert" ON runs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'editor')
  ));
CREATE POLICY "runs_update" ON runs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'editor')
  ));
CREATE POLICY "runs_delete" ON runs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
  ));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- Run Designs — design participation in a run
-- ──────────────────────────────────────────────

CREATE TABLE run_designs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  design_id       UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  sort_order      INT NOT NULL DEFAULT 0,
  current_step    INT NOT NULL DEFAULT 1
                    CHECK (current_step BETWEEN 1 AND 5),
  step_status     JSONB NOT NULL DEFAULT '{"1":"pending","2":"pending","3":"pending","4":"pending","5":"pending"}',
  platform_status JSONB NOT NULL DEFAULT '{}',
  notes           TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(run_id, design_id)
);

CREATE INDEX idx_run_designs_run ON run_designs(run_id);
CREATE INDEX idx_run_designs_design ON run_designs(design_id);

ALTER TABLE run_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "run_designs_select" ON run_designs FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "run_designs_insert" ON run_designs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'editor')
  ));
CREATE POLICY "run_designs_update" ON run_designs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'editor')
  ));
CREATE POLICY "run_designs_delete" ON run_designs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
  ));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON run_designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- Listing Templates — reusable copy generators
-- ──────────────────────────────────────────────

CREATE TABLE listing_templates (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  platform              platform NOT NULL,
  product_type          TEXT,
  collection            TEXT,
  is_default            BOOLEAN NOT NULL DEFAULT false,
  title_template        TEXT NOT NULL,
  description_template  TEXT NOT NULL,
  tag_template          TEXT NOT NULL,
  created_by            UUID NOT NULL REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(name, platform)
);

ALTER TABLE listing_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select" ON listing_templates FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "templates_insert" ON listing_templates FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'editor')
  ));
CREATE POLICY "templates_update" ON listing_templates FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'editor')
  ));
CREATE POLICY "templates_delete" ON listing_templates FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
  ));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON listing_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- Export Specs — platform-specific image sizes
-- ──────────────────────────────────────────────

CREATE TABLE export_specs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform     platform NOT NULL,
  product_type TEXT NOT NULL,
  width        INT NOT NULL,
  height       INT NOT NULL,
  format       TEXT NOT NULL DEFAULT 'png',
  label        TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(platform, product_type)
);

ALTER TABLE export_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "specs_select" ON export_specs FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "specs_insert" ON export_specs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'editor')
  ));
CREATE POLICY "specs_update" ON export_specs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'editor')
  ));

-- ──────────────────────────────────────────────
-- Seed default export specs
-- ──────────────────────────────────────────────

INSERT INTO export_specs (platform, product_type, width, height, format, label) VALUES
  ('shopify', 'apparel',   4500, 5400, 'png', 'Apparel (4500×5400)'),
  ('shopify', 'mug',       4500, 1890, 'png', 'Mug wrap (4500×1890)'),
  ('shopify', 'sticker',   3000, 3000, 'png', 'Sticker (3000×3000)'),
  ('shopify', 'wall-art',  6000, 6000, 'png', 'Wall art (6000×6000)'),
  ('etsy',    'listing',   2700, 2025, 'jpg', 'Listing image (2700×2025)'),
  ('etsy',    'apparel',   4500, 5400, 'png', 'Apparel (4500×5400)'),
  ('redbubble','default',  4500, 5400, 'png', 'Default (4500×5400)'),
  ('teepublic','default',  4500, 5400, 'png', 'Default (4500×5400)'),
  ('society6', 'art-print',6500, 6500, 'png', 'Art print (6500×6500)'),
  ('society6', 'apparel',  3300, 5100, 'png', 'Apparel (3300×5100)')
ON CONFLICT DO NOTHING;
