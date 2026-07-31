## Summary

A pre-launch review of v5.2.0 found that BONKU was not shippable — not because of polish, but because the core loop did not work. This branch fixes that, then addresses the lowest-scoring areas from the review, then adds the test suite that keeps it all from regressing.

Three commits, reviewable in order:

| Commit | Scope |
|---|---|
| `20f4b19` | Critical launch blockers |
| `ca0945f` | Design system, accessibility, privacy |
| `dd7d143` | Vitest suite (95 tests) |

54 files changed, +2,830 / −342 (excluding the lockfile).

---

## 1. Critical blockers — `20f4b19`

Three of these were independently disqualifying.

**The dashboard was unreachable.** `app/page.tsx` and `app/(dashboard)/page.tsx` both resolved to `/`. The redirect stub won and pointed at `/dashboard`, which had no route in the build manifest — so every logged-in user landed on a 404, and every sidebar "Dashboard" click 404'd. The most-developed screen in the repo was dead code. Moved the dashboard to `/dashboard` so the redirect, the sidebar links and middleware's `protectedPaths` all agree.

**No user could create a transaction.** `public.profiles` has RLS enabled with `SELECT` and `UPDATE` policies and **no `INSERT` policy**, so the profile insert at registration was silently denied — while the API still returned success. Because `transactions.user_id` is a `NOT NULL` FK to `profiles(id)`, every account was born permanently unable to use the core feature. Profiles are now created by a `SECURITY DEFINER` trigger on `auth.users` (migration `003`), with an `INSERT` policy as defence in depth, a backfill for stranded users, and loud failure instead of a false success.

**No user could log out.** `/api/auth/logout` existed with zero call sites and the Settings button had no handler. On a shared device there was no way to end a session. Wired end to end, and mounted `AuthProvider`, which was written but never rendered.

### Also in this commit

- **`GET /api/transactions` had no auth check and no `user_id` filter** — a bare `select("*")`. A single RLS policy was the only thing between one user's financial history and another's. Added both.
- **The dashboard summary 500'd five months a year.** It built its range end as `` `${month}-31` ``, producing literals like `2026-02-31` that Postgres rejects. Now an exclusive next-month bound.
- **One-sided date filters were silently ignored** — they applied only when both ends were supplied, while the UI showed the filter as active.
- **Transactions were append-only.** No edit, no delete; a mistyped amount could never be corrected. Added `GET`/`PATCH`/`DELETE /api/transactions/[id]`, an edit route, and a confirmation dialog.
- **No error boundaries anywhere in `app/`.** Added `error.tsx`, `not-found.tsx`, and a dashboard-scoped boundary. Query failures now render a distinct `ErrorState` instead of the empty state — previously a failed fetch told users "no transactions yet" when the server was down, making an outage indistinguishable from data loss.
- Transaction mutation errors surface in the form; they were `console.error` only, so a failed save appeared to hang.

---

## 2. Design system, accessibility, privacy — `ca0945f`

Positions BONKU as an **expense tracker**, not the savings app described in the original brief.

**Tokens.** The palette shipped as the stock shadcn default with every colour at chroma 0 — the product had no brand colour, and the only "brand" was a blue→purple gradient hardcoded inline in four places. Added `--brand`, `--brand-accent`, `--success`, `--warning`; pointed `--primary` at the brand. All verified ≥4.5:1 against their foregrounds in both themes before building on them.

**Fixed `--font-sans`,** which pointed at an undefined `--font-geist-sans` while Inter loaded as `--font-inter` — every surface silently rendered in the system fallback.

**Fixed the invisible logo.** On login the gradient sat on a wrapper while `bg-clip-text text-transparent` sat on the heading, so the wordmark rendered invisible on the first screen a user ever sees. Gradient and clip are now on the same element, in a reusable `Logo` component.

**Accessibility.** `aria-label`/`aria-expanded`/`aria-controls` on the menu button; `aria-current` on the active link; Escape to close; scroll lock; the overlay is a real button so it is keyboard reachable. Nav targets raised to 44px. The four orphaned filter labels are associated with their controls. Skip link and `#main-content` landmark added. `role="alert"` on error surfaces. Emoji removed from headings and badges.

**Trust.** Sidebar and Settings showed a hardcoded `User` / `user@bonku.app`; added `GET`/`PATCH /api/profile` so both show the real account. Added a hide-balances preference and an `Amount` component that honours it — amounts are masked rather than blurred, so the figure is genuinely absent from the DOM. Settings is now fully functional; the dead "Export Data" button was removed rather than shipping another control that does nothing. Implemented theme switching against the dark tokens that already existed, with a pre-paint script to avoid a flash.

