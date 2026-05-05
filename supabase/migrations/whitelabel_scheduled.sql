-- White-label branding columns on advisor profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS wl_brand_name   TEXT,
  ADD COLUMN IF NOT EXISTS wl_tagline      TEXT DEFAULT 'Financial Advisory Services',
  ADD COLUMN IF NOT EXISTS wl_color        TEXT DEFAULT '#4f46e5',
  ADD COLUMN IF NOT EXISTS wl_logo_url     TEXT,
  ADD COLUMN IF NOT EXISTS wl_domain       TEXT,
  ADD COLUMN IF NOT EXISTS wl_hide_finwise BOOL DEFAULT FALSE;

-- Schedule columns on client portals
ALTER TABLE client_portals
  ADD COLUMN IF NOT EXISTS schedule_enabled   BOOL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS schedule_last_sent TIMESTAMPTZ;
