# Compound Tracker — Rebuild Design

**Date:** 2026-08-29
**Status:** Approved (brainstorming complete; implementation plan pending)
**Supersedes:** current Electron/vanilla-JS + JSON-file implementation
**Amended 2026-08-29:** added the cycle plan/schedule/adherence subsystem
(CycleEntry, ScheduledDose, reconciliation) that the first draft omitted,
plus the adherence heatmap, cycle tags, the `paused` status, and dose CSV
export/import. Parity baseline is commit `058e0ed`.

---

## 1. Overview

Rebuild the compound tracker as a phone-first, installable PWA hosted on Vercel with a Postgres-backed data model, replacing the current Electron + vanilla-JS + single-JSON-file implementation. Full feature parity with today's app is a v1 requirement; the rebuild is motivated by four concurrent problems in the current codebase: hard-to-change code (mega-files, tangled state), clunky/dated UI, an under-normalized data model, and a platform (Electron + web dual target, local JSON storage) that doesn't fit the actual usage pattern.

### Primary use case

**Daily dose logging on a phone, in the moment.** The user opens the app on their phone right before or right after administering a dose and needs to log it in the fewest possible taps. Everything else in the app (cycles, PK modeling, inventory, reconstitution, tests) exists to support this hero loop.

### Design direction

Apple Health / clinical calm: muted palette, generous whitespace, big-number displays, ring/line charts as focal points. Reads as a trustworthy tracking tool, not a consumer wellness app.

### Non-goals for v1

- Offline write flow (any mutation requires network; deferred to v2)
- Multi-user or cross-device real-time sync (single Clerk user; opening on desktop while phone is out-of-sync briefly is acceptable)
- Dose reminders / push notifications
- Batch test PDF OCR, QR-code scanning of test reports, or scraping of `janoshik.com/verify`
- Niimbot M2 label printing (deferred; noted as v2 with Web Bluetooth caveats for iOS)

---

## 2. Architecture

### Stack

- **Framework:** Next.js 16 (App Router, React Server Components, Server Actions, Cache Components / PPR)
- **UI:** shadcn/ui + Tailwind CSS
- **Charts:** Recharts
- **Auth:** Clerk (Vercel Marketplace) — magic-link + passkey
- **Database:** Neon Postgres (Vercel Marketplace)
- **ORM:** Drizzle
- **File storage:** Vercel Blob (for batch test report PDFs/images)
- **PWA:** Manifest + minimal service worker for app-shell caching (installability, not offline data)
- **Hosting:** Vercel (Fluid Compute defaults)

### Data flow

- **Reads:** Server Components query Drizzle directly. No client-side data fetching for initial render.
- **Writes:** Server Actions called from client `<form>` components, with `useOptimistic` for snappy dose-logger UX. `revalidatePath`/`revalidateTag` for post-mutation refresh.
- **Auth scoping:** Every Drizzle query passes through a `userScoped(userId)` helper. `middleware.ts` protects `(authed)/*` and redirects to `/sign-in`.
- **Offline:** Not supported in v1. If a Server Action fails, show a toast and let the user retry.

### Repo shape

New repo (e.g., `compound-tracker-web`). The current repo is left untouched during development and archived after 30 days of clean operation post-cutover. Legacy JSON snapshot preserved as `docs/legacy-import-snapshot.json` in the new repo.

---

## 3. Data model

Postgres schema managed via Drizzle. Every user-scoped table has `userId` (Clerk user ID) as the first filter in every query.

### Entities

#### Compound

Canonical registry — library seeds, user-created customs, and per-user library overrides all live in the same table.

