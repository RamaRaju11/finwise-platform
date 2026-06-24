-- ════════════════════════════════════════════════════════════════════
-- Inspect last 3 months of backend data for a specific user
--
-- HOW TO USE
--   1. Change the email in the WITH target line below.
--   2. Paste this whole file into the Supabase SQL Editor.
--   3. Click "Run". Four result tables appear, one tab per section.
-- ════════════════════════════════════════════════════════════════════

WITH target AS (
  -- ↓↓↓ change to the user you want to inspect ↓↓↓
  SELECT 'sarah.boutique@bizscotest.com'::text AS email
)

-- ─────────────  1.  PROFILE  ─────────────
SELECT
  '1️⃣ profile'        AS section,
  p.email,
  p.full_name,
  p.plan,
  p.created_at,
  CASE WHEN p.biz_profile IS NULL THEN '✗' ELSE '✓' END AS biz_profile_set,
  (p.biz_profile::jsonb)->>'bizName'                       AS biz_name,
  (p.biz_profile::jsonb)->>'industry'                      AS industry,
  (p.biz_profile::jsonb)->>'country'                       AS country,
  ((p.biz_profile::jsonb)->>'rev')::numeric                AS biz_monthly_rev,
  ((p.biz_profile::jsonb)->>'exp')::numeric                AS biz_monthly_exp,
  ((p.biz_profile::jsonb)->>'emi')::numeric                AS biz_monthly_emi,
  ((p.biz_profile::jsonb)->>'reserve')::numeric            AS biz_reserve
FROM public.profiles p
JOIN target t ON t.email = p.email;

-- ─────────────  2.  LAST 3 MONTHS OF financial_data  ─────────────
SELECT
  '2️⃣ financial_data (last 3 mo)' AS section,
  fd.snapshot_date,
  fd.as_of_month,
  fd.revenue,
  fd.expenses,
  fd.emi,
  (fd.revenue - fd.expenses) AS net_cash_flow,
  CASE WHEN fd.emi > 0
    THEN ROUND((fd.revenue - fd.expenses)::numeric / fd.emi, 2)
    ELSE NULL
  END AS dscr
FROM public.financial_data fd
JOIN public.profiles p ON p.id = fd.user_id
JOIN target t ON t.email = p.email
WHERE fd.snapshot_date >= (CURRENT_DATE - INTERVAL '3 months')
ORDER BY fd.snapshot_date DESC;

-- ─────────────  3.  LAST 3 MONTHS OF health_scores  ─────────────
SELECT
  '3️⃣ health_scores (last 3 mo)' AS section,
  hs.score_date,
  hs.overall_score,
  hs.dimension_data->>'loan_score'    AS loan_score,
  hs.dimension_data->>'runway_months' AS runway_months,
  hs.dimension_data->>'grade'         AS grade,
  hs.dimension_data->>'verdict'       AS verdict,
  hs.created_at
FROM public.health_scores hs
JOIN public.profiles p ON p.id = hs.user_id
JOIN target t ON t.email = p.email
WHERE hs.score_date >= (CURRENT_DATE - INTERVAL '3 months')
ORDER BY hs.score_date DESC;

-- ─────────────  4.  SUMMARY (counts of every row across tables) ─
SELECT
  '4️⃣ all-table footprint' AS section,
  (SELECT COUNT(*) FROM public.financial_data fd  JOIN public.profiles p ON p.id=fd.user_id JOIN target t ON t.email=p.email) AS financial_rows_total,
  (SELECT COUNT(*) FROM public.health_scores hs   JOIN public.profiles p ON p.id=hs.user_id JOIN target t ON t.email=p.email) AS health_score_rows_total,
  (SELECT MIN(snapshot_date) FROM public.financial_data fd JOIN public.profiles p ON p.id=fd.user_id JOIN target t ON t.email=p.email) AS earliest_snapshot,
  (SELECT MAX(snapshot_date) FROM public.financial_data fd JOIN public.profiles p ON p.id=fd.user_id JOIN target t ON t.email=p.email) AS latest_snapshot,
  (SELECT MAX(score_date)    FROM public.health_scores   hs JOIN public.profiles p ON p.id=hs.user_id JOIN target t ON t.email=p.email) AS latest_score_date;
