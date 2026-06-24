-- ════════════════════════════════════════════════════════════════════
-- BizSco — fix backend schema + backfill 3 months of history
--
-- Runs in two passes inside one paste:
--   PASS 1: Schema repair — adds missing emi / as_of_month columns to
--           financial_data, ensures health_scores exists with the right
--           shape. All operations are idempotent (IF NOT EXISTS).
--   PASS 2: For every user matching %@bizscotest.com, inserts 3 monthly
--           snapshots of financial_data AND a matching health_scores row
--           per month. Numbers wiggle ±5% around the user's biz_profile
--           base. Health score / loan score / verdict are computed using
--           the same math as checkup.html lines 548-599.
--
-- HOW TO RUN
--   1. Open https://supabase.com/dashboard/project/ugtfdtdbegdjqrdtplkg/sql/new
--   2. Paste this whole file. Click Run.
--   3. Verification SELECT at the bottom shows the row counts.
-- ════════════════════════════════════════════════════════════════════

-- ───────────────────────── PASS 1: SCHEMA REPAIR ─────────────────────
-- Create financial_data if it doesn't exist at all
CREATE TABLE IF NOT EXISTS public.financial_data (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Ensure every column the app writes to actually exists
ALTER TABLE public.financial_data ADD COLUMN IF NOT EXISTS revenue      numeric DEFAULT 0;
ALTER TABLE public.financial_data ADD COLUMN IF NOT EXISTS expenses     numeric DEFAULT 0;
ALTER TABLE public.financial_data ADD COLUMN IF NOT EXISTS emi          numeric DEFAULT 0;
ALTER TABLE public.financial_data ADD COLUMN IF NOT EXISTS snapshot_date date    DEFAULT CURRENT_DATE;
ALTER TABLE public.financial_data ADD COLUMN IF NOT EXISTS as_of_month  text;
ALTER TABLE public.financial_data ADD COLUMN IF NOT EXISTS created_at   timestamptz DEFAULT now();

ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;

DO $polf$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='financial_data'
      AND policyname='Users manage own financial data'
  ) THEN
    CREATE POLICY "Users manage own financial data" ON public.financial_data
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$polf$;

CREATE INDEX IF NOT EXISTS financial_data_user_date_idx
  ON public.financial_data (user_id, snapshot_date DESC);

-- health_scores — create if missing, matches the migration file
CREATE TABLE IF NOT EXISTS public.health_scores (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_score  numeric NOT NULL,
  score_date     date NOT NULL DEFAULT CURRENT_DATE,
  dimension_data jsonb,
  created_at     timestamptz DEFAULT now(),
  UNIQUE (user_id, score_date)
);

ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

DO $pol$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='health_scores'
      AND policyname='Users manage own health scores'
  ) THEN
    CREATE POLICY "Users manage own health scores" ON public.health_scores
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$pol$;

CREATE INDEX IF NOT EXISTS health_scores_user_id_idx ON public.health_scores(user_id);
CREATE INDEX IF NOT EXISTS health_scores_date_idx    ON public.health_scores(user_id, score_date DESC);


-- ───────────────────────── PASS 2: BACKFILL ──────────────────────────
DO $back$
DECLARE
  u           record;
  biz         jsonb;
  base_rev    numeric;
  base_exp    numeric;
  base_emi    numeric;
  base_res    numeric;
  m           int;          -- months ago (0=current, 1=1mo, 2=2mo)
  snap_date   date;
  mo_rev      numeric;
  mo_exp      numeric;
  ncf         numeric;
  dscr        numeric;
  er          numeric;
  pm          numeric;
  burn        numeric;
  rmo         numeric;
  cash_left   numeric;
  hs          numeric;
  ls          int;
  grade       text;
  verdict     text;
  rstat       text;
  glabel      text;
  dim         jsonb;
  user_count  int := 0;
  row_count   int := 0;
