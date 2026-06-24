-- ════════════════════════════════════════════════════════════════════
-- BizSco — seed 10 sample Pro users for QA testing
--
-- HOW TO RUN
--   1. Open https://supabase.com/dashboard/project/ugtfdtdbegdjqrdtplkg/sql/new
--   2. Paste this whole file, click "Run"
--   3. Wait ~3 seconds. Verification table appears at the bottom.
--
-- WHAT IT DOES
--   • Creates 10 Supabase auth users (cascade-deletes any prior test user
--     with the same email first, so this is safe to re-run)
--   • Hashes "test123" as their password via bcrypt
--   • Marks each user email-confirmed (skip the verification email)
--   • Sets plan = 'pro' and saves a realistic biz_profile JSON
--   • Uses public.handle_new_user trigger if installed; falls back to
--     direct insert into public.profiles if the trigger is missing
--
-- LOGIN CREDENTIALS — all 10 users share the same password
--   Password:  test123
--   Emails:    sarah.boutique@bizscotest.com
--              patel.pharmacy@bizscotest.com
--              techfix.studios@bizscotest.com
--              mumbai.spice@bizscotest.com
--              greenleaf.cafe@bizscotest.com
--              bayarea.devshop@bizscotest.com
--              bangalore.bazaar@bizscotest.com
--              chicago.autobody@bizscotest.com
--              hyderabad.coaching@bizscotest.com
--              miami.cleaning@bizscotest.com
--
-- TO CLEAN UP LATER — uncomment the DELETE at the bottom of this file.
-- ════════════════════════════════════════════════════════════════════

-- Make sure crypt() / gen_salt() are available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  USERS jsonb;
  i int;
  uid uuid;
  rec jsonb;
  email_lc text;
  total int;