- `id` (uuid, pk)
- `userId` (nullable — null for shared library seeds, set for user customs and overrides)
- `name` (text)
- `aliases` (text[])
- `type` (enum: `peptide` | `aas` | `hgh` | `ancillary`)
- `defaultHalfLifeHours` (numeric, nullable)
- `defaultUnit` (text)
- `defaultRoute` (enum: `intramuscular` | `subcutaneous` | `oral` | `intravenous` | `topical`)
- `defaultColor` (text)
- `tags` (text[])
- `notes` (text)
- `source` (enum: `library` | `custom` | `override`)
- `createdAt`, `updatedAt`

Overrides shadow library rows by name for a given user.

#### Blend

User-defined composition of multiple compounds.

- `id`, `userId`, `name`, `notes`, `createdAt`, `updatedAt`

#### BlendComponent

- `id`, `blendId` (fk), `compoundId` (fk), `amountPerMl` (numeric), `unit` (text)

Logging a blend dose creates one Dose row per component, all sharing a `blendGroupId`.

#### Cycle

- `id`, `userId`, `name`
- `startDate`, `endDate` (nullable — null means active)
- `status` (enum: `planned` | `active` | `paused` | `completed` | `archived`)
- `tags` (text[])
- `notes`, `reviewNotes` (post-cycle)
- `createdAt`, `updatedAt`

A cycle is not just a date-ranged container for doses — it is a **plan**
(CycleEntry rows) that generates a **schedule** (ScheduledDose rows), against
which actual logged doses are reconciled to produce an adherence figure.

#### CycleEntry

One protocol line: "500mcg Tesamorelin, subcutaneous, daily, for 90 days,
5 days on / 2 days off."

