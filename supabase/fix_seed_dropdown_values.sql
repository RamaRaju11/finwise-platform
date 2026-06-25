-- ════════════════════════════════════════════════════════════════════
-- Re-map biz_profile values to match the onboarding form's <select>
-- options, so Year/State/Industry/Employees dropdowns pre-fill instead
-- of showing blank "-- Select --".
--
-- HOW TO RUN
--   Paste into Supabase SQL Editor and click Run.
--   Safe to re-run.
-- ════════════════════════════════════════════════════════════════════

UPDATE public.profiles SET biz_profile = (biz_profile::jsonb
  || jsonb_build_object(
       'industry',       CASE (biz_profile::jsonb->>'industry')
                           WHEN 'Retail'                 THEN 'Retail / E-commerce'
                           WHEN 'Food & Beverage'        THEN 'Food & Restaurant'
                           WHEN 'Education'              THEN 'Education & Training'
                           ELSE (biz_profile::jsonb->>'industry')
                         END,
       'state',          CASE (biz_profile::jsonb->>'state')
                           WHEN 'CA' THEN 'California'
                           WHEN 'TX' THEN 'Texas'
                           WHEN 'NY' THEN 'New York'
                           WHEN 'IL' THEN 'Illinois'
                           WHEN 'FL' THEN 'Florida'
                           ELSE (biz_profile::jsonb->>'state')
                         END,
       'yearsInBusiness',CASE
                           WHEN ((biz_profile::jsonb->>'yearsInBusiness')::int) < 1 THEN 'Less than 1 year'
                           WHEN ((biz_profile::jsonb->>'yearsInBusiness')::int) < 3 THEN '1—2 years'
                           WHEN ((biz_profile::jsonb->>'yearsInBusiness')::int) < 6 THEN '2—5 years'
                           WHEN ((biz_profile::jsonb->>'yearsInBusiness')::int) < 11 THEN '5—10 years'
                           ELSE '10+ years'
                         END,
       'employees',      CASE
                           WHEN ((biz_profile::jsonb->>'employees')::int) <= 1 THEN 'Just me (Solo)'
                           WHEN ((biz_profile::jsonb->>'employees')::int) <= 5 THEN '2—5'
                           WHEN ((biz_profile::jsonb->>'employees')::int) <= 20 THEN '6—20'
                           WHEN ((biz_profile::jsonb->>'employees')::int) <= 50 THEN '21—50'
                           WHEN ((biz_profile::jsonb->>'employees')::int) <= 100 THEN '51—100'
                           ELSE '100+'
                         END
     )
)::text
WHERE email LIKE '%@bizscotest.com';

-- Verify
SELECT email,
       (biz_profile::jsonb)->>'industry'         AS industry,
       (biz_profile::jsonb)->>'state'            AS state,
       (biz_profile::jsonb)->>'yearsInBusiness'  AS years,
       (biz_profile::jsonb)->>'employees'        AS employees
FROM public.profiles
WHERE email LIKE '%@bizscotest.com'
ORDER BY email;
