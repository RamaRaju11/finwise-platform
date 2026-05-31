# 530 Priority — Tasks during Meta template approval window

_Created: 2026-05-30_
_Context: `bizsco_welcome` template "In review" with Meta. ~24hr async wait. This file tracks high-leverage work to do meanwhile._

---

## 🥇 TOP 3 — Critical path (do in order, ~1 hour total)

### Task 1 — Seed test user + verify live `login.html` works end-to-end
**Status**: ⏳ Pending
**Time**: 5 min
**Why**: Proves the entire deployed backend (`verify-token` Edge Function + `users_in` + `magic_links` tables) actually works with real data. Without this, you have no idea if your deployment is broken until the WhatsApp flow goes live.

**Steps**:
1. Open https://supabase.com/dashboard/project/ugtfdtdbegdjqrdtplkg/sql/new
2. Paste contents of `supabase/seed_test_user.sql` → Run
3. Confirm 2-row result appears (user + token)
4. Open https://ramaraju11.github.io/finwise-platform/login.html?t=test_token_priya_kirana
5. Should render Priya Kirana Store's dashboard (real data, NOT mock — no dev badge)
6. Also test: `?t=garbage` → "Invalid link", `?t=mock_demo_user` → mock fallback

**Acceptance**: Live login URL renders real DB data, all error states behave correctly.

---

### Task 2 — Build `privacy.html` + `terms.html`
**Status**: ⏳ Pending
**Time**: 20 min
**Why blocked by absence**:
- Razorpay KYC requires Privacy URL + Terms URL during company onboarding
- Meta App publishing (required to leave dev mode and message non-test users) requires Privacy Policy URL
- Public users will want these footer links to actually work
- WABA upgrade later asks for these

**Steps (I'll handle this)**:
- Match BizSco design system (indigo `#4f46e5`, Inter font, dark hero gradient)
- Cover: data collection, WhatsApp usage, payment processing, GDPR + DPDP Act 2023 compliance
- Footer links wired up properly
- Subscription terms: cancellation, refund policy, GST invoicing

**Acceptance**: Two clean, professional pages at `privacy.html` and `terms.html`, linked from footer, ready to submit to Meta + Razorpay.

---

### Task 3 — Add HELP / RESTART / STATUS commands to `wa-webhook`
**Status**: ⏳ Pending
**Time**: 30 min
**Why**: Real users drop off mid-flow constantly. Without this, they're stuck — they message again and get told "visit website to start over". Bad UX.

**Behavior to add**:
- User texts `HELP` → bot explains where they are, options to resume/restart
- User texts `RESTART` → resets `current_step` to 1, re-sends Q1
- User texts `STATUS` → tells user which question they're on
- Smart fallback: if user replies with a non-answer (e.g. "hi"), gently re-send the current question with a tip

**Acceptance**: Edit `supabase/functions/wa-webhook/index.ts`, redeploy, document the commands in a footer message.

---

## 🥈 MID-PRIORITY (if more time, ~2-4 hours total)

### Task 4 — Mobile responsiveness audit
**Status**: ⏳ Pending
**Time**: 30 min
**Action**: Open `whatsapp-start.html`, `login.html`, `subscribe.html` on actual phone (or Chrome DevTools mobile view). Fix what breaks: tap targets, scrolling, modal sizes, font scaling.

### Task 5 — Magic-link refresh function
**Status**: ⏳ Pending
**Time**: 45 min
**Action**: New Edge Function `magic-link-refresh` — POST `{phone}` → re-issues a fresh 1hr token if user has a completed `wa_sessions` entry. Avoids forcing re-answer of 5 Qs.

### Task 6 — Hindi localization
**Status**: ⏳ Pending
**Time**: 1.5 hrs
**Action**:
- Translate the 5 questions in `supabase/functions/_shared/questions.ts` to Hindi
- Submit Hindi version of `bizsco_welcome` template (separate Meta approval, also 24hr)
- Localize `login.html` and `subscribe.html` using existing `country-switcher.js` `data-cn` pattern
- Detect language from user's first reply (Devanagari script → switch to Hindi)

---

## 🥉 MARKETING / VALIDATION (no coding)

### Task 7 — Share `whatsapp-demo.html` with 5-10 friends
**Status**: ⏳ Pending
**Time**: 30 min
**Action**: Send https://ramaraju11.github.io/finwise-platform/whatsapp-demo.html to a small audience. Ask: "Would you actually sign up via WhatsApp like this?" Note the feedback.

### Task 8 — Record `whatsapp-demo.html` as Reel
**Status**: ⏳ Pending
**Time**: 30 min
**Action**: Press `F` on the demo page → fullscreen → screen-record with Win+G or OBS. Trim to ~30 sec in CapCut. Add free music from YouTube Audio Library. Post as YouTube Short with #SmallBusinessIndia #WhatsAppOnboarding #BizSco.

### Task 9 — Pre-draft Hindi Meta template
**Status**: ⏳ Pending
**Time**: 30 min
**Action**: Write the Hindi version of `bizsco_welcome` template body. Keep ready to submit once English approves (and you've gotten the hang of Meta's template UI).

---

## 📋 EXECUTION ORDER

Working through in this order (one at a time):

1. ✅ Task 1 — Seed + test (mostly your action)
2. ⏳ Task 2 — Privacy + Terms (my code)
3. ⏳ Task 3 — HELP commands (my code)
4. ⏳ Tasks 4, 5, 6 — only if time allows after 1-3
5. ⏳ Tasks 7, 8, 9 — your action when convenient

---

## 🔗 Related files

- `indiapending.md` — full pending tracker
- `.claude/memory/project_india_whatsapp_login.md` — memory snapshot
- `supabase/seed_test_user.sql` — for Task 1
- `supabase/functions/wa-webhook/index.ts` — for Task 3
