-- ════════════════════════════════════════════════════════════════════
-- Diagnostic: why is signUp returning "Database error saving new user"?
-- Paste into Supabase Studio SQL Editor and run all 5 queries.
-- https://supabase.com/dashboard/project/ugtfdtdbegdjqrdtplkg/sql/new
-- ════════════════════════════════════════════════════════════════════

-- ── 1. List all triggers on auth.users (the usual culprit) ───────────
select
  trigger_name,
  event_manipulation as event,
  action_timing as timing,
  action_statement
from information_schema.triggers
where event_object_schema = 'auth'
  and event_object_table = 'users'
order by trigger_name;
-- Expected: one trigger like 'on_auth_user_created'. Its action_statement
-- usually says EXECUTE FUNCTION public.handle_new_user()

-- ── 2. Show the handle_new_user function body (if it exists) ─────────
select
  proname as function_name,
  pg_get_functiondef(p.oid) as body
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in ('handle_new_user', 'on_auth_user_created');

-- ── 3. Show profiles table columns + nullability ────────────────────
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;
-- LOOK FOR: any column with is_nullable=NO AND column_default IS NULL.
-- Those will block the trigger's insert if the trigger doesn't supply them.

-- ── 4. RLS status + policies on profiles ─────────────────────────────
select schemaname, tablename, rowsecurity
  from pg_tables
  where schemaname = 'public' and tablename = 'profiles';

select policyname, cmd, qual, with_check
  from pg_policies
  where schemaname = 'public' and tablename = 'profiles'
  order by cmd, policyname;
-- LOOK FOR: missing INSERT policy when RLS is enabled, OR a policy whose
-- with_check uses auth.uid() but the trigger runs as authenticator/postgres
-- role and not as the signing-up user.

-- ── 5. Inspect the most recent error in postgres logs ────────────────
-- (run this AFTER attempting another signup to capture the fresh error)
-- If you have permission for pg_stat_statements / log retrieval:
-- otherwise use Supabase Dashboard → Logs → Postgres → search for
-- "handle_new_user" or "Database error saving new user".
