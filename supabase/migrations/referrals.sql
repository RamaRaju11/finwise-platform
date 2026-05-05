-- Run this in Supabase → SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referred_by       TEXT,
  ADD COLUMN IF NOT EXISTS referral_credits  INT  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_credited BOOL DEFAULT FALSE;
