-- ════════════════════════════════════════════════════════════════════
-- Seed: one test user + one valid magic link for end-to-end testing
--
-- Paste into Supabase Studio SQL Editor:
--   https://supabase.com/dashboard/project/ugtfdtdbegdjqrdtplkg/sql/new
--
-- After running, test with:
--   https://ramaraju11.github.io/finwise-platform/login.html?t=test_token_priya_kirana
--
-- The token is valid for 24 hours from when you run this (long enough
-- to test without expiring). Delete the rows when you're done.
-- ════════════════════════════════════════════════════════════════════

-- 1. Seed user (Priya's Kirana Store — matches existing testimonial)
insert into public.users_in (
  phone, biz_name, industry, industry_emoji,
  revenue_band, worry, worry_key, city,
  plan, billing, last_login_at
) values (
  '+919876543210',
  'Priya Kirana Store',
  'Retail',
  '🛒',
  '₹1 lakh – ₹5 lakhs / month',
  'Need a loan',
  'loan',
  'Bangalore',
  'free',
  'monthly',
  now()
) on conflict (phone) do update set
  biz_name      = excluded.biz_name,
  last_login_at = excluded.last_login_at;

-- 2. Issue a magic link valid for 24 hours
insert into public.magic_links (
  token, phone, purpose, expires_at
) values (
  'test_token_priya_kirana',
  '+919876543210',
  'login',
  now() + interval '24 hours'
) on conflict (token) do update set
  expires_at = excluded.expires_at,
  used_at    = null,
  used_count = 0;

-- 3. Verify it landed
select 'user'  as type, phone, biz_name, plan, last_login_at
  from public.users_in where phone = '+919876543210'
union all
select 'token' as type, phone, token as biz_name, purpose as plan, expires_at as last_login_at
  from public.magic_links where token = 'test_token_priya_kirana';

-- ── Cleanup later (after testing) ─────────────────────────────────
-- delete from public.magic_links where token = 'test_token_priya_kirana';
-- delete from public.users_in    where phone = '+919876543210';
