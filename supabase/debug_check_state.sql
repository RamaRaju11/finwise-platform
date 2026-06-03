-- Paste in Supabase Studio SQL Editor
select phone, current_step, language, answers, last_template, last_msg_id, updated_at
  from public.wa_sessions
  where phone = '+16464275578'
  order by updated_at desc
  limit 3;
