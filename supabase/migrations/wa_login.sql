-- ════════════════════════════════════════════════════════════════════
-- India WhatsApp Login schema
--   wa_sessions:   state machine for the 5-question onboarding
--   magic_links:   1-hour signed tokens that unlock the dashboard
--   users_in:      India users (phone-keyed, no email required)
--
-- All tables: RLS enabled. Edge Functions use service_role to bypass.
-- Browser clients are NEVER given direct read/write access — they only
-- talk to functions, which gate access via the signed token.
-- ════════════════════════════════════════════════════════════════════

-- ── wa_sessions ─────────────────────────────────────────────────────
create table if not exists public.wa_sessions (
  id            uuid primary key default gen_random_uuid(),
  phone         text unique not null,
  current_step  int  not null default 0,    -- 0=not started, 1..5=Q in flight, 99=complete
  answers       jsonb not null default '{}'::jsonb,
  -- Meta conversation metadata (helpful for debugging)
  last_msg_id   text,
  last_template text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index if not exists idx_wa_sessions_phone   on public.wa_sessions(phone);
create index if not exists idx_wa_sessions_updated on public.wa_sessions(updated_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_wa_sessions_updated on public.wa_sessions;
create trigger trg_wa_sessions_updated
  before update on public.wa_sessions
  for each row execute function public.set_updated_at();

-- ── magic_links ─────────────────────────────────────────────────────
create table if not exists public.magic_links (
  token        text primary key,                       -- 32-char URL-safe random
  phone        text not null,
  session_id   uuid references public.wa_sessions(id) on delete cascade,
  purpose      text not null default 'login',          -- 'login' | 'subscribe' | 'resume'
  expires_at   timestamptz not null,
  used_at      timestamptz,
  used_count   int  not null default 0,                -- allow re-use within hour
  created_at   timestamptz not null default now()
);

create index if not exists idx_magic_links_phone   on public.magic_links(phone);
create index if not exists idx_magic_links_expires on public.magic_links(expires_at);

-- ── users_in (India users) ──────────────────────────────────────────
create table if not exists public.users_in (
  phone               text primary key,                 -- +91XXXXXXXXXX
  biz_name            text,
  industry            text,
  industry_emoji      text,
  revenue_band        text,
  worry               text,
  worry_key           text,                             -- normalized: cash|loan|debt|tax|exploring
  city                text,

  -- subscription
  plan                text not null default 'free',     -- free|starter|pro|advisor
  billing             text not null default 'monthly',  -- monthly|annual
  razorpay_customer_id text,
  razorpay_subscription_id text,
  subscription_status text,                             -- active|cancelled|past_due
  current_period_end  timestamptz,

  -- timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  last_login_at       timestamptz
);

create index if not exists idx_users_in_plan    on public.users_in(plan);
create index if not exists idx_users_in_updated on public.users_in(updated_at desc);

drop trigger if exists trg_users_in_updated on public.users_in;
create trigger trg_users_in_updated
  before update on public.users_in
  for each row execute function public.set_updated_at();

-- ── RLS: lock everything; functions use service_role to bypass ─────
alter table public.wa_sessions enable row level security;
alter table public.magic_links enable row level security;
alter table public.users_in    enable row level security;

-- (no policies created → only service_role can access. Browser cannot.)

-- ── Helper: purge expired magic links (run via cron) ───────────────
create or replace function public.purge_expired_magic_links()
returns int language plpgsql security definer as $$
declare deleted int;
begin
  delete from public.magic_links
  where expires_at < now() - interval '7 days'
  returning 1 into deleted;
  return coalesce(deleted, 0);
end $$;

-- Optional: schedule via pg_cron if extension is available
-- select cron.schedule('purge-magic-links', '0 3 * * *', $$select purge_expired_magic_links()$$);
