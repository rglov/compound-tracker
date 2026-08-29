# Compound Tracker Rebuild — Plan Index

**Spec:** `docs/superpowers/specs/2026-08-29-compound-tracker-rebuild-design.md`
**Parity baseline:** commit `058e0ed` in the legacy repo.

The spec covers roughly 25 features across six subsystems — too much for one
implementation plan. It is split into six plans, each of which produces
working, testable software on its own.

| # | Plan | Delivers | Depends on |
|---|---|---|---|
| 1 | Foundation | Deployed, sign-in-able app: full Postgres schema, Clerk auth, tab-bar shell, PWA install, CI | — |
| 2 | PK core + compound library | Ported decay math with tests; seeded compound library; browse, search, detail; custom compounds; blends | 1 |
| 3 | Hero loop | Dose logger sheet, body map, dashboard (active-in-system, decay chart, adherence heatmap), history | 1, 2 |
| 4 | Cycles | Cycle builder, schedule generation, adherence, reconciliation, review + archive | 1, 2, 3 |
| 5 | Stock | Inventory, orders, supplies + usage rules, reconstitution calculator, batch tests + Blob upload | 1, 2 |
| 6 | Migration + cutover | Legacy import script, bloodwork, settings, export/import, E2E hero-loop test, production cutover | all |

Plans 3 and 5 are independent of each other and can run in parallel once 2 lands.

## Spec corrections folded into the plans

Three points where the spec is out of date against Next.js 16. The plans use
the corrected form; the spec is left as the design record.

1. **`middleware.ts` → `proxy.ts`.** Next.js 16 renames the file, the exported
   function (`middleware` → `proxy`), and the config export (`config` →
   `proxyConfig`). Spec §2 and §5 use the old names. Plan 1, Task 8.
2. **The dose-logger sheet needs an intercepting route.** Spec §4 shows
   `@sheet/log/page.tsx`, which is a plain parallel slot and will not produce
   the "sheet over the current tab, full page on direct link" behavior it
   describes. The correct shape is `@sheet/(.)log/page.tsx` (interceptor) plus
   a real `log/page.tsx`, plus a required `@sheet/default.tsx`. Plan 1, Task 9.
3. **`revalidateTag` is now two-arg.** Next.js 16 deprecates
   `revalidateTag(tag)` in favour of `revalidateTag(tag, profile)`. Spec §2
   uses the single-arg form. Plans 3–5.

## Spec gaps found while planning

Not corrected in the spec because they only affect one plan each; recorded
here so they are not lost.

- **The compound library is two tables today, not one.** `COMPOUND_LIBRARY`
  (`compounds.js`, 46 entries) carries dosing defaults — `category`,
  `halfLifeHours`, `defaultUnit`, `defaultRoute`, `color`.
  `LIBRARY_DATA` (`library.js`, 67 entries) carries reference content —
  `goodWith`, `notGoodWith`, `benefits`, `tags`, `protocols`, `sideEffects`,
  `notes`. They are joined by name. Spec §3's `Compound` entity has fields for
  the first and none of the second. The schema in Plan 1 Task 4 carries both;
  the merge and its name-collision handling are Plan 2.
- **There is no `aliases` array.** Spec §3 gives `Compound.aliases text[]`, but
  the current "alias matching" (`dose-logger.js:48`) is a substring search over
  name, category, and the library entry's `notes`, `tags`, and `benefits`.
  Plan 2 implements it as a Postgres full-text search over those columns and
  drops the unused `aliases` field.
