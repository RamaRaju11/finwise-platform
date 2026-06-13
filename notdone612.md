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

## 2. Other save flows don't yet write `asOfMonth` ✅ MOSTLY RESOLVED 2026-06-12

**Status**: Shared helper built and propagated to the 3 main save points.

**What's done now**:
- New shared script: `/asof-month.js` exposes `window.getAsOfMonth()`, `monthLabel()`, `monthOffsetFromNow()`, and auto-mounts the toggle UI into any `<div data-asof-month></div>` placeholder.
- `modules/businessHealthScore.test.html` — refactored to use shared helper (removed inline copy)
- `onboarding.html` — toggle added below the "Loan Amount You Need" field; `saveProfile()` writes `fw_profile.asOfMonth` + mirrors numbers to `fw_monthly_snapshots[asOfMonth]`
- `checkup.html` — toggle added below the 4 monthly inputs; checkup run writes `fw_score_history` entries with `asOfMonth` + mirrors to `fw_monthly_snapshots[asOfMonth]` with healthScore + grade

**Still pending** (smaller, lower priority):
- `modules/cashRunway.test.html` — uses monthly inputs but rarely saves; would be nice for completeness
- `modules/profitMarginAnalyzer.test.html`
- `modules/cashFlowEngine.test.html`
- Any other module that calls `localStorage.setItem('fw_monthly_snapshots', ...)` directly

**Why these are lower priority**: they're calculators that read/compute on the fly, not primary save points. Users mostly enter their monthly profile through onboarding or checkup. Health Score / Score History pages stay accurate.

**How to add to any remaining module**:
1. Add `<script src="../asof-month.js"></script>` to the `<head>`
2. Add `<div data-asof-month></div>` somewhere near the financial inputs
3. In the save handler, call `window.getAsOfMonth()` to get the chosen `'YYYY-MM'`
4. Write to `fw_monthly_snapshots[selectedMonth]` (upsert pattern — `if(!snaps[key]) snaps[key] = {}`)

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
