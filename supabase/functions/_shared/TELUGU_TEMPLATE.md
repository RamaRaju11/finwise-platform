# Telugu Meta Template — `bizsco_utility_te`

Submit at: https://developers.facebook.com/apps/1352144620104656/whatsapp-business/wa-manager/message-templates/

**Why this template**: Telugu support for Andhra Pradesh + Telangana SMB market (~95M Telugu speakers). Same UTILITY-safe transactional wording as English `bizsco_utility` and Hindi `bizsco_utility_hi`.

---

## Template details

| Field | Value |
|---|---|
| **Template name** | `bizsco_utility_te` |
| **Category** | **UTILITY** ← MUST be Utility, NOT Marketing |
| **Language** | Telugu (`te`) |
| **Header** | (skip) |
| **Footer** | (skip, or `Bizsco`) |
| **Buttons** | (skip) |

## Body (paste exactly)

```
నమస్తే {{1}},

మీ BizSco ఖాతా సెటప్ ప్రారంభమైంది.

సెటప్ పూర్తి చేయడానికి దయచేసి 5 చిన్న ప్రశ్నలకు సమాధానం ఇవ్వండి.

ప్రశ్న 1/5: మీ వ్యాపారం పేరు ఏమిటి?

కొనసాగించడానికి మీ సమాధానం పంపండి.
```

## Sample value for {{1}}

```
మిత్రమా
```

(Translates as "friend" — generic greeting wa-start passes for Telugu users.)

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

No code changes needed. `wa-start` already routes Telugu sessions to `bizsco_utility_te`. Verify approval status changes to **Active** before testing — if you click Send Message on Meta dashboard and the template isn't in the dropdown, it's not yet active.

## If Telugu language option isn't shown in Meta's template form

Meta supports Telugu (language code `te`) on WhatsApp Business Platform. If you can't find it in the language dropdown:
1. Make sure you're on the latest WhatsApp Manager (not legacy template manager)
2. Type "Telugu" or `te` in the language search box
3. Telugu sometimes appears as "Telugu (India) — te_IN" or just "Telugu — te"

Our code expects `te` as the language code. If Meta only offers `te_IN`, that's fine — our `welcomeTemplateFor` passes whatever code we configure; you can update `WELCOME_TEMPLATE_NAME_TE` constant in `questions.ts` if needed.

## If Meta auto-classifies as Marketing

Look at the popup warning before submission. Marketing-trigger words to avoid:
- "BizSco కి స్వాగతం" (Welcome to)
- "ఉచిత" (free)
- "ప్లాట్‌ఫారం" (platform) — promotional
- Emojis in headline

If rejected, simplify to:

```
నమస్తే {{1}},

మీ ఖాతా సెటప్ ప్రారంభమైంది.

ప్రశ్న 1/5: మీ వ్యాపారం పేరు ఏమిటి?

సమాధానం పంపి కొనసాగించండి.
```
