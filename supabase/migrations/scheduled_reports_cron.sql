-- Run scheduled reports on the 1st of every month at 8 AM UTC
-- Prerequisites: pg_cron extension must be enabled (Database → Extensions → pg_cron)
-- Replace YOUR_SERVICE_ROLE_KEY with the actual key from Supabase → Settings → API

SELECT cron.schedule(
  'monthly-client-reports',
  '0 8 1 * *',
  $$
  SELECT net.http_post(
    url     := 'https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/scheduled-reports',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body    := '{}'::jsonb
  )
  $$
);
