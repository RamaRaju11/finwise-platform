// ════════════════════════════════════════════════════════════════════
// wa-start
//   POST { phone: "+919876543210" }
//
// 1. Validates the phone is a real Indian mobile.
// 2. Upserts a row into wa_sessions (current_step=1).
// 3. Sends the approved Meta template `bizsco_welcome` to that phone.
// 4. Returns { ok: true } to the browser.
//
// Called from whatsapp-start.html when the user submits their number.
// ════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import {
  sendTemplate,
  isValidPhone,
  normalizePhone
} from "../_shared/meta-api.ts"
import { welcomeTemplateFor } from "../_shared/questions.ts"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') {
    return json({ error: 'POST only' }, 405)
  }

  try {
    const { phone, language: rawLang, country: rawCountry } = await req.json()

    // Country hint: 'in' (default) for India, 'us' for USA testing
    const country = rawCountry === 'us' ? 'us' : 'in'

    if (!phone || !isValidPhone(phone, country)) {
      return json({
        error: country === 'us'
          ? 'Invalid US mobile number. Must be 10 digits (area code 2-9).'
          : 'Invalid Indian mobile number. Must be 10 digits starting with 6/7/8/9.'
      }, 400)
    }
    const normalized = normalizePhone(phone, country)
    const language   = rawLang === 'hi' ? 'hi' : 'en'   // only en/hi supported

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Rate limit: max 3 starts per phone per hour ────────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentStarts } = await admin
      .from('wa_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('phone', normalized)
      .gte('updated_at', oneHourAgo)
    if ((recentStarts ?? 0) >= 3) {
      return json({ error: 'Too many attempts. Please try again in an hour.' }, 429)
    }

    // ── Upsert session (reset to step 1 if user is restarting) ─────
    const { data: session, error: upsertErr } = await admin
      .from('wa_sessions')
      .upsert({
        phone:        normalized,
        current_step: 1,
        answers:      {},
        completed_at: null,
        language
      }, { onConflict: 'phone' })
      .select()
      .single()
    if (upsertErr) throw new Error('Failed to create session: ' + upsertErr.message)

    // ── Send Q1 via approved template (language-aware) ─────────────
    // The template embeds Q1 in its body. The {{1}} placeholder is the
    // user's greeting name (we pass a fallback until we know it).
    const template = welcomeTemplateFor(language)
    const greeting = language === 'hi' ? 'मित्र' : 'there'
    const sendResult = await sendTemplate(
      normalized,
      template.name,
      template.languageCode,
      [greeting]
    )

    if (!sendResult.ok) {
      // Don't fail the request — surface a friendlier message but
      // store the failure for debugging.
      await admin.from('wa_sessions').update({
        last_template: template.name + ' (failed)'
      }).eq('id', session.id)

      return json({
        error: 'Could not send WhatsApp message. Please verify your number is registered on WhatsApp.',
        debug: sendResult.error
      }, 502)
    }

    await admin.from('wa_sessions').update({
      last_msg_id:   sendResult.message_id,
      last_template: template.name
    }).eq('id', session.id)

    return json({ ok: true, session_id: session.id })

  } catch (e) {
    console.error('[wa-start] error:', e)
    return json({ error: (e as Error).message }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  })
}
