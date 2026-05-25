// ════════════════════════════════════════════════════════════════════
// Meta Cloud API wrapper for WhatsApp Business messaging.
// Used by wa-start (first message via template) and wa-webhook
// (free-form messages during the 24hr conversation window).
//
// Env vars required (set via `supabase secrets set ...`):
//   META_PHONE_ID       — your WABA phone number ID
//   META_ACCESS_TOKEN   — permanent System User token
//   META_WEBHOOK_VERIFY_TOKEN — string you choose, paste into Meta dashboard
// ════════════════════════════════════════════════════════════════════

const META_API_VERSION = 'v21.0'

function metaUrl(path: string): string {
  const phoneId = Deno.env.get('META_PHONE_ID')
  if (!phoneId) throw new Error('META_PHONE_ID env var not set')
  return `https://graph.facebook.com/${META_API_VERSION}/${phoneId}/${path}`
}

function authHeaders(): HeadersInit {
  const token = Deno.env.get('META_ACCESS_TOKEN')
  if (!token) throw new Error('META_ACCESS_TOKEN env var not set')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// ── Send a TEMPLATE message (required for the first message to a user) ──
export async function sendTemplate(
  toPhone: string,
  templateName: string,
  languageCode: string = 'en',
  bodyParams: string[] = []
): Promise<{ ok: boolean; message_id?: string; error?: string }> {
  const body = {
    messaging_product: 'whatsapp',
    to: toPhone.replace(/\D/g, ''),  // Meta wants digits only
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(bodyParams.length > 0 && {
        components: [{
          type: 'body',
          parameters: bodyParams.map(p => ({ type: 'text', text: p }))
        }]
      })
    }
  }

  try {
    const res = await fetch(metaUrl('messages'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: JSON.stringify(data.error || data) }
    return { ok: true, message_id: data.messages?.[0]?.id }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Send a FREE-FORM text message (allowed within 24hr window) ──────
export async function sendText(
  toPhone: string,
  text: string
): Promise<{ ok: boolean; message_id?: string; error?: string }> {
  const body = {
    messaging_product: 'whatsapp',
    to: toPhone.replace(/\D/g, ''),
    type: 'text',
    text: { preview_url: true, body: text }
  }

  try {
    const res = await fetch(metaUrl('messages'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: JSON.stringify(data.error || data) }
    return { ok: true, message_id: data.messages?.[0]?.id }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Verify Meta webhook signature (HMAC-SHA256 over raw body) ───────
//
// Meta signs every webhook POST with X-Hub-Signature-256: sha256=<hex>
// computed using the App Secret. We must reject any request whose
// signature doesn't match — otherwise anyone could POST fake replies.
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false
  const expected = signatureHeader.slice('sha256='.length)

  const appSecret = Deno.env.get('META_APP_SECRET')
  if (!appSecret) {
    console.error('META_APP_SECRET not set — webhook signature cannot be verified')
    return false
  }

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody))
  const hex = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  // constant-time compare
  if (hex.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

// ── Helpers ─────────────────────────────────────────────────────────
export function generateMagicToken(): string {
  // 32 URL-safe characters — ~190 bits of entropy
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function normalizePhone(phone: string): string {
  // Accepts: +919876543210, 919876543210, 9876543210 → returns +919876543210
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return '+91' + digits
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits
  if (digits.length === 13 && digits.startsWith('091')) return '+' + digits.slice(1)
  return '+' + digits  // last-resort; caller should validate
}

export function isValidIndianMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  // Accept 91XXXXXXXXXX where X[0] ∈ {6,7,8,9}
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^[6-9]/.test(digits.slice(2))
  }
  if (digits.length === 10) return /^[6-9]/.test(digits)
  return false
}
