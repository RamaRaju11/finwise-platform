-- Run in Supabase → SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_plan     TEXT    DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS drip_sent      INT[]   DEFAULT '{}';
