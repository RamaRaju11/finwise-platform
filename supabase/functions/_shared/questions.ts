// ════════════════════════════════════════════════════════════════════
// 5-question onboarding flow for India WhatsApp signup.
// Each question has: prompt text, validator, and normalizer.
// The state machine in wa-webhook reads from this array.
// ════════════════════════════════════════════════════════════════════

export interface Question {
  key: string                                          // stored in answers JSONB
  prompt: string                                       // text sent on WhatsApp
  validate: (reply: string) => { ok: boolean; error?: string }
  normalize: (reply: string) => Record<string, string> // values to merge into answers
}

const INDUSTRIES = ['Retail', 'Restaurant', 'Services', 'Manufacturing', 'Other']
const INDUSTRY_EMOJI: Record<string, string> = {
  'Retail': '🛒', 'Restaurant': '🍽️', 'Services': '🛠️', 'Manufacturing': '🏭', 'Other': '🏢'
}

const REVENUE_BANDS = [
  '<₹1 lakh / month',
  '₹1 lakh – ₹5 lakhs / month',
  '₹5 lakhs – ₹25 lakhs / month',
  '₹25 lakhs – ₹1 crore / month',
  '₹1 crore+ / month'
]

const WORRIES = [
  'Cash running out',
  'Need a loan',
  'Too much debt',
  'Tax confusion',
  'Just exploring'
]
const WORRY_KEYS: Record<string, string> = {
  'Cash running out': 'cash',
  'Need a loan': 'loan',
  'Too much debt': 'debt',
  'Tax confusion': 'tax',
  'Just exploring': 'exploring'
}

function pickFromList(reply: string, list: string[]): string | null {
  const n = parseInt(reply.trim(), 10)
  if (!isNaN(n) && n >= 1 && n <= list.length) return list[n - 1]
  // accept exact text match (case-insensitive) as fallback
  const match = list.find(item => item.toLowerCase() === reply.trim().toLowerCase())
  return match || null
}

export const QUESTIONS: Question[] = [
  // Q1 — business name
  {
    key: 'biz_name',
    prompt: "Q1/5: What's your business name?\n\n(Just type your reply 👇)",
    validate: (r) => {
      const v = r.trim()
      if (v.length < 2) return { ok: false, error: 'Please type your business name (at least 2 characters).' }
      if (v.length > 80) return { ok: false, error: 'A bit too long — keep it under 80 characters.' }
      return { ok: true }
    },
    normalize: (r) => ({ biz_name: r.trim() })
  },

  // Q2 — industry
  {
    key: 'industry',
    prompt:
      "Q2/5: Which industry?\n\n" +
      INDUSTRIES.map((v, i) => `${i + 1}. ${v}`).join('\n') +
      "\n\n(Reply with the number — 1, 2, 3, 4 or 5)",
    validate: (r) => {
      const v = pickFromList(r, INDUSTRIES)
      return v ? { ok: true } : { ok: false, error: 'Please reply with a number from 1 to 5.' }
    },
    normalize: (r) => {
      const v = pickFromList(r, INDUSTRIES)!
      return { industry: v, industry_emoji: INDUSTRY_EMOJI[v] || '🏢' }
    }
  },

  // Q3 — monthly revenue band
  {
    key: 'revenue_band',
    prompt:
      "Q3/5: Monthly revenue (₹)?\n\n" +
      REVENUE_BANDS.map((v, i) => `${i + 1}. ${v}`).join('\n') +
      "\n\n(Reply with the number)",
    validate: (r) => {
      const v = pickFromList(r, REVENUE_BANDS)
      return v ? { ok: true } : { ok: false, error: 'Please reply with a number from 1 to 5.' }
    },
    normalize: (r) => ({ revenue_band: pickFromList(r, REVENUE_BANDS)! })
  },

  // Q4 — biggest worry
  {
    key: 'worry',
    prompt:
      "Q4/5: Biggest worry right now?\n\n" +
      WORRIES.map((v, i) => `${i + 1}. ${v}`).join('\n') +
      "\n\n(Reply with the number — we'll personalize your dashboard around this)",
    validate: (r) => {
      const v = pickFromList(r, WORRIES)
      return v ? { ok: true } : { ok: false, error: 'Please reply with a number from 1 to 5.' }
    },
    normalize: (r) => {
      const v = pickFromList(r, WORRIES)!
      return { worry: v, worry_key: WORRY_KEYS[v] || 'exploring' }
    }
  },

  // Q5 — city
  {
    key: 'city',
    prompt: "Q5/5: Which city? 📍\n\n(Just type — we'll use it to find state-specific grants and schemes for you.)",
    validate: (r) => {
      const v = r.trim()
      if (v.length < 2) return { ok: false, error: 'Please type a city name.' }
      if (v.length > 60) return { ok: false, error: 'Too long — please use a shorter city name.' }
      return { ok: true }
    },
    normalize: (r) => ({ city: r.trim() })
  }
]

// ── Initial template (Q1 inside an approved Meta template) ─────────
// Meta requires the first message after a user signs up via the web
// to be a pre-approved TEMPLATE message (not free-form). After they
// reply, the 24-hour conversation window opens — Q2-Q5 are free-form.
export const WELCOME_TEMPLATE_NAME = 'bizsco_welcome'
export const WELCOME_TEMPLATE_LANG = 'en'
