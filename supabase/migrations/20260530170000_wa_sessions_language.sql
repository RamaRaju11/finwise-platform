-- ════════════════════════════════════════════════════════════════════
-- Add language column to wa_sessions for English/Hindi onboarding.
-- Default 'en' preserves behavior for existing rows.
-- ════════════════════════════════════════════════════════════════════

alter table public.wa_sessions
  add column if not exists language text not null default 'en';

create index if not exists idx_wa_sessions_language
  on public.wa_sessions(language);
