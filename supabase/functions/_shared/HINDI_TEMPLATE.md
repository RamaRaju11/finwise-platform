# Hindi Meta Template — `bizsco_utility_hi`

Submit at: https://developers.facebook.com/apps/1352144620104656/whatsapp-business/wa-manager/message-templates/

**Why this version**: Original wording ("Welcome to BizSco — India's free SMB financial platform") got auto-classified as Marketing by Meta's AI, which silently fails delivery in test mode. This rewrite uses transactional UTILITY-safe language (same pattern as approved English `bizsco_utility`).

---

## Template details

| Field | Value |
|---|---|
| **Template name** | `bizsco_utility_hi` |
| **Category** | **UTILITY** ← MUST be Utility, NOT Marketing |
| **Language** | Hindi (`hi`) |
| **Header** | (skip) |
| **Footer** | (skip, or `Bizsco`) |
| **Buttons** | (skip) |

## Body (paste exactly)

```
नमस्ते {{1}},

आपका BizSco खाता सेटअप शुरू हो गया है।

सेटअप पूरा करने के लिए कृपया 5 छोटे प्रश्नों के उत्तर दें।

प्रश्न 1/5: आपके व्यवसाय का नाम क्या है?

जारी रखने के लिए अपना उत्तर भेजें।
```

## Sample value for {{1}}

```
मित्र
```

(Translates as "friend" — generic greeting wa-start passes for Hindi users.)

## English meaning of the body

> Hello {{1}},
>
> Your BizSco account setup has been initiated.
>
> Please answer 5 short questions to complete setup.
>
> Question 1/5: What is your business name?
>
> Reply with your answer to continue.

---

## After Meta approves

No code changes needed. `wa-start` already routes Hindi sessions to `bizsco_utility_hi`. Verify approval status changes to **Active** before testing — if you click Send Message on Meta dashboard and the template isn't in the dropdown, it's not yet active.

## If Meta auto-classifies as Marketing again

Look at the popup warning before submission. If Meta says "this template contains marketing content", DO NOT proceed. Instead, simplify the body further. Marketing-trigger words to avoid:
- "Welcome to", "platform", "free", "offer"
- Brand promotional phrases
- Emojis in headline (👋 is risky)

If still rejected, fall back to:

```
नमस्ते {{1}},

आपका खाता सेटअप ప్రారంభమైంది.

प्रश्न 1/5: आपके व्यवसाय का नाम क्या है?

उत्तर देकर जारी रखें।
```

(More terse, more clearly transactional.)