BEGIN
  USERS := jsonb_build_array(
    -- ─── P1: Sarah's Boutique Apparel ─── USA · CA · Retail · healthy small biz
    jsonb_build_object(
      'email','sarah.boutique@bizscotest.com',
      'fullName','Sarah Mitchell',
      'biz', jsonb_build_object(
        'bizName','Sarah''s Boutique Apparel',
        'ownerName','Sarah Mitchell',
        'industry','Retail',
        'yearsInBusiness','4',
        'state','CA',
        'employees','3',
        'rev',45000,'exp',32000,'emi',4000,'reserve',85000,'loan',50000,
        'country','USA',
        'ownerCategory',jsonb_build_array('women-owned'),
        'asOfMonth',to_char(now(),'YYYY-MM'),
        'asOfSavedAt',now()
      )
    ),
    -- ─── P2: Patel Family Pharmacy ─── India · MH · Healthcare · mid-size
    jsonb_build_object(
      'email','patel.pharmacy@bizscotest.com',
      'fullName','Raj Patel',
      'biz', jsonb_build_object(
        'bizName','Patel Family Pharmacy','ownerName','Raj Patel',
        'industry','Health & Wellness','yearsInBusiness','7','state','Maharashtra',
        'employees','5','rev',800000,'exp',550000,'emi',80000,'reserve',1500000,'loan',300000,
        'country','India','ownerCategory',jsonb_build_array(),
        'asOfMonth',to_char(now(),'YYYY-MM'),'asOfSavedAt',now()
      )
    ),
    -- ─── P3: TechFix Studios LLC ─── USA · TX · IT services · fast-scaling
    jsonb_build_object(
      'email','techfix.studios@bizscotest.com','fullName','Marcus Chen',
      'biz', jsonb_build_object(
        'bizName','TechFix Studios LLC','ownerName','Marcus Chen',
        'industry','Technology / Software','yearsInBusiness','6','state','TX','employees','12',
        'rev',120000,'exp',95000,'emi',15000,'reserve',200000,'loan',150000,
        'country','USA','ownerCategory',jsonb_build_array('minority-owned'),
        'asOfMonth',to_char(now(),'YYYY-MM'),'asOfSavedAt',now()
      )
    ),
    -- ─── P4: Mumbai Spice Trading Co ─── India · MH · Food mfg · large
    jsonb_build_object(
      'email','mumbai.spice@bizscotest.com','fullName','Priya Sharma',
      'biz', jsonb_build_object(
        'bizName','Mumbai Spice Trading Co','ownerName','Priya Sharma',
        'industry','Food & Beverage','yearsInBusiness','12','state','Maharashtra','employees','25',
        'rev',3500000,'exp',2800000,'emi',300000,'reserve',5000000,'loan',2000000,
        'country','India','ownerCategory',jsonb_build_array('women-owned'),
        'asOfMonth',to_char(now(),'YYYY-MM'),'asOfSavedAt',now()
      )
    ),
    -- ─── P5: GreenLeaf Cafe ─── USA · NY · F&B · struggling
    jsonb_build_object(
      'email','greenleaf.cafe@bizscotest.com','fullName','Diego Hernandez',
      'biz', jsonb_build_object(
        'bizName','GreenLeaf Cafe','ownerName','Diego Hernandez',
        'industry','Food & Beverage','yearsInBusiness','2','state','NY','employees','4',
        'rev',28000,'exp',26000,'emi',3500,'reserve',8000,'loan',25000,
        'country','USA','ownerCategory',jsonb_build_array('minority-owned','veteran-owned'),
        'asOfMonth',to_char(now(),'YYYY-MM'),'asOfSavedAt',now()
      )
    ),
    -- ─── P6: Bay Area Web Studio ─── USA · CA · Freelance dev · solopreneur
    jsonb_build_object(
      'email','bayarea.devshop@bizscotest.com','fullName','Alex Kim',
      'biz', jsonb_build_object(
        'bizName','Bay Area Web Studio','ownerName','Alex Kim',
        'industry','Technology / Software','yearsInBusiness','3','state','CA','employees','1',
        'rev',18000,'exp',9000,'emi',1500,'reserve',45000,'loan',20000,
        'country','USA','ownerCategory',jsonb_build_array('minority-owned'),
        'asOfMonth',to_char(now(),'YYYY-MM'),'asOfSavedAt',now()
      )
    ),
    -- ─── P7: Bangalore Online Bazaar ─── India · KA · E-commerce · scaling
    jsonb_build_object(
      'email','bangalore.bazaar@bizscotest.com','fullName','Anitha Reddy',
      'biz', jsonb_build_object(
        'bizName','Bangalore Online Bazaar','ownerName','Anitha Reddy',
        'industry','Retail','yearsInBusiness','5','state','Karnataka','employees','8',
        'rev',450000,'exp',380000,'emi',50000,'reserve',200000,'loan',500000,
        'country','India','ownerCategory',jsonb_build_array('women-owned'),
        'asOfMonth',to_char(now(),'YYYY-MM'),'asOfSavedAt',now()
      )
    ),
    -- ─── P8: Chicago Auto Body Shop ─── USA · IL · Auto services
    jsonb_build_object(
      'email','chicago.autobody@bizscotest.com','fullName','Mike Kowalski',
      'biz', jsonb_build_object(
        'bizName','Kowalski Auto Body','ownerName','Mike Kowalski',
        'industry','Professional Services','yearsInBusiness','9','state','IL','employees','6',
        'rev',65000,'exp',52000,'emi',7500,'reserve',30000,'loan',60000,
        'country','USA','ownerCategory',jsonb_build_array('veteran-owned'),
        'asOfMonth',to_char(now(),'YYYY-MM'),'asOfSavedAt',now()
      )
    ),
    -- ─── P9: Hyderabad Coaching Center ─── India · TG · Education services
    jsonb_build_object(
      'email','hyderabad.coaching@bizscotest.com','fullName','Krishna Rao',
      'biz', jsonb_build_object(
        'bizName','Vidya Bright Coaching Center','ownerName','Krishna Rao',
        'industry','Education','yearsInBusiness','8','state','Telangana','employees','15',
        'rev',350000,'exp',220000,'emi',30000,'reserve',600000,'loan',400000,
        'country','India','ownerCategory',jsonb_build_array(),
        'asOfMonth',to_char(now(),'YYYY-MM'),'asOfSavedAt',now()
      )
    ),
    -- ─── P10: Miami Sparkle Cleaning ─── USA · FL · Services · vet+woman
    jsonb_build_object(
      'email','miami.cleaning@bizscotest.com','fullName','Lisa Rodriguez',
      'biz', jsonb_build_object(
        'bizName','Miami Sparkle Cleaning Services','ownerName','Lisa Rodriguez',
        'industry','Professional Services','yearsInBusiness','5','state','FL','employees','9',
        'rev',32000,'exp',22000,'emi',2500,'reserve',50000,'loan',35000,
        'country','USA','ownerCategory',jsonb_build_array('women-owned','veteran-owned','minority-owned'),
        'asOfMonth',to_char(now(),'YYYY-MM'),'asOfSavedAt',now()
      )
    )
  );

  total := jsonb_array_length(USERS);
  RAISE NOTICE 'Seeding % Pro users…', total;

  FOR i IN 0 .. total-1 LOOP
    rec := USERS->i;
    email_lc := lower(rec->>'email');

    -- Clean any prior test user (cascade clears identity + profile)
    DELETE FROM auth.users WHERE email = email_lc;

    -- 1) Create auth user
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid, 'authenticated', 'authenticated', email_lc,
      crypt('test123', gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers',jsonb_build_array('email')),
      jsonb_build_object('full_name', rec->>'fullName'),
      now(), now(),
      '', '', '', ''
    );

    -- 2) Email identity (required for password login on modern Supabase)
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), uid,
      jsonb_build_object('sub', uid::text, 'email', email_lc, 'email_verified', true),
      'email', email_lc,
      now(), now(), now()
    );

    -- 3) Upgrade profile to Pro and attach biz_profile
    --    (handle_new_user trigger usually creates the row with plan='free')
    UPDATE public.profiles
       SET plan        = 'pro',
           full_name   = rec->>'fullName',
           biz_profile = (rec->'biz')::text,
           updated_at  = now()
     WHERE id = uid;

    IF NOT FOUND THEN
      -- Fallback if trigger isn't installed
      INSERT INTO public.profiles (id, email, plan, full_name, biz_profile, created_at, updated_at)
      VALUES (uid, email_lc, 'pro', rec->>'fullName', (rec->'biz')::text, now(), now());
    END IF;

    RAISE NOTICE '  ✓ %  (% — Pro)', email_lc, rec->>'fullName';
  END LOOP;

  RAISE NOTICE 'Done. All % users have password "test123".', total;
END $$;

-- ──────────────────────  VERIFICATION  ─────────────────────────────
SELECT
  row_number() OVER (ORDER BY p.created_at) AS "#",
  p.email,
  p.full_name,
  p.plan,
  (p.biz_profile::jsonb)->>'bizName'    AS business,
  (p.biz_profile::jsonb)->>'country'    AS country,
  (p.biz_profile::jsonb)->>'industry'   AS industry,
  ((p.biz_profile::jsonb)->>'rev')::numeric AS monthly_rev,
  CASE WHEN u.encrypted_password IS NOT NULL THEN '✓' ELSE '✗' END AS password_set,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✓' ELSE '✗' END AS email_confirmed
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.email LIKE '%@bizscotest.com'
ORDER BY p.created_at;

-- ──────────────────────  CLEANUP (uncomment to remove all 10) ──────
-- DELETE FROM auth.users WHERE email LIKE '%@bizscotest.com';
