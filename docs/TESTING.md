# Testing Strategy

BONKU had no tests and no test infrastructure. This document records what is
covered now, what deliberately is not, and what to add next.

```bash
npm test            # single run
npm run test:watch  # watch mode
npm run test:coverage
```

## Stack

| Tool | Role |
|---|---|
| Vitest | Runner for unit, integration and component tests |
| @testing-library/react | Component tests, queried by role and text |
| jsdom | DOM only where needed — opt in per file |

Default environment is `node`. Component suites opt in with a
`// @vitest-environment jsdom` docblock, which keeps the fast majority fast.

`@vitejs/plugin-react` is deliberately **not** installed: it resolves a
different Vite copy than Vitest does, which breaks `tsc --noEmit`. Vitest
transforms JSX via esbuild on its own; the plugin only adds Fast Refresh,
which tests do not use.

## Pyramid, as applied here

```
        /   E2E    \     none yet — needs a live Supabase (see Gaps)
       / Route tests \    2 suites, handlers called directly
      /  Pure logic   \   4 suites, no I/O
```

The shape is deliberate. Every bug that made the last release unusable was
either pure arithmetic or a missing guard in a route handler — neither needs a
browser to catch.

## What is covered

### Pure logic — `lib/utils/*.test.ts`

| Suite | Protects |
|---|---|
| `date.test.ts` | The month-boundary bug. Upper bounds were built as `` `${month}-31` ``, producing literals like `2026-02-31` that Postgres rejects; the dashboard summary returned 500 for five months a year. Covers every month, leap years, and the December→January rollover. |
| `validators.test.ts` | Transaction and registration schemas: amount floor/ceiling/integer, future dates, malformed dates, category required, password policy. |
| `rateLimit.test.ts` | Window behaviour, reset, key independence, `x-forwarded-for` parsing, and specifically that varying the payload no longer bypasses the limit. |

### Route handlers — `app/api/**/*.test.ts`

Handlers are imported and called directly with a `Request`. Supabase is
replaced by `lib/test/supabaseMock.ts`, a chainable builder that records every
filter, so tests assert on **the query that was built**, not just the response.

| Suite | Protects |
|---|---|
| `transactions/route.test.ts` | That `GET` is authenticated and scoped by `user_id` — it previously had neither, leaving one RLS policy as the only thing between users' financial histories. Also that one-sided date filters are applied, and that `POST` stamps the caller's id rather than any client-supplied one. |
| `transactions/[id]/route.test.ts` | That `GET`/`PATCH`/`DELETE` reject malformed ids, require auth, scope by `user_id` as well as `id`, and 404 rather than leak when a row belongs to someone else. |

### Components — `components/**/*.test.tsx`

| Suite | Protects |
|---|---|
| `ErrorState.test.tsx` | That a failed fetch never reads as an empty state. Previously "no transactions yet" was shown when the server was down, making an outage indistinguishable from data loss. |

## Verified by mutation

The suite was checked by reintroducing the three original bugs — the removed
auth guard, the `&&` date filter, and the `-31` upper bound. **14 tests failed.**
Restoring the fixes returned it to green. These tests catch the regressions
they claim to.

Re-run that check after any large refactor; a suite that cannot fail is not
protecting anything.

## Coverage targets

Deliberately not a single global number, which rewards testing trivia.

| Area | Target | Why |
|---|---:|---|
| `lib/utils/**` | 90% | Pure, cheap, and where the arithmetic bugs live |
| `app/api/**` | 80% | Security boundaries and data integrity |
| `components/shared/**` | 60% | Error and empty states, not styling |
| `components/ui/**` | 0% | Vendored shadcn primitives — upstream's job |
| `lib/mocks/**` | 0% | Should be deleted, not tested |

## Gaps — ranked

1. **The profile-creation trigger is untested.** Migration `003` is a
   `SECURITY DEFINER` trigger on `auth.users`, and the bug it fixes left every
   account unable to transact. It cannot be covered without a real Postgres.
   Highest-value next step: `supabase db start` in CI, then pgTAP or a
   integration suite asserting that inserting an auth user produces a profile
   and that RLS blocks cross-user reads.
2. **No RLS tests.** Route tests mock Supabase, so they verify the app's guard
   but not the database's. Both layers should be asserted independently.
3. **No E2E.** Register → add transaction → edit → delete → logout is the
   critical path and is currently only manually verified. Playwright against a
   seeded local Supabase.
4. **No test for the route structure itself.** The worst bug in the last
   release was a routing collision that made the dashboard 404. A cheap smoke
   test asserting the expected routes exist would have caught it.
5. **Form behaviour untested.** `TransactionForm` submit/error paths, and the
   hide-balances masking in `Amount`.
6. **No accessibility assertions.** `vitest-axe` on the main screens would
   turn the manual audit into a regression gate.

## Conventions

- Tests sit beside the code they cover, not in a parallel tree.
- One behaviour per test; the name states the behaviour, not the method.
- A comment above a regression test explains the bug it pins, so a future
  reader knows why the assertion is oddly specific.
- Query by role and accessible name, not by test id — that way the test
  fails when the UI becomes unusable to a screen reader.