BEGIN
  FOR u IN
    SELECT id, email, biz_profile
      FROM public.profiles
     WHERE email LIKE '%@bizscotest.com'
       AND biz_profile IS NOT NULL
  LOOP
    biz := u.biz_profile::jsonb;
    base_rev := COALESCE((biz->>'rev')::numeric, 0);
    base_exp := COALESCE((biz->>'exp')::numeric, 0);
    base_emi := COALESCE((biz->>'emi')::numeric, 0);
    base_res := COALESCE((biz->>'reserve')::numeric, 0);

    IF base_rev = 0 THEN CONTINUE; END IF;
    user_count := user_count + 1;

    -- 3 monthly snapshots: current month, 1mo ago, 2mo ago
    FOR m IN 0..2 LOOP
      snap_date := (date_trunc('month', CURRENT_DATE) - (m::text || ' months')::interval)::date;

      -- ±5% wiggle so trends are not flat
      mo_rev := round(base_rev * (1 + 0.05 * sin(m * 1.7)));
      mo_exp := round(base_exp * (1 + 0.03 * cos(m * 1.3)));
      ncf    := mo_rev - mo_exp;
      burn   := mo_exp + base_emi;
      cash_left := ncf - base_emi;

      dscr := CASE WHEN base_emi > 0 THEN ncf / base_emi ELSE 99 END;
      er   := CASE WHEN mo_rev > 0 THEN mo_exp / mo_rev ELSE 1 END;
      pm   := CASE WHEN mo_rev > 0 THEN ncf / mo_rev ELSE 0 END;

      -- runway months (capped at 24)
      IF burn > mo_rev THEN
        rmo := CASE WHEN base_res > 0 THEN LEAST(base_res / (burn - mo_rev), 24) ELSE 0 END;
      ELSE
        rmo := CASE WHEN burn > 0 THEN LEAST(base_res / burn, 24) ELSE 24 END;
      END IF;

      -- Business Health Score (0-100) — checkup.html:583-589
      hs := 0
        + CASE WHEN pm > 0.2 THEN 25 WHEN pm > 0.1 THEN 18 WHEN pm > 0.05 THEN 12 WHEN pm > 0 THEN 6 ELSE 0 END
        + CASE WHEN dscr >= 99 OR dscr >= 1.5 THEN 25 WHEN dscr >= 1.2 THEN 18 WHEN dscr >= 1 THEN 10 ELSE 0 END
        + CASE WHEN rmo >= 6 THEN 25 WHEN rmo >= 3 THEN 15 WHEN rmo >= 1 THEN 6 ELSE 0 END
        + CASE WHEN er < 0.65 THEN 25 WHEN er < 0.75 THEN 18 WHEN er < 0.85 THEN 12 WHEN er < 1 THEN 5 ELSE 0 END;
      hs := GREATEST(0, LEAST(100, hs));

      grade  := CASE WHEN hs >= 85 THEN 'A' WHEN hs >= 70 THEN 'B' WHEN hs >= 52 THEN 'C' WHEN hs >= 36 THEN 'D' ELSE 'F' END;
      glabel := CASE grade WHEN 'A' THEN 'Excellent' WHEN 'B' THEN 'Good' WHEN 'C' THEN 'Fair' WHEN 'D' THEN 'Needs Work' ELSE 'Critical' END;

      -- Loan Safety Score — checkup.html:560-565
      ls := 50
        + CASE WHEN dscr >= 2 THEN 25 WHEN dscr >= 1.5 THEN 18 WHEN dscr >= 1.2 THEN 10 WHEN dscr >= 1 THEN 2 WHEN base_emi > 0 THEN -18 ELSE 0 END
        + CASE WHEN rmo >= 6 THEN 15 WHEN rmo >= 3 THEN 5 ELSE -8 END
        + CASE WHEN er < 0.65 THEN 10 WHEN er < 0.75 THEN 4 WHEN er >= 1 THEN -12 ELSE 0 END;
      ls := GREATEST(5, LEAST(100, ls));
      verdict := CASE WHEN ls >= 70 THEN 'SAFE' WHEN ls >= 45 THEN 'RISKY' ELSE 'DANGEROUS' END;

      -- Cash runway status — checkup.html:574-581
      IF cash_left >= 0 THEN
        rstat := CASE WHEN rmo >= 6 THEN 'STRONG' WHEN rmo >= 3 THEN 'ADEQUATE' ELSE 'BUFFER LOW' END;
      ELSE
        rstat := CASE WHEN rmo >= 6 THEN 'STRONG' WHEN rmo >= 3 THEN 'WARNING' ELSE 'CRITICAL' END;
      END IF;

      dim := jsonb_build_object(
        'loan_score',    ls,
        'verdict',       verdict,
        'grade',         grade,
        'grade_label',   glabel,
        'runway_months', round(rmo, 1),
        'runway_status', rstat,
        'dscr',          round(dscr, 2),
        'expense_ratio', round(er, 3),
        'profit_margin', round(pm, 3),
        'revenue',       mo_rev,
        'expenses',      mo_exp,
        'emi',           base_emi,
        'reserve',       base_res
      );

      -- Replace financial_data for this (user, date)
      DELETE FROM public.financial_data
       WHERE user_id = u.id AND snapshot_date = snap_date;
      INSERT INTO public.financial_data
        (user_id, revenue, expenses, emi, snapshot_date, as_of_month)
      VALUES
        (u.id, mo_rev, mo_exp, base_emi, snap_date, to_char(snap_date,'YYYY-MM'));

      -- Upsert health_scores
      INSERT INTO public.health_scores
        (user_id, score_date, overall_score, dimension_data)
      VALUES
        (u.id, snap_date, hs, dim)
      ON CONFLICT (user_id, score_date) DO UPDATE
        SET overall_score  = EXCLUDED.overall_score,
            dimension_data = EXCLUDED.dimension_data;

      row_count := row_count + 1;
    END LOOP;

    RAISE NOTICE '  ✓ %  (3 snapshots seeded)', u.email;
  END LOOP;

  RAISE NOTICE 'Done. Seeded % users with % total snapshots.', user_count, row_count;
END
$back$;


-- ───────────────────────── VERIFICATION ──────────────────────────────
SELECT
  p.email,
  (p.biz_profile::jsonb)->>'bizName'                                AS biz_name,
  COUNT(DISTINCT fd.snapshot_date)                                  AS fin_rows,
  COUNT(DISTINCT hs.score_date)                                     AS score_rows,
  ROUND(AVG(hs.overall_score), 1)                                   AS avg_health_score,
  (ARRAY_AGG(hs.dimension_data->>'grade'    ORDER BY hs.score_date DESC))[1] AS latest_grade,
  (ARRAY_AGG(hs.dimension_data->>'verdict'  ORDER BY hs.score_date DESC))[1] AS latest_loan_verdict
FROM public.profiles p
LEFT JOIN public.financial_data fd ON fd.user_id = p.id
LEFT JOIN public.health_scores  hs ON hs.user_id = p.id
WHERE p.email LIKE '%@bizscotest.com'
GROUP BY p.email, p.biz_profile
ORDER BY p.email;
