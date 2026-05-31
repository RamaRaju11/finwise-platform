# Hindi Meta Template to Submit

Submit this in Meta Business Suite → WhatsApp → Message Templates → Create Template.

**Why a separate template**: Meta requires each language as a distinct approved template. Even though we have `bizsco_welcome` (English) approved, Hindi needs its own. Submit this AFTER the English one is approved so you have a working version while waiting (~24 hr).

---

## Template details

| Field | Value |
|---|---|
| **Template name** | `bizsco_welcome_hi` |
| **Category** | UTILITY |
| **Language** | Hindi (`hi`) |
| **Header** | None |
| **Footer** | (optional) `Powered by BizSco` |
| **Buttons** | None |

## Body (paste exactly)

```
नमस्ते {{1}}! 👋 BizSco में आपका स्वागत है — भारत के SMB के लिए मुफ्त वित्तीय प्लेटफ़ॉर्म।

आपका डैशबोर्ड व्यक्तिगत बनाने के लिए 5 त्वरित प्रश्न:

प्रश्न 1/5: आपके व्यवसाय का नाम क्या है?

(कृपया अपना उत्तर टाइप करें 👇)
```

## Sample value for {{1}}

```
मित्र
```

(Translates as "friend" — this is the generic greeting wa-start passes for Hindi users.)

---

## After approval

Once status changes from **In review** → **Approved**:

1. No code changes needed — `wa-start` already routes Hindi sessions to `bizsco_welcome_hi`
2. Test on whatsapp-start.html — switch to हिंदी toggle, submit your test number
3. You'll receive the welcome message in Hindi instead of English

## If Meta rejects

Common rejection reasons:
- Marketing-like language → fix: keep it informational, no "Get!" or "Click!"
- Missing variable sample → fix: ensure {{1}} sample value is filled
- Banned phrases → fix: avoid "free money", "guaranteed", or anything financial-promotional

Resubmit with adjustments — usually approved on second try within 24 hr.
