-- Run in Supabase → SQL Editor
-- Schedules the drip-sender Edge Function to run daily at 9am UTC

SELECT cron.schedule(
  'finwise-drip-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/drip-sender',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);
