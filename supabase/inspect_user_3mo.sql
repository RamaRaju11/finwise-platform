-- ════════════════════════════════════════════════════════════════════
-- Inspect last 3 months of backend data for a specific user (ONE QUERY)
--
-- HOW TO USE
--   1. Change the email on line 9.
--   2. Select-all (Ctrl+A), paste into Supabase SQL Editor.
--   3. Click "Run". One unified result table appears.
-- ════════════════════════════════════════════════════════════════════

WITH target AS (
  SELECT 'sarah.boutique@bizscotest.com'::text AS email   -- ← change this
),
prof AS (
  SELECT p.* FROM public.profiles p
  JOIN target t ON t.email = p.email
),
fin AS (
  SELECT fd.snapshot_date, fd.as_of_month, fd.revenue, fd.expenses, fd.emi
  FROM public.financial_data fd
  JOIN prof ON prof.id = fd.user_id
  WHERE fd.snapshot_date >= (CURRENT_DATE - INTERVAL '3 months')
),
hs AS (
  SELECT h.score_date, h.overall_score, h.dimension_data
  FROM public.health_scores h
  JOIN prof ON prof.id = h.user_id
  WHERE h.score_date >= (CURRENT_DATE - INTERVAL '3 months')
)

-- ─── PROFILE row ───
SELECT
  '1. profile'                                      AS row_type,
  prof.email                                        AS user_email,
  prof.plan                                         AS plan,
  (prof.biz_profile::jsonb)->>'bizName'             AS biz_name,
  (prof.biz_profile::jsonb)->>'industry'            AS industry,
  (prof.biz_profile::jsonb)->>'country'             AS country,
  ((prof.biz_profile::jsonb)->>'rev')::numeric      AS revenue,
  ((prof.biz_profile::jsonb)->>'exp')::numeric      AS expenses,
  ((prof.biz_profile::jsonb)->>'emi')::numeric      AS emi,
  ((prof.biz_profile::jsonb)->>'reserve')::numeric  AS reserves,
  prof.created_at::text                             AS event_date,
  NULL::numeric                                     AS health_score,
  NULL::text                                        AS grade
FROM prof

UNION ALL

-- ─── FINANCIAL_DATA rows (last 3 months) ───
SELECT
  '2. financial_data',
  prof.email,
  prof.plan,
  (prof.biz_profile::jsonb)->>'bizName',
  fin.as_of_month,
  NULL,
  fin.revenue,
  fin.expenses,
  fin.emi,
  (fin.revenue - fin.expenses),
  fin.snapshot_date::text,
  NULL,
  NULL
FROM fin, prof

UNION ALL

-- ─── HEALTH_SCORE rows (last 3 months) ───
SELECT
  '3. health_score',
  prof.email,
  prof.plan,
  (prof.biz_profile::jsonb)->>'bizName',
  to_char(hs.score_date,'YYYY-MM'),
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  hs.score_date::text,
  hs.overall_score,
  hs.dimension_data->>'grade'
FROM hs, prof

ORDER BY row_type, event_date DESC;
