-- ════════════════════════════════════════════════════════════════════
-- Schedule the monthly-capture-reminder Edge Function to run on the
-- 3rd of every month at 10:00 IST (which is 04:30 UTC).
--
-- Uses pg_cron + pg_net (both already common in Supabase projects).
-- If pg_cron isn't available on your project tier, schedule externally
-- via cron-job.org or Vercel cron — just POST to the function URL.
-- ════════════════════════════════════════════════════════════════════

-- Ensure extensions exist (no-op if already enabled)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove any prior schedule with the same name (idempotent re-run)
do $$
begin
  perform cron.unschedule('monthly-capture-reminder');
exception when others then null;
end $$;

-- Schedule: 04:30 UTC on day 3 of every month = 10:00 IST
-- Cron format: minute hour day-of-month month day-of-week
select cron.schedule(
  'monthly-capture-reminder',
  '30 4 3 * *',
  $$
    select
      net.http_post(
        url     := 'https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/monthly-capture-reminder',
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key', true)
        ),
        body    := '{}'::jsonb
      ) as request_id;
  $$
);
