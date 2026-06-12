-- ============================================================
--  Migration 002 — functional plan capabilities + per-listing nofollow
--  Run ONCE in phpMyAdmin (select your DB -> Import). Idempotent.
--
--  Replaces the text-only plan_features (migration 001) with real
--  capability flags that gate functionality (logo upload, gallery, etc.).
-- ============================================================

-- The old text-feature table is no longer used.
DROP TABLE IF EXISTS plan_features;

-- A capability is "enabled" for a plan when a row exists here.
CREATE TABLE IF NOT EXISTS plan_capabilities (
  plan_id INT UNSIGNED NOT NULL,
  cap_key VARCHAR(64) NOT NULL,
  PRIMARY KEY (plan_id, cap_key),
  CONSTRAINT fk_pc_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed sensible defaults only if the table is empty.
INSERT INTO plan_capabilities (plan_id, cap_key)
SELECT p.id, x.cap_key
FROM plans p
JOIN (
  SELECT 'free' AS slug, 'website_link' AS cap_key UNION ALL
  SELECT 'basic', 'logo_upload'  UNION ALL
  SELECT 'basic', 'website_link' UNION ALL
  SELECT 'basic', 'lead_capture' UNION ALL
  SELECT 'premium', 'logo_upload'        UNION ALL
  SELECT 'premium', 'website_link'       UNION ALL
  SELECT 'premium', 'lead_capture'       UNION ALL
  SELECT 'premium', 'gallery'            UNION ALL
  SELECT 'premium', 'priority_placement' UNION ALL
  SELECT 'featured', 'logo_upload'        UNION ALL
  SELECT 'featured', 'website_link'       UNION ALL
  SELECT 'featured', 'lead_capture'       UNION ALL
  SELECT 'featured', 'gallery'            UNION ALL
  SELECT 'featured', 'priority_placement' UNION ALL
  SELECT 'featured', 'featured_badge'     UNION ALL
  SELECT 'featured', 'analytics'
) x ON x.slug = p.slug
WHERE NOT EXISTS (SELECT 1 FROM plan_capabilities);

-- Add the per-listing nofollow flag to companies (idempotent).
SET @col := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'companies'
             AND column_name = 'website_nofollow');
SET @sql := IF(@col = 0,
  'ALTER TABLE companies ADD COLUMN website_nofollow TINYINT(1) NOT NULL DEFAULT 1',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
