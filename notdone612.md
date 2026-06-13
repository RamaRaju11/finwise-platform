# Not Done (Deferred) — 2026-06-12

_Items intentionally not built when the Monthly Capture Habit initiative shipped (commit `a4de387`). Captured here so they aren't forgotten._

---

## 1. pg_cron migration not auto-applied

**What**: The cron schedule for `monthly-capture-reminder` is written but not yet activated.

**Where**:
- File: `supabase/migrations/20260610100000_monthly_capture_reminder_cron.sql`
- Function deployed: `monthly-capture-reminder` (already live)

**Why deferred**: `pg_cron` requires extension privileges on the Supabase project. I left the activation manual so you can review and consciously approve the recurring job before it starts firing emails.

**To activate**:
1. Open https://supabase.com/dashboard/project/ugtfdtdbegdjqrdtplkg/sql/new
2. Paste the contents of `supabase/migrations/20260610100000_monthly_capture_reminder_cron.sql`
3. Click Run
4. From then on, the function fires automatically at **04:30 UTC on the 3rd of every month** (= 10:00 IST)

**To verify after applying**:
```sql
select * from cron.job where jobname = 'monthly-capture-reminder';
```
Should show one row with the schedule `30 4 3 * *`.

**Risk of skipping**: monthly reminder emails never go out automatically. The function still works on manual invocation (POST to its URL) but no monthly habit is built.

---

## 2. Other save flows don't yet write `asOfMonth`

**What**: Only `modules/businessHealthScore.test.html` currently uses the new `asOfMonth` tagger. Other places where the user enters monthly numbers still save without a month tag.

**Files affected**:
- `onboarding.html` (`saveProfile()` at line ~427) — saves `fw_profile` but no `asOfMonth`
- `checkup.html` (Financial Checkup module) — likely saves financials, no tag
- `modules/cashRunway.test.html`
- `modules/profitMarginAnalyzer.test.html`
- `modules/cashFlowEngine.test.html`
- Possibly others — needs audit

**Why deferred**: Each file needs its own UI insertion + JS hookup. Doing them all at once would have been ~6 edits with bigger surface area for bugs. Better to validate the tagger UX on one module first (Business Health Score) before propagating.

**Recommended approach when picking up**:
1. Extract the asOfMonth tagger into a small **shared helper script** (`asof-month.js`) — single source of truth for the UI HTML, CSS, and JS
2. Include via `<script src="../asof-month.js"></script>` in each module
3. Call `getAsOfMonth()` wherever a save touches monthly data
4. Snapshot writes target `fw_monthly_snapshots[asOfMonth]` for consistency

**Risk of skipping**: users may save numbers in one module (e.g., onboarding in June) but the score history thinks it's the wrong month. Less impactful for static profile data, more impactful for live tools.

---

## 3. Email opt-out / settings page not built

**What**: The monthly reminder email's footer has "Manage reminders" linking to `dashboard.html?settings=alerts`. That query string isn't handled — clicking it just opens the dashboard with no alert-related UI.

**Where**:
- Email template: `supabase/functions/monthly-capture-reminder/index.ts` (line containing `?settings=alerts`)
- Target: `dashboard.html` does nothing with the query param

**Why deferred**: A proper preferences UI needs:
- Toggle for monthly reminder email (default ON)
- Toggle for health-drop alert email (already exists, also needs UI)
- Toggle for weekly digest (function exists, no UI)
- Persistence in a `user_preferences` Supabase table that the functions read

That's a meaningful chunk of work — 2-3 hours including the table migration. Shipping the reminder email first lets you validate it sends correctly before building unsubscribe machinery.

**To build later**:
1. SQL migration: add `user_preferences` table (`user_id PK`, `monthly_reminder bool`, `drop_alert bool`, etc., all default true)
2. New `alerts-prefs` Edge Function to read/write the table
3. New section in `dashboard.html` (or a separate `preferences.html`) — show toggles, save via the new function
4. Update `monthly-capture-reminder` to check `user_preferences.monthly_reminder` and skip users who opted out
5. Honor `?settings=alerts` query param by auto-scrolling to the preferences section

**Risk of skipping**:
- **Compliance/anti-spam**: any commercial email should have an unsubscribe link that works. Currently the link is broken. CAN-SPAM (US) requires honored opt-out within 10 business days. India IT Act doesn't strictly require but standard practice.
- **User trust**: a broken "Manage reminders" link looks careless. First-time recipients may report as spam.

**Minimum-viable fix if not building the full preferences page**:
- Change the email footer link to a `mailto:reminders@bizsco.in?subject=Unsubscribe` link
- Manually process unsubscribe requests until preferences UI is built
- Add a `user_preferences` row insert in the function: track who has unsubscribed

---

## Suggested order if/when these are picked up

1. **Quick win**: change opt-out link to `mailto:` so the unsubscribe path isn't broken (5 min)
2. **Then**: apply pg_cron migration once you're ready for emails to actually fire monthly (5 min)
3. **Later**: propagate `asOfMonth` to other save flows via shared helper (~2 hours)
4. **Eventually**: build proper preferences UI + table (~2-3 hours)

---

## Cross-references

- Original initiative spec: `indiapending.md` → "Monthly Capture Habit"
- Shipped pieces: commit `a4de387` ("Monthly Capture Habit: all 4 pieces shipped")
- Function URL (for manual invocation testing): `https://ugtfdtdbegdjqrdtplkg.supabase.co/functions/v1/monthly-capture-reminder`
