// ════════════════════════════════════════════════════════════════════
// 5-question onboarding flow for India WhatsApp signup.
// Supports English (en), Hindi (hi), and Telugu (te). Selection happens
// at signup via the `language` column on wa_sessions.
//
// Each question has: prompt text, validator, and normalizer.
// The validator/normalizer is shared across languages (works on the
// numeric reply "1"-"5" plus the English canonical text), so only
// the PROMPT text changes between languages.
// ════════════════════════════════════════════════════════════════════

export type Language = 'en' | 'hi' | 'te'

export interface Question {
  key: string                                          // stored in answers JSONB
  prompt: string                                       // text sent on WhatsApp
  validate: (reply: string) => { ok: boolean; error?: string }
  normalize: (reply: string) => Record<string, string> // values to merge into answers
}

// ── Canonical industry/revenue/worry data (kept in English for storage) ──
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

// Display labels per language for the numbered lists
const INDUSTRIES_HI = ['खुदरा (Retail)', 'रेस्तरां (Restaurant)', 'सेवाएँ (Services)', 'विनिर्माण (Manufacturing)', 'अन्य (Other)']
const REVENUE_BANDS_HI = [
  '₹1 लाख से कम / महीना',
  '₹1 लाख – ₹5 लाख / महीना',
  '₹5 लाख – ₹25 लाख / महीना',
  '₹25 लाख – ₹1 करोड़ / महीना',
  '₹1 करोड़+ / महीना'
]
const WORRIES_HI = [
  'नकदी समाप्त हो रही है',
  'ऋण की आवश्यकता है',
  'बहुत अधिक कर्ज है',
  'कर भ्रम',
  'बस खोज रहे हैं'
]

const INDUSTRIES_TE = ['చిల్లర వ్యాపారం (Retail)', 'రెస్టారెంట్ (Restaurant)', 'సేవలు (Services)', 'తయారీ (Manufacturing)', 'ఇతరములు (Other)']
const REVENUE_BANDS_TE = [
  '₹1 లక్ష కంటే తక్కువ / నెల',
  '₹1 లక్ష – ₹5 లక్షలు / నెల',
  '₹5 లక్షలు – ₹25 లక్షలు / నెల',
  '₹25 లక్షలు – ₹1 కోటి / నెల',
  '₹1 కోటి+ / నెల'
]
const WORRIES_TE = [
  'నగదు అయిపోతోంది',
  'రుణం అవసరం',
  'చాలా అప్పులు ఉన్నాయి',
  'పన్ను గందరగోళం',
  'కేవలం పరిశీలిస్తున్నాను'
]

function pickFromList(reply: string, list: string[]): string | null {
  const n = parseInt(reply.trim(), 10)
  if (!isNaN(n) && n >= 1 && n <= list.length) return list[n - 1]
  // accept exact text match (case-insensitive) as fallback
  const match = list.find(item => item.toLowerCase() === reply.trim().toLowerCase())
  return match || null
}

