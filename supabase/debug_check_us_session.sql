-- Paste into Supabase Studio SQL Editor to debug
-- Check if the US number created a session and what's in last_template (will show "(failed)" if Meta send failed)

select phone, current_step, language, last_template, last_msg_id, updated_at
  from public.wa_sessions
  where phone like '+1%'
  order by updated_at desc
  limit 5;
