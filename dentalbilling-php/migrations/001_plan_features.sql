-- ============================================================
--  Migration 001 — per-plan features
--  Run ONCE in phpMyAdmin (select your DB → Import → this file).
--  Safe to re-run: uses IF NOT EXISTS and only seeds when empty.
-- ============================================================

CREATE TABLE IF NOT EXISTS plan_features (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id INT UNSIGNED NOT NULL,
  label VARCHAR(255) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  INDEX (plan_id),
  CONSTRAINT fk_pf_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed from the default plans only if the table is currently empty.
INSERT INTO plan_features (plan_id, label, enabled, sort_order)
SELECT p.id, x.label, 1, x.sort_order
FROM plans p
JOIN (
  SELECT 'free' AS slug, 'Basic listing' AS label, 1 AS sort_order UNION ALL
  SELECT 'free', '1 service category', 2 UNION ALL
  SELECT 'free', 'Standard placement', 3 UNION ALL
  SELECT 'basic', 'Everything in Free', 1 UNION ALL
  SELECT 'basic', 'Up to 5 categories', 2 UNION ALL
  SELECT 'basic', 'Company logo', 3 UNION ALL
  SELECT 'basic', 'Contact button', 4 UNION ALL
  SELECT 'premium', 'Everything in Basic', 1 UNION ALL
  SELECT 'premium', 'Unlimited categories', 2 UNION ALL
  SELECT 'premium', 'Photo gallery', 3 UNION ALL
  SELECT 'premium', 'Lead capture', 4 UNION ALL
  SELECT 'premium', 'Priority placement', 5 UNION ALL
  SELECT 'featured', 'Everything in Premium', 1 UNION ALL
  SELECT 'featured', 'Featured badge', 2 UNION ALL
  SELECT 'featured', 'Top of search results', 3 UNION ALL
  SELECT 'featured', 'Homepage spotlight', 4 UNION ALL
  SELECT 'featured', 'Analytics dashboard', 5
) x ON x.slug = p.slug
WHERE NOT EXISTS (SELECT 1 FROM plan_features);