- `id`, `cycleId` (fk), `compoundId` (fk)
- `dose` (numeric), `unit` (text), `route` (enum)
- `frequency` (enum: `daily` | `2x_daily` | `3x_weekly` | `eod` | `weekly` | `every_n_days` | `custom_days`)
- `customFreqDays` (int, nullable — the N for `every_n_days`)
- `customDays` (int[], nullable — weekday indices for `custom_days`)
- `startDate` (date — may be later than the cycle's, for staggered starts)
- `durationDays` (int)
- `onDays`, `offDays` (int, nullable — on/off cycling within the entry)
- `sortOrder` (int)

Compound presentation (`color`, `halfLifeHours`, `category`) is read through
`compoundId` rather than copied onto the row, unlike today's model.

#### ScheduledDose

A generated slot, one row per planned administration.

- `id`, `cycleId` (fk), `cycleEntryId` (fk)
- `compoundId` (fk), `dose` (numeric), `unit` (text), `route` (enum)
- `scheduledAt` (timestamptz)
- `status` (enum: `pending` | `taken` | `skipped`)
- `loggedDoseId` (uuid, nullable, fk → Dose — set when a real dose satisfies the slot)

**Generation.** Saving a cycle regenerates the schedule from its entries.
Past slots that are already `taken` or `skipped` are preserved; only future
`pending` slots are recomputed, so editing a running cycle never rewrites
history. Multi-dose frequencies (`2x_daily`) expand to one slot per time of day.

**Reconciliation.** Logged doses are matched to pending slots by
`(compoundId, |administeredAt − scheduledAt| ≤ 24h)`, nearest first, in
chronological slot order. A given Dose can satisfy at most one slot —
`loggedDoseId` is unique — which is what prevents double-counting. Two
callers drive this: a sweep when a cycle view opens, and an immediate match
when a dose is logged outside the cycle flow.

**Adherence.** `taken` and `skipped` count regardless of whether the slot's
time has passed, since doses may be logged early. The denominator is
`max(past slots, taken + skipped)` so it can never fall below what the user
has actually done.

#### Dose (hot table)

- `id` (uuid, client-generated for idempotent submission)
- `userId`, `cycleId` (nullable — off-cycle logging allowed)
- `compoundId`, `blendGroupId` (nullable)
- `amount` (numeric), `unit` (text)
- `route` (enum matching Compound.defaultRoute)
- `site` (text — injection-site key)
- `administeredAt` (timestamptz)
- `halfLifeHoursSnapshot` (numeric — denormalized on purpose so historical decay math is stable across compound edits)
- `inventoryItemId` (nullable — links to the specific vial the dose was drawn from; enables auto-decrement)
- `notes`
- `createdAt`

#### InventoryItem

- `id`, `userId`, `compoundId`
- `format` (enum: `vial` | `tablet` | `capsule` | `powder` | `oral-solution`)
- `quantity`, `amountPerUnit`, `remainingAmount`, `unit`
- `concentrationMgPerMl` (numeric, nullable — set after reconstitution for vials)
- `reconstitutionVolumeMl` (numeric, nullable)
- `batchNumber` (text) — join key for BatchTest
- `capColor`, `expiresAt`, `receivedAt`, `cost`
- `orderId` (nullable, fk), `cycleId` (nullable, fk)
- `status` (enum: `in-stock` | `in-use` | `depleted` | `expired` | `discarded`)
- `notes`, `createdAt`, `updatedAt`

#### Order

- `id`, `userId`, `supplier`, `orderedAt`, `shippedAt`, `deliveredAt` (all nullable dates)
- `trackingNumber`, `totalCost`, `currency`, `status`, `notes`
- `createdAt`, `updatedAt`

#### OrderLineItem

- `id`, `orderId` (fk), `compoundId` (fk)
- `format`, `quantity`, `amountPerUnit`, `unit`
- `batchNumber`, `capColor`, `cost`, `tested` (bool)

(Test file storage moved out of OrderLineItem into BatchTest — see below.)

#### BatchTest

Third-party assay results, joined to inventory by batch number.

- `id`, `userId`, `compoundId`
- `batchNumber` — the join key against InventoryItem
- `lab` (text — `Janoshik`, `Simec`, etc.)
- `labTaskNumber`, `manufacturer`
- `testingOrderedAt`, `sampleReceivedAt`, `analysisConductedAt` (dates)
- `verifyUrl`, `verifyKey` (external verification link + key)
- `attachmentBlobUrl` (Vercel Blob URL for the original PDF/image)
- `notes`, `createdAt`, `updatedAt`

#### BatchTestAssay

- `id`, `batchTestId` (fk)
- `analyte` (text — `Tesamorelin`, `Purity`, `Endotoxin`, etc.)
- `values` (jsonb — `number[]` for multi-replicate readings)
- `unit` (text)

#### Supply

Consumables (needles, syringes, alcohol swabs, etc.).

- `id`, `userId`, `category`, `name`, `specs`, `quantity`, `unit`, `lowStockThreshold`, `notes`, `updatedAt`

#### SupplyUsageRule

Replaces the current JSON blob. One row per (route, supply, quantityPerDose) with optional `compoundId` for per-compound overrides.

- `id`, `userId`, `route` (enum), `supplyCategory`, `supplyName`, `quantityPerDose`
- `compoundId` (nullable — null = global default for the route, set = per-compound override)

#### Bloodwork

- `id`, `userId`, `drawnAt`, `marker`, `value`, `unit`, `lab`, `notes`

#### UserSetting

- `userId`, `key`, `value` (jsonb)

Starts with `enabledInjectionSites`.

### Key improvements over the current model

1. **Normalized `compoundId` everywhere** — dose, inventory, order line, blend component. Stops the current pattern of copying compound name/half-life/color onto every row. `halfLifeHoursSnapshot` on Dose is the only intentional denormalization (audit trail).
2. **Cycles are first-class:** doses explicitly belong to at most one cycle via `Dose.cycleId`, and the plan/schedule/adherence chain is relational (CycleEntry, ScheduledDose) rather than two JSON arrays hanging off a cycle object. `ScheduledDose.loggedDoseId` is a real FK with a unique constraint, so the "one dose satisfies one slot" rule is enforced by the database instead of by a `Set` in the reconciliation loop.
3. **Dose ↔ InventoryItem link** enables automatic `remainingAmount` decrement.
4. **Blends are relational**, not JSON — the UI can edit components individually.
5. **Supply usage rules are rows** — queryable and editable, not a blob.
6. **BatchTest is first-class**, keyed on batch number so one test applies to all inventory items from the same batch.
7. **User-scoped from day 1**, even though there is one user in practice.
8. **Client-generated Dose UUIDs** — idempotent retries.

---

## 4. App structure & routing

### Bottom-tab navigation (phone-first)

5 tabs, with the daily-logging action promoted to a center primary button:

```
┌─────────────────────────────────────┐
│                                     │
│         (page content)              │
│                                     │
├─────────────────────────────────────┤
│  Home   Cycles  [+ Log]  Lib  Stock │
└─────────────────────────────────────┘
```

- **Home** — dashboard: "active in your system" list, current-cycle context, today's logged doses, decay chart, 52-week adherence heatmap.
- **Cycles** — sectioned list (active/paused first, then planned, completed, archived). Each card shows status, compound pills, tags, and an adherence bar. Tap → detail (schedule with take/skip actions, dose list, chart, review form).
- **[+ Log]** — center action, opens the dose logger as a bottom-sheet modal (parallel intercepted route) on phone / full page on desktop.
- **Library** — searchable list of compounds + blends. Detail views for each. Custom-compound and blend builders live here.
- **Stock** — logistics cluster: inventory, orders, supplies, reconstitution calculator, batch tests.

Bloodwork, history (all doses), and settings sit behind a profile icon top-right — accessed less often.

### Directory layout

```
app/
├── layout.tsx                          ClerkProvider + ThemeProvider + PWA meta
├── sign-in/[[...rest]]/page.tsx        Clerk sign-in
├── (authed)/
│   ├── layout.tsx                      Tab bar + top nav; auth check
│   ├── page.tsx                        Home / dashboard
│   ├── @sheet/                         Parallel route for bottom-sheet modals
│   │   ├── default.tsx
│   │   └── log/page.tsx                Dose logger sheet
│   ├── cycles/
│   │   ├── page.tsx                    Sectioned list (active/planned/done)
│   │   ├── new/page.tsx                Cycle builder — entries + timeline
│   │   ├── [id]/page.tsx               Detail: schedule, adherence, review form
│   │   └── [id]/edit/page.tsx          Builder in edit mode
│   ├── library/
│   │   ├── page.tsx                    Search + list
│   │   ├── new/page.tsx                Custom compound builder
│   │   └── [compoundId]/page.tsx       Compound detail
│   ├── blends/new/page.tsx             Blend builder
│   ├── stock/
│   │   ├── page.tsx                    Inventory list
│   │   ├── [id]/page.tsx               Inventory item detail
│   │   ├── new/page.tsx                Add inventory item
│   │   ├── orders/page.tsx             Order list
│   │   ├── orders/new/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   ├── supplies/page.tsx
│   │   ├── supplies/rules/page.tsx
│   │   ├── tests/page.tsx              Batch test list
│   │   ├── tests/new/page.tsx
│   │   ├── tests/[id]/page.tsx
│   │   └── reconstitution/page.tsx
│   ├── bloodwork/page.tsx
│   ├── history/page.tsx
│   ├── settings/page.tsx
│   └── settings/data/page.tsx          Backup / export / import
```

### Rendering strategy

- **Cache Components (PPR)** on Home: shell (tab bar, section headings, current-cycle label) prerenders; "active in your system" + "today's doses" segments stream in.
- **Dose logger** intercepts as a modal — closing returns to the tab you were on. Deep-linkable at `/log`.
- **URL-state for filters** (Library search, History filters) so back-button behavior is correct.

---

## 5. Auth, PWA, and offline

### Clerk

- Install via Vercel Marketplace: `vercel integration add clerk` provisions env vars automatically.
- `<ClerkProvider>` in root layout; `middleware.ts` gates `(authed)/*`.
- Server Components call `auth()` → `userId` → passed into every Drizzle query via `userScoped(userId)` helper.
- Sign-in flow: magic link + passkey (Clerk defaults).

### PWA

- `app/manifest.ts` — name, icons (192, 512, maskable), theme colors, `display: "standalone"`, `orientation: "portrait"`.
- Root `<head>` metadata for iOS: `apple-touch-icon`, `apple-mobile-web-app-capable`, status-bar style.
- Minimal service worker: app-shell stale-while-revalidate for fast launch. No IndexedDB, no outbox, no offline write flow.

### Offline

Not in v1. The dose logger uses `useOptimistic` for snappy UX; if the Server Action fails, a toast prompts the user to retry. Adding an outbox-and-background-sync pattern for the dose logger is the natural first v2 step if the network reality demands it.

---

## 6. Domain logic (PK / decay math)

Port `src/renderer/js/decay.js` verbatim to `lib/pk/` in TypeScript. Preserve behavior (including the future-dated-dose full-strength summary quirk).

### Purity and testability changes

- **Pure functions, no I/O.**
- **Inject `now` as an argument** rather than calling `Date.now()` internally. Enables deterministic tests and caching.
- **Isomorphic:** the same module runs in Server Components (dashboard, cycle detail) and in the client Recharts component.

### Callers

- Home Server Component: `getActiveCompoundSummaries(recentDoses, now)` → "active in your system" list.
- Home client chart: `generateTimeSeriesData(recentDoses, start, end)` → decay curve.
- Cycle detail: same two, scoped to the cycle's doses/date range.
- Compound detail: same two, scoped to one compound.

---

## 7. Feature translation

Every current-app feature has a defined new home:

| Current | New home | Notable changes |
|---|---|---|
| Dashboard (`dashboard.js`) | `app/(authed)/page.tsx` | Server Component + Cache Components + client chart |
| Adherence heatmap (`dashboard.js`) | `components/adherence-heatmap.tsx` | 52-week grid; server-aggregated day counts, client tooltips |
| Dose logger (`dose-logger.js`) | `app/(authed)/@sheet/log/page.tsx` | Server Action + `useOptimistic`; blend expansion; optional inventory-item bind; optional cycle link that fills `Dose.cycleId` directly instead of relying on ±24h matching |
| Sidebar nav (`index.html`) | — | Does not translate; replaced by the phone-first bottom tab bar in §4 |
| Body map (`bodymap.js`) | `components/body-map.tsx` | SVG, filtered by `enabledInjectionSites` |
| Library browse (`library.js`) | `app/(authed)/library/page.tsx` | LIBRARY_DATA becomes a seed script; Compound rows with `source='library'` |
| Compound detail (`compound-detail.js`) | `app/(authed)/library/[compoundId]/page.tsx` | Adds "your tested batches" section |
| Custom compound builder (`custom-compound.js`) | `app/(authed)/library/new/page.tsx` | Server Action; same form powers edit |
| Blends | `app/(authed)/blends/new/page.tsx` | First-class Blend + BlendComponent tables |
| Cycles list (`cycles.js`) | `app/(authed)/cycles/page.tsx` | Sectioned by status; cards carry adherence, pills, tags |
| Cycle builder (`cycles.js`) | `app/(authed)/cycles/new`, `[id]/edit` | CycleEntry rows; entry timeline preview; same form for create and edit |
| Schedule + adherence (`cycles.js`) | `lib/cycles/schedule.ts` + `[id]/page.tsx` | Pure generator, Server Action reconciler, take/skip actions |
| Cycle review (`cycles.js`) | `app/(authed)/cycles/[id]/page.tsx` | Review form on completion; archive transition |
| Inventory (`inventory.js`) | `app/(authed)/stock/*` | List with filters; detail shows linked BatchTest + dose draw history |
| Reconstitution (`reconstitution.js`) | `app/(authed)/stock/reconstitution/page.tsx` | Client-only math; optional save to InventoryItem |
| Orders (inside inventory) | `app/(authed)/stock/orders/*` | Order + OrderLineItem tables; delivered orders auto-create inventory |
| Supplies (inside inventory) | `app/(authed)/stock/supplies/*` | Rules become their own view backed by SupplyUsageRule rows |
| BatchTest results (new) | `app/(authed)/stock/tests/*` | Covered in §3 and §8 |
| Bloodwork (schema-only today) | `app/(authed)/bloodwork/page.tsx` | New UI: minimal list + add form |
| History (`history.js`) | `app/(authed)/history/page.tsx` | Server-fetched slice + client filter |
| Settings (scattered today) | `app/(authed)/settings/page.tsx` | Sites, supply rules, profile |
| Export/import (`custom-compound.js`) | `app/(authed)/settings/data/page.tsx` | Full JSON backup, dose-history CSV round-trip, sample downloads; export via Route Handler, import via Server Action |
| Chart (`chart.js`) | `components/decay-chart.tsx` | Recharts instead of Chart.js |
| Utils (`utils.js`) | `lib/utils/*` | Split by concern |
| Electron main/renderer/web-server | Deleted | Web-only target |

---

## 8. Batch test results (detailed)

Third-party lab reports (e.g., Janoshik) join to inventory by batch number, so one test applies to every vial from that batch.

### Data model

Covered in §3: BatchTest + BatchTestAssay. Removes the `testFile`/`testFileName` fields the current app hangs off OrderLineItem.

### UI

- **`/stock/tests`** — list of all test results, filterable by compound / lab / date. Card per test with purity % and measured content.
- **Inventory item detail** — if a matching BatchTest exists (`compoundId + batchNumber + userId`), show it inline: "Batch tested by Janoshik — 99.4% purity, 22.6mg avg — [view report]". Otherwise, a "link test result" CTA.
- **Compound detail (Library)** — "Batches you've tested" section listing every BatchTest for this compound, so quality history is visible across suppliers.
- **Order detail** — when order arrives and inventory is created, if any line item's batch already has a test, auto-badge it. If not, prompt to upload.

### Add-test flow

Two entry points, same form:
- From inventory: "Add test for batch X" (compound + batch pre-filled).
- Standalone: `/stock/tests/new` (manual entry).

Form: lab (default Janoshik), lab task #, dates, verify URL + key (auto-parse if URL pasted), table of analytes (add-row for each), plus PDF/image upload → Vercel Blob.

### Deferred to v2

- OCR the uploaded PDF to prefill assay values
- QR-code scanning from the report to the verify URL
- Scraping `janoshik.com/verify` to pull results server-side

---

## 9. Migration & rollout

### Repo shape

New repo (`compound-tracker-web`). Old repo untouched during development; gets a `DEPRECATED.md` at cutover pointing to the new one; archived after 30 days of clean operation.

### One-shot import script

`scripts/import-legacy.ts` in the new repo. Reads the current `data/compound-tracker-data.json`, resolves references, writes via Drizzle in a single transaction. Idempotent (safe to re-run).

Order of operations:
1. Seed Compounds from LIBRARY_DATA (`source='library'`, `userId=null`).
2. Look up the Clerk user (`--user-id=<clerkId>` flag); all subsequent rows are scoped to this ID.
3. Import 64 InventoryItems — resolve `compoundName` → `compoundId` (case-insensitive with alias fallback); warn on unresolved names.
4. Import 5 Orders + their line items (resolving compound names). Collapse `statusHistory` arrays to `orderedAt`/`shippedAt`/`deliveredAt` timestamps on Order.
5. Skip empty collections. As of the 2026-08-29 snapshot that is everything except inventory (64), orders (5), and supplies (1) — doses, cycles, custom compounds/blends, bloodwork, libraryOverrides and compoundSettings are all empty, so no CycleEntry or ScheduledDose rows need importing. The script still handles them, since the snapshot is re-taken at cutover.
6. Recreate supplies (1 item) and the two-route supply usage defaults manually via a fresh seed, not from the legacy JSON blob.

Final output: `imported N inventory items, M orders, skipped K empty collections, unresolved compound names: [...]`.

### Cutover

1. Deploy to Vercel preview; run importer against preview DB.
2. Verify inventory + orders visually.
3. Log a few doses in preview to prove the hero loop.
4. Promote to production; re-run importer against prod DB.
5. Stop opening the old app. Add DEPRECATED.md.

No downtime window, no user coordination, no rollback drama — worst case, the old app remains usable.

### Post-cutover

- Archive old repo after 30 days.
- Preserve `docs/legacy-import-snapshot.json` in the new repo as a permanent artifact.

---

## 10. Testing & verification

### Tiers

- **Unit (Vitest)** — PK math (`lib/pk/`), reconstitution calculator, import-script alias resolution, SupplyUsageRule → per-dose consumption logic, and schedule generation (`lib/cycles/schedule.ts`). Cover single-dose decay at t=0, ½·hl, 1·hl, 5·hl; multi-dose stacking; future-dated behavior; zero/null half-life edges; adaptive interval bounds. For schedules: every frequency variant, on/off cycling, staggered entry start dates, `2x_daily` expanding to two slots per day, and the adherence denominator when doses are logged early.
- **Integration (Vitest + ephemeral Postgres)** — Server Actions with cross-row logic: dose ↔ inventory auto-decrement; cycle deletion unlinks (not cascades) doses; blend expansion creates the right N doses sharing `blendGroupId`; batch test lookup by `(compoundId, batchNumber)`. Reconciliation gets its own cluster: one dose never satisfies two slots, regeneration preserves `taken`/`skipped` history while replacing future `pending` slots, and an explicit cycle link on the dose logger wins over ±24h proximity matching. Use Neon test branches or Testcontainers.
- **E2E (Playwright)** — one hero-loop test: sign in → open [+ Log] → pick compound → log dose → see it in "active in your system" on Home. Add more E2E only when a regression justifies each one.

### Explicitly not tested

- UI snapshot tests
- Exhaustive component tests
- Coverage thresholds

### CI

- **GitHub Actions on every PR:** `pnpm typecheck && pnpm test:unit && pnpm test:integration`.
- **E2E on merges to `main`** against the Vercel preview URL.
- **Drizzle migrations** run automatically on deploy via a `postbuild` script.

### Manual verification checklist (PR template)

- Log a dose on phone viewport, one-handed
- Confirm PWA installs to home screen and launches standalone
- Confirm current-cycle badge on dashboard is correct
- Confirm a logged dose flips its scheduled slot to `taken` and moves the cycle's adherence bar
- Confirm inventory `remainingAmount` decrements when dose is logged from a vial
- Confirm batch test badge appears on inventory item with matching test

---

## 11. Deferred (v2 backlog)

Explicitly out of v1 scope; captured here so they aren't lost:

- **Offline write flow** for the dose logger (IndexedDB outbox + service worker background sync).
- **Dose reminders / push notifications.**
- **BatchTest PDF OCR** to prefill assay values.
- **QR-code scan** from a paper report to jump to the verify URL.
- **Automated scraping** of `janoshik.com/verify`.
- **Niimbot M2 40x20mm label printing** for inventory item labels. Note: BLE-based; Web Bluetooth works in Chromium but not on iOS Safari. Likely path is generate-a-PNG-that-AirDrops-to-a-Mac, or use the official Niimbot app to receive a printable payload.
- **Full offline read** for cycles, inventory, library (beyond app shell).

---

## 12. Open questions

None at this stage — all major decisions made during brainstorming are captured above. Any remaining detail-level choices (specific shadcn variants, exact color tokens, precise Recharts options) will be resolved during implementation.