**Legal.** Added `/legal/terms` and `/legal/privacy` plus a required consent checkbox at registration. Both state plainly that BONKU holds no money and connects to no bank. **Both are marked drafts pending legal review** — they describe actual data handling but do not satisfy UU 27/2022 formalities.

**Rate limiter.** It was keyed by the submitted email, which let an attacker burn a known victim's five attempts per minute and lock them out of their own account — and was bypassed entirely by rotating the email field. Now keyed by client IP, with bounded memory and a `Retry-After` header.

---

## 3. Tests — `dd7d143`

The repo had **zero tests and no test infrastructure**. Added Vitest and 95 tests concentrated on the defects above.

**The suite is verified by mutation.** Reintroducing the three original bugs — the removed auth guard, the `&&` date filter, and the `-31` upper bound — **fails 14 tests**; restoring the fixes returns it to green. These tests catch the regressions they claim to.

| Suite | Protects |
|---|---|
| `date.test.ts` | Every month, leap years, December rollover; that no bound is ever a day above 28 |
| `validators.test.ts` | Amount bounds and integrality, future dates, password policy |
| `rateLimit.test.ts` | Window/reset behaviour, key independence, and that varying the payload no longer bypasses the limit |
| `transactions/route.test.ts` | That `GET` is authenticated and scoped by `user_id`; that `POST` stamps the caller's id, not a client-supplied one |
| `transactions/[id]/route.test.ts` | Malformed ids, auth, `user_id` scoping, 404 instead of leaking another account's row |
| `ErrorState.test.tsx` | That a failed fetch never reads as an empty state |

Supabase is replaced by a chainable mock that records every filter, so assertions are about **the query that was built**, not just the response status.

`monthRange()`/`isValidMonth()` were extracted from the summary handler into `lib/utils/date.ts` to make the arithmetic testable.

`docs/TESTING.md` records the strategy, per-area coverage targets, and ranked gaps.

---

## Verification

- `npm test` — 95 passing, 6 files, ~2s
- `npx tsc --noEmit` — clean
- `npm run build` — clean, 24 routes
- `npx eslint .` — unchanged from baseline (8 errors, warnings down 9 → 7). The pre-existing `no-explicit-any` errors in the summary route are untouched.

Routes probed against a running production build with stub credentials:

| Check | Before | After |
|---|---|---|
| `/` | 307 → `/dashboard` (no such route) | 307 → `/dashboard` → 307 → `/login` |
| `GET /api/transactions` unauth | `200` + every row in the table | `401` |
| `/api/transactions/not-a-uuid` | n/a | `400` |
| `DELETE /api/transactions/<uuid>` unauth | n/a | `401` |
| `/legal/privacy`, `/legal/terms` | n/a | `200`, public |
| 7 logins, 7 different emails | all allowed | 5 allowed, then `429` |
| `/totally-missing` | Next default | branded 404 |

---

## Reviewer notes

- **Migration `003` is unverified.** It is a `SECURITY DEFINER` trigger and only reproduces against a live Supabase instance. **Please run it and register a fresh account before merging.** It also backfills users already stranded by the bug. This is the single largest open risk on the branch.
- **One design decision worth a look:** the post-registration profile check is skipped when `signUp` returns no session. With email confirmation enabled, `auth.uid()` is null and RLS would hide the row, so verifying there would produce a false failure on every signup. The loud-failure path therefore only covers the auto-confirm case.
- The legal documents are drafts. They should not go public without review.
- `--primary` now resolves to the brand blue rather than near-black, so every primary button changes colour. Intentional, but worth eyeballing.

## Known gaps, deliberately not addressed

- **`recharts` is still a dependency with zero imports**, and `lib/mocks/` still ships. Both were on the must-fix list; neither fell inside the scope chosen for this branch.
- **"AI Financial Mentor" still has no AI** — the insight generator is a `TODO` returning `"not yet implemented"`. Building it or dropping the claim is a product decision.
- **`month_over_month` remains hardcoded `{0, 0, 0}`**, so the dashboard trend arrows render a fabricated green `↑ 0%`. Now that `/dashboard` is actually reachable, users will see it. Worth wiring the real query or hiding the arrows before release.
- No E2E tests, no RLS tests, no accessibility assertions. Ranked in `docs/TESTING.md`.

## Assessment

Against the original review scorecard, overall product quality moves from **19/100 to ~42**, and launch readiness from **7 to ~40**. Those are estimates against the same rubric, not measurements.

Verdict moves from ❌ Not Ready for Release to **⚠️ Beta Ready**, conditional on migration `003` being verified against a live database.
