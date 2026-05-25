// ════════════════════════════════════════════════════════════════════
// wa-webhook
//
// Two responsibilities, depending on HTTP method:
//
//   GET  — Meta's one-time webhook handshake. Returns the challenge
//          if the verify token matches our META_WEBHOOK_VERIFY_TOKEN.
//
//   POST — Every incoming WhatsApp message from a user. We:
//          1. Verify Meta's signature
//          2. Find the user's wa_session by phone
//          3. Validate their reply against the current question
//          4. If valid → save answer, send next question
//          5. If invalid → send error + re-ask the same question
//          6. After Q5 → mark complete, create users_in, issue magic
//             link, send it via WhatsApp
//
// Configure in Meta Business Suite → WABA → Configuration → Webhooks:
//   Callback URL: https://<project-ref>.supabase.co/functions/v1/wa-webhook
//   Verify Token: <same string as META_WEBHOOK_VERIFY_TOKEN env var>
// Subscribe to: messages, message_status
// ════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import {
  sendText,
  verifyWebhookSignature,
  generateMagicToken
} from "../_shared/meta-api.ts"
import { QUESTIONS } from "../_shared/questions.ts"

serve(async (req) => {
  const url = new URL(req.url)

  // ── GET: Meta webhook verification handshake ─────────────────────
  if (req.method === 'GET') {
    const mode      = url.searchParams.get('hub.mode')
    const token     = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    const expected  = Deno.env.get('META_WEBHOOK_VERIFY_TOKEN')

    if (mode === 'subscribe' && token === expected && challenge) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // ── POST: incoming WhatsApp message events ───────────────────────
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const rawBody  = await req.text()
  const sigOk    = await verifyWebhookSignature(
    rawBody,
    req.headers.get('x-hub-signature-256')
  )
  if (!sigOk) {
    console.warn('[wa-webhook] signature verification failed')
    return new Response('Forbidden', { status: 403 })
  }

  let payload: any
  try { payload = JSON.parse(rawBody) }
  catch { return new Response('Bad JSON', { status: 400 }) }

  // Meta always wants a 200 within ~10s, even if we hit errors —
  // otherwise it retries and floods us. So we process best-effort
  // and always return 200 unless something is structurally wrong.
  try {
    await processWebhookPayload(payload)
  } catch (e) {
    console.error('[wa-webhook] processing error:', e)
  }
  return new Response('ok', { status: 200 })
})

// ── Main processor ────────────────────────────────────────────────
async function processWebhookPayload(payload: any) {
  // Meta webhook envelope shape:
  //   { entry: [{ changes: [{ value: { messages: [{ from, text, ... }] } }] }] }
  const messages = payload?.entry?.[0]?.changes?.[0]?.value?.messages
  if (!messages || messages.length === 0) return  // status update, not a new msg

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  for (const msg of messages) {
    const fromDigits = msg.from as string                    // "919876543210"
    const phone      = '+' + fromDigits                      // "+919876543210"
    const text       = (msg.text?.body || '').trim()
    if (!text) continue  // ignore media-only messages for now

    // Load session
    const { data: session } = await admin
      .from('wa_sessions')
      .select('*')
      .eq('phone', phone)
      .single()

    if (!session || session.current_step === 0 || session.current_step >= 99) {
      // No active session — they came in cold or after completing
      await sendText(phone,
        'Hi! 👋 To start your BizSco signup, please visit:\nhttps://ramaraju11.github.io/finwise-platform/whatsapp-start.html'
      )
      continue
    }

    const stepIdx = session.current_step - 1
    const question = QUESTIONS[stepIdx]
    if (!question) continue  // shouldn't happen, but defensive

    const validation = question.validate(text)
    if (!validation.ok) {
      await sendText(phone,
        `${validation.error}\n\n${question.prompt}`
      )
      continue
    }

    // Save the answer
    const normalizedAnswers = { ...session.answers, ...question.normalize(text) }
    const isLastQuestion = session.current_step === QUESTIONS.length

    if (isLastQuestion) {
      // ── Final step: complete the session, create user, issue magic link ──
      await admin.from('wa_sessions').update({
        answers:      normalizedAnswers,
        current_step: 99,
        completed_at: new Date().toISOString()
      }).eq('id', session.id)

      // Upsert user (phone is the primary key for India)
      await admin.from('users_in').upsert({
        phone,
        biz_name:       normalizedAnswers.biz_name,
        industry:       normalizedAnswers.industry,
        industry_emoji: normalizedAnswers.industry_emoji,
        revenue_band:   normalizedAnswers.revenue_band,
        worry:          normalizedAnswers.worry,
        worry_key:      normalizedAnswers.worry_key,
        city:           normalizedAnswers.city,
        last_login_at:  new Date().toISOString()
      }, { onConflict: 'phone' })

      // Generate signed 1-hour magic link
      const token     = generateMagicToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
      await admin.from('magic_links').insert({
        token,
        phone,
        session_id: session.id,
        purpose:    'login',
        expires_at: expiresAt
      })

      const baseUrl = Deno.env.get('PUBLIC_SITE_URL') ||
                      'https://ramaraju11.github.io/finwise-platform'
      const link = `${baseUrl}/login.html?t=${token}`

      await sendText(phone,
        `🎉 All done, ${normalizedAnswers.biz_name}!\n\n` +
        `Your personalized BizSco dashboard is ready. Tap below to open it (valid for 1 hour):\n\n` +
        `${link}\n\n` +
        `_Reply HELP anytime if you get stuck._`
      )
    } else {
      // ── Advance to next question ──
      const nextStep = session.current_step + 1
      const nextQuestion = QUESTIONS[nextStep - 1]

      await admin.from('wa_sessions').update({
        answers:      normalizedAnswers,
        current_step: nextStep
      }).eq('id', session.id)

      await sendText(phone, nextQuestion.prompt)
    }
  }
}