// ════════════════════════════════════════════════════════════════════
// ENGLISH question set
// ════════════════════════════════════════════════════════════════════
const QUESTIONS_EN: Question[] = [
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

// ════════════════════════════════════════════════════════════════════
// HINDI question set (uses same validators against canonical English
// values, so storage stays consistent regardless of UI language)
// ════════════════════════════════════════════════════════════════════
const QUESTIONS_HI: Question[] = [
  {
    key: 'biz_name',
    prompt: "प्रश्न 1/5: आपके व्यवसाय का नाम क्या है?\n\n(कृपया अपना उत्तर टाइप करें 👇)",
    validate: (r) => {
      const v = r.trim()
      if (v.length < 2) return { ok: false, error: 'कृपया अपने व्यवसाय का नाम लिखें (कम से कम 2 अक्षर)।' }
      if (v.length > 80) return { ok: false, error: 'थोड़ा लंबा है — 80 अक्षरों से कम रखें।' }
      return { ok: true }
    },
    normalize: (r) => ({ biz_name: r.trim() })
  },
  {
    key: 'industry',
    prompt:
      "प्रश्न 2/5: आपका उद्योग कौन सा है?\n\n" +
      INDUSTRIES_HI.map((v, i) => `${i + 1}. ${v}`).join('\n') +
      "\n\n(संख्या के साथ उत्तर दें — 1, 2, 3, 4 या 5)",
    validate: (r) => {
      const v = pickFromList(r, INDUSTRIES)  // pick by NUMBER from canonical list
      return v ? { ok: true } : { ok: false, error: 'कृपया 1 से 5 के बीच संख्या भेजें।' }
    },
    normalize: (r) => {
      const v = pickFromList(r, INDUSTRIES)!
      return { industry: v, industry_emoji: INDUSTRY_EMOJI[v] || '🏢' }
    }
  },
  {
    key: 'revenue_band',
    prompt:
      "प्रश्न 3/5: मासिक राजस्व (₹) कितना है?\n\n" +
      REVENUE_BANDS_HI.map((v, i) => `${i + 1}. ${v}`).join('\n') +
      "\n\n(संख्या के साथ उत्तर दें)",
    validate: (r) => {
      const v = pickFromList(r, REVENUE_BANDS)
      return v ? { ok: true } : { ok: false, error: 'कृपया 1 से 5 के बीच संख्या भेजें।' }
    },
    normalize: (r) => ({ revenue_band: pickFromList(r, REVENUE_BANDS)! })
  },
  {
    key: 'worry',
    prompt:
      "प्रश्न 4/5: अभी आपकी सबसे बड़ी चिंता क्या है?\n\n" +
      WORRIES_HI.map((v, i) => `${i + 1}. ${v}`).join('\n') +
      "\n\n(संख्या के साथ उत्तर दें — हम आपका डैशबोर्ड इसी के अनुसार बनाएंगे)",
    validate: (r) => {
      const v = pickFromList(r, WORRIES)
      return v ? { ok: true } : { ok: false, error: 'कृपया 1 से 5 के बीच संख्या भेजें।' }
    },
    normalize: (r) => {
      const v = pickFromList(r, WORRIES)!
      return { worry: v, worry_key: WORRY_KEYS[v] || 'exploring' }
    }
  },
  {
    key: 'city',
    prompt: "प्रश्न 5/5: आप किस शहर में हैं? 📍\n\n(हम आपके राज्य के अनुसार अनुदान और योजनाएँ खोजेंगे।)",
    validate: (r) => {
      const v = r.trim()
      if (v.length < 2) return { ok: false, error: 'कृपया शहर का नाम लिखें।' }
      if (v.length > 60) return { ok: false, error: 'बहुत लंबा है — कृपया छोटा नाम लिखें।' }
      return { ok: true }
    },
    normalize: (r) => ({ city: r.trim() })
  }
]

// ════════════════════════════════════════════════════════════════════
// TELUGU question set
// ════════════════════════════════════════════════════════════════════
const QUESTIONS_TE: Question[] = [
  {
    key: 'biz_name',
    prompt: "ప్రశ్న 1/5: మీ వ్యాపారం పేరు ఏమిటి?\n\n(దయచేసి మీ సమాధానం టైప్ చేయండి 👇)",
    validate: (r) => {
      const v = r.trim()
      if (v.length < 2) return { ok: false, error: 'దయచేసి మీ వ్యాపారం పేరు రాయండి (కనీసం 2 అక్షరాలు).' }
      if (v.length > 80) return { ok: false, error: 'కొంచెం పొడవుగా ఉంది — 80 అక్షరాల కంటే తక్కువగా ఉంచండి.' }
      return { ok: true }
    },
    normalize: (r) => ({ biz_name: r.trim() })
  },
  {
    key: 'industry',
    prompt:
      "ప్రశ్న 2/5: మీ పరిశ్రమ ఏది?\n\n" +
      INDUSTRIES_TE.map((v, i) => `${i + 1}. ${v}`).join('\n') +
      "\n\n(సంఖ్యతో సమాధానం ఇవ్వండి — 1, 2, 3, 4 లేదా 5)",
    validate: (r) => {
      const v = pickFromList(r, INDUSTRIES)
      return v ? { ok: true } : { ok: false, error: 'దయచేసి 1 నుండి 5 మధ్య సంఖ్యను పంపండి.' }
    },
    normalize: (r) => {
      const v = pickFromList(r, INDUSTRIES)!
      return { industry: v, industry_emoji: INDUSTRY_EMOJI[v] || '🏢' }
    }
  },
  {
    key: 'revenue_band',
    prompt:
      "ప్రశ్న 3/5: నెలవారీ ఆదాయం (₹) ఎంత?\n\n" +
      REVENUE_BANDS_TE.map((v, i) => `${i + 1}. ${v}`).join('\n') +
      "\n\n(సంఖ్యతో సమాధానం ఇవ్వండి)",
    validate: (r) => {
      const v = pickFromList(r, REVENUE_BANDS)
      return v ? { ok: true } : { ok: false, error: 'దయచేసి 1 నుండి 5 మధ్య సంఖ్యను పంపండి.' }
    },
    normalize: (r) => ({ revenue_band: pickFromList(r, REVENUE_BANDS)! })
  },
  {
    key: 'worry',
    prompt:
      "ప్రశ్న 4/5: ఇప్పుడు మీ అతిపెద్ద ఆందోళన ఏమిటి?\n\n" +
      WORRIES_TE.map((v, i) => `${i + 1}. ${v}`).join('\n') +
      "\n\n(సంఖ్యతో సమాధానం ఇవ్వండి — మీ డాష్‌బోర్డ్‌ను దీని ప్రకారం రూపొందిస్తాము)",
    validate: (r) => {
      const v = pickFromList(r, WORRIES)
      return v ? { ok: true } : { ok: false, error: 'దయచేసి 1 నుండి 5 మధ్య సంఖ్యను పంపండి.' }
    },
    normalize: (r) => {
      const v = pickFromList(r, WORRIES)!
      return { worry: v, worry_key: WORRY_KEYS[v] || 'exploring' }
    }
  },
  {
    key: 'city',
    prompt: "ప్రశ్న 5/5: మీరు ఏ నగరంలో ఉన్నారు? 📍\n\n(మీ రాష్ట్రం ప్రకారం గ్రాంట్లు మరియు పథకాలను కనుగొంటాము.)",
    validate: (r) => {
      const v = r.trim()
      if (v.length < 2) return { ok: false, error: 'దయచేసి నగరం పేరు రాయండి.' }
      if (v.length > 60) return { ok: false, error: 'చాలా పొడవుగా ఉంది — చిన్న పేరు రాయండి.' }
      return { ok: true }
    },
    normalize: (r) => ({ city: r.trim() })
  }
]

// ── Public API ─────────────────────────────────────────────────────
export function getQuestions(lang: Language | string = 'en'): Question[] {
  if (lang === 'hi') return QUESTIONS_HI
  if (lang === 'te') return QUESTIONS_TE
  return QUESTIONS_EN
}

// Backward-compat: existing code that imports QUESTIONS keeps working.
export const QUESTIONS = QUESTIONS_EN

// ── Localized strings used by wa-webhook outside the question prompts
//    (validation errors, command responses, completion message) ──────
export const STRINGS: Record<Language, Record<string, string>> = {
  en: {
    coldStart:        "Hi! 👋 To start your BizSco signup, please visit:\n{url}\n\n_Already completed? Reply *LINK* for a fresh dashboard URL. Reply *HELP* for more options._",
    helpHeader:       "🆘 *BizSco Help*",
    helpOnStep:       "You're on Q{step}/5.",
    helpAfterDone:    "You finished onboarding 🎉",
    helpNoSession:    "You haven't started signup yet.",
    helpCommands:     "*Commands you can send:*\n• *RESTART* — start over from Q1\n• *STATUS* — see which question you're on\n• *LINK* — get a fresh dashboard login link\n• *STOP* — cancel and clear my data\n• *HELP* — show this menu\n\nOr just reply with your answer to continue. 👇\n\nNeed a human? Email hello@bizsco.in",
    restartedMsg:     "🔄 Starting over from Q1.\n\n",
    noSessionToRestart: "You don't have a signup in progress. Start here:\n{url}",
    statusHeader:     "📊 *Your progress*",
    statusBody:       "Step: Q{step}/5\nAnswered so far: {answered}\n\nReply to the question I sent you, or send *RESTART* to begin again.",
    statusCompleted:  "✅ You completed all 5 questions. Reply *LINK* to get a fresh dashboard link.",
    statusNoSession:  "You haven't started signup yet. Start here:\n{url}",
    stoppedMsg:       "👋 No worries — your signup is paused and your data has been cleared from active onboarding.\n\nTo start fresh anytime, visit:\n{url}",
    resendNotYetDone: "You haven't completed onboarding yet. Reply to your current question, or send *STATUS* to check progress.",
    resendSentMsg:    "🔗 Here's a fresh dashboard link (valid for 1 hour):\n\n{link}\n\n_Tap to open. Need help? Reply HELP._",
    completion:       "🎉 All done, {biz_name}!\n\nYour personalized BizSco dashboard is ready. Tap below to open it (valid for 1 hour):\n\n{link}\n\n_If the link expires, reply *LINK* to get a fresh one. Reply *HELP* for more options._",
    stuckHint:        "_Stuck? Reply *HELP* anytime._"
  },
  hi: {
    coldStart:        "नमस्ते! 👋 BizSco साइनअप शुरू करने के लिए, कृपया जाएँ:\n{url}\n\n_पहले से पूरा कर लिया? *LINK* भेजकर नया डैशबोर्ड लिंक पाएं। *HELP* से और विकल्प देखें।_",
    helpHeader:       "🆘 *BizSco सहायता*",
    helpOnStep:       "आप प्रश्न {step}/5 पर हैं।",
    helpAfterDone:    "आपने ऑनबोर्डिंग पूरी कर ली 🎉",
    helpNoSession:    "आपने अभी साइनअप शुरू नहीं किया है।",
    helpCommands:     "*आप ये कमांड भेज सकते हैं:*\n• *RESTART* — Q1 से फिर शुरू करें\n• *STATUS* — आप किस प्रश्न पर हैं देखें\n• *LINK* — नया डैशबोर्ड लिंक पाएं\n• *STOP* — रद्द करें और डेटा हटाएं\n• *HELP* — यह मेनू देखें\n\nया बस अपना उत्तर भेजें। 👇\n\nइंसान से बात करनी है? hello@bizsco.in पर ईमेल करें।",
    restartedMsg:     "🔄 Q1 से फिर शुरू कर रहे हैं।\n\n",
    noSessionToRestart: "आपका कोई साइनअप जारी नहीं है। यहाँ से शुरू करें:\n{url}",
    statusHeader:     "📊 *आपकी प्रगति*",
    statusBody:       "चरण: प्रश्न {step}/5\nअब तक उत्तर दिए: {answered}\n\nजो प्रश्न मैंने भेजा था उसका उत्तर दें, या *RESTART* से फिर से शुरू करें।",
    statusCompleted:  "✅ आपने सभी 5 प्रश्न पूरे कर लिए। नया लिंक पाने के लिए *LINK* भेजें।",
    statusNoSession:  "आपने अभी साइनअप शुरू नहीं किया है। यहाँ से शुरू करें:\n{url}",
    stoppedMsg:       "👋 कोई बात नहीं — आपका साइनअप रोक दिया गया है और डेटा साफ़ कर दिया गया है।\n\nफिर से शुरू करने के लिए कभी भी जाएँ:\n{url}",
    resendNotYetDone: "आपने अभी ऑनबोर्डिंग पूरी नहीं की है। अपने वर्तमान प्रश्न का उत्तर दें, या *STATUS* से प्रगति देखें।",
    resendSentMsg:    "🔗 यह रहा आपका नया डैशबोर्ड लिंक (1 घंटे के लिए मान्य):\n\n{link}\n\n_खोलने के लिए टैप करें। मदद के लिए HELP भेजें।_",
    completion:       "🎉 बहुत बढ़िया, {biz_name}!\n\nआपका व्यक्तिगत BizSco डैशबोर्ड तैयार है। 1 घंटे के लिए मान्य:\n\n{link}\n\n_अगर लिंक समाप्त हो जाए, *LINK* भेजकर नया लिंक पाएं। *HELP* से और विकल्प देखें।_",
    stuckHint:        "_अटक गए? कभी भी *HELP* भेजें।_"
  },
  te: {
    coldStart:        "నమస్తే! 👋 BizSco సైనప్ ప్రారంభించడానికి, దయచేసి వెళ్లండి:\n{url}\n\n_ఇప్పటికే పూర్తి చేశారా? *LINK* పంపి కొత్త డాష్‌బోర్డ్ లింక్ పొందండి. *HELP* కోసం మరిన్ని ఎంపికలు._",
    helpHeader:       "🆘 *BizSco సహాయం*",
    helpOnStep:       "మీరు ప్రశ్న {step}/5 వద్ద ఉన్నారు.",
    helpAfterDone:    "మీరు ఆన్‌బోర్డింగ్ పూర్తి చేశారు 🎉",
    helpNoSession:    "మీరు ఇంకా సైనప్ ప్రారంభించలేదు.",
    helpCommands:     "*మీరు ఈ కమాండ్‌లు పంపగలరు:*\n• *RESTART* — Q1 నుండి మళ్లీ ప్రారంభించండి\n• *STATUS* — మీరు ఏ ప్రశ్నపై ఉన్నారో చూడండి\n• *LINK* — కొత్త డాష్‌బోర్డ్ లింక్ పొందండి\n• *STOP* — రద్దు చేయండి మరియు డేటాను తీసివేయండి\n• *HELP* — ఈ మెనూ చూడండి\n\nలేదా కేవలం మీ సమాధానం పంపండి. 👇\n\nమనిషితో మాట్లాడాలా? hello@bizsco.in కి ఇమెయిల్ చేయండి.",
    restartedMsg:     "🔄 Q1 నుండి మళ్లీ ప్రారంభిస్తున్నాము.\n\n",
    noSessionToRestart: "మీకు సైనప్ జరగడం లేదు. ఇక్కడ నుండి ప్రారంభించండి:\n{url}",
    statusHeader:     "📊 *మీ ప్రగతి*",
    statusBody:       "దశ: ప్రశ్న {step}/5\nఇప్పటివరకు సమాధానాలు: {answered}\n\nనేను పంపిన ప్రశ్నకు సమాధానం ఇవ్వండి, లేదా *RESTART* ని పంపండి.",
    statusCompleted:  "✅ మీరు అన్ని 5 ప్రశ్నలను పూర్తి చేశారు. కొత్త లింక్ కోసం *LINK* పంపండి.",
    statusNoSession:  "మీరు ఇంకా సైనప్ ప్రారంభించలేదు. ఇక్కడ నుండి ప్రారంభించండి:\n{url}",
    stoppedMsg:       "👋 ఫరవాలేదు — మీ సైనప్ ఆపివేయబడింది మరియు డేటా తొలగించబడింది.\n\nమళ్లీ ప్రారంభించడానికి ఎప్పుడైనా వెళ్లండి:\n{url}",
    resendNotYetDone: "మీరు ఇంకా ఆన్‌బోర్డింగ్ పూర్తి చేయలేదు. మీ ప్రస్తుత ప్రశ్నకు సమాధానం ఇవ్వండి, లేదా *STATUS* పంపండి.",
    resendSentMsg:    "🔗 ఇదిగో మీ కొత్త డాష్‌బోర్డ్ లింక్ (1 గంట చెల్లుబాటు):\n\n{link}\n\n_తెరవడానికి టాప్ చేయండి. సహాయం కోసం HELP పంపండి._",
    completion:       "🎉 బాగుంది, {biz_name}!\n\nమీ వ్యక్తిగత BizSco డాష్‌బోర్డ్ సిద్ధంగా ఉంది. 1 గంట చెల్లుబాటు:\n\n{link}\n\n_లింక్ ముగిసిపోతే, *LINK* పంపి కొత్త లింక్ పొందండి. *HELP* కోసం మరిన్ని ఎంపికలు._",
    stuckHint:        "_చిక్కుబడి ఉన్నారా? ఎప్పుడైనా *HELP* పంపండి._"
  }
}

export function s(lang: Language | string, key: string, vars: Record<string, string | number> = {}): string {
  const lang2: Language = (lang === 'hi' || lang === 'te') ? lang : 'en'
  let txt = STRINGS[lang2][key] || STRINGS.en[key] || key
  for (const [k, v] of Object.entries(vars)) {
    txt = txt.replace(new RegExp('\\{' + k + '\\}', 'g'), String(v))
  }
  return txt
}

// ── Initial template (Q1 inside an approved Meta template) ─────────
// All UTILITY category (original bizsco_welcome was auto-classified as
// Marketing by Meta and silently failed delivery in test mode). The
// transactional wording in bizsco_utility passes UTILITY review.
// Hindi + Telugu need separate submissions — see _shared/HINDI_TEMPLATE.md
// and _shared/TELUGU_TEMPLATE.md for the exact bodies.
export const WELCOME_TEMPLATE_NAME_EN = 'bizsco_utility'
export const WELCOME_TEMPLATE_NAME_HI = 'bizsco_utility_hi'
export const WELCOME_TEMPLATE_NAME_TE = 'bizsco_utility_te'

export function welcomeTemplateFor(lang: Language | string): { name: string; languageCode: string } {
  if (lang === 'hi') return { name: WELCOME_TEMPLATE_NAME_HI, languageCode: 'hi' }
  if (lang === 'te') return { name: WELCOME_TEMPLATE_NAME_TE, languageCode: 'te' }
  // bizsco_utility was approved under language code 'en' (verified via Meta
  // 132001 error when trying en_US). Don't change unless template re-approved.
  return { name: WELCOME_TEMPLATE_NAME_EN, languageCode: 'en' }
}

// Backward compat (old wa-start may still import these)
export const WELCOME_TEMPLATE_NAME = WELCOME_TEMPLATE_NAME_EN
export const WELCOME_TEMPLATE_LANG = 'en'
