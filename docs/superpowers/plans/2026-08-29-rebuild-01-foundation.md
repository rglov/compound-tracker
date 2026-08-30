# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `compound-tracker-web` as a deployed, installable, sign-in-able Next.js 16 app with the complete Postgres schema and a working tab-bar shell — no features yet, but every later plan can build directly on it.

**Architecture:** A single Next.js 16 App Router project on Vercel. Reads go through Server Components querying Drizzle directly; writes go through Server Actions. Clerk gates everything under the `(authed)` route group via `proxy.ts`, and every query is funnelled through a `userScoped(userId)` helper so no table is ever read unfiltered. The schema is defined in one Drizzle module per entity cluster, migrated with `drizzle-kit`, and tested against an in-process PGlite Postgres so integration tests need neither Docker nor network.

**Tech Stack:** Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Clerk, Neon Postgres, Drizzle ORM + drizzle-kit, Vitest, PGlite (test Postgres), pnpm, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-29-compound-tracker-rebuild-design.md`

**Plan index:** `docs/superpowers/plans/2026-08-29-rebuild-plan-index.md`

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include this section.

- **Framework:** Next.js 16 (App Router, React Server Components, Server Actions, Cache Components / PPR).
- **Next.js 16 naming:** the request-interception file is `proxy.ts`, exporting `proxy()` and `proxyConfig` — **not** `middleware.ts` / `middleware()` / `config`. The spec predates this rename.
- **UI:** shadcn/ui + Tailwind CSS. **Charts:** Recharts. **Auth:** Clerk. **Database:** Neon Postgres. **ORM:** Drizzle. **File storage:** Vercel Blob. **Hosting:** Vercel.
- **Design direction:** "Apple Health / clinical calm: muted palette, generous whitespace, big-number displays, ring/line charts as focal points. Reads as a trustworthy tracking tool, not a consumer wellness app."
- **Primary use case:** "Daily dose logging on a phone, in the moment… in the fewest possible taps." Phone-first at every layout decision; desktop is the secondary target.
- **Auth scoping:** "Every Drizzle query passes through a `userScoped(userId)` helper." No exceptions — a query that does not filter on `userId` is a bug, including in tests.
- **Offline:** not supported in v1. Any mutation requires network. The service worker caches the app shell only — no IndexedDB, no outbox, no offline write flow.
- **Not in v1:** offline writes, multi-user/real-time sync, dose reminders or push notifications, batch-test PDF OCR, QR scanning, `janoshik.com/verify` scraping, Niimbot label printing.
- **Testing tiers:** Vitest for unit and integration, Playwright for exactly one E2E hero-loop test. Explicitly **not** tested: UI snapshot tests, exhaustive component tests, coverage thresholds.
- **CI:** `pnpm typecheck && pnpm test:unit && pnpm test:integration` on every PR.

### Numeric column convention

Drizzle's `numeric` maps to a JavaScript **string**, which silently poisons arithmetic (`"5" + 1 === "51"`). Every measured quantity in this schema — doses, volumes, concentrations, costs — uses `doublePrecision` instead, which maps to `number`. This is a deliberate deviation from the spec's `numeric` annotations. Float precision is irrelevant at this app's scale (milligram doses, dollar costs on a personal tracker) and the type-safety win is large. Do not introduce `numeric` columns without changing this note first.

### Repository

This plan creates a **new repository**, `compound-tracker-web`. The legacy repo at `/Users/rglov/Code/compound-tracker` is read-only reference material for these plans and must not be modified.

---

## File Structure

| File | Responsibility |
|---|---|
| `next.config.ts` | Next config; enables `cacheComponents` |
| `drizzle.config.ts` | drizzle-kit migration config |
| `vitest.config.ts` | Two projects: `unit` (node) and `integration` (PGlite setup) |
| `proxy.ts` | Clerk route protection for `(authed)/*` |
| `lib/db/index.ts` | Neon connection + `db` export |
| `lib/db/schema/enums.ts` | Every `pgEnum` in one place — imported by all schema modules |
| `lib/db/schema/compounds.ts` | `compounds`, `blends`, `blendComponents` |
| `lib/db/schema/cycles.ts` | `cycles`, `cycleEntries`, `scheduledDoses` |
| `lib/db/schema/doses.ts` | `doses` |
| `lib/db/schema/stock.ts` | `inventoryItems`, `orders`, `orderLineItems`, `batchTests`, `batchTestAssays` |
| `lib/db/schema/misc.ts` | `supplies`, `supplyUsageRules`, `bloodwork`, `userSettings` |
| `lib/db/schema/index.ts` | Barrel re-export of all schema modules |
| `lib/db/scoped.ts` | `userScoped()` — the single auth-filter chokepoint |
| `lib/auth.ts` | `requireUserId()` — `auth()` wrapper that throws instead of returning null |
| `app/layout.tsx` | Root: ClerkProvider, fonts, PWA meta |
| `app/globals.css` | Tailwind v4 import + clinical-calm design tokens |
| `app/manifest.ts` | PWA manifest |
| `app/sign-in/[[...rest]]/page.tsx` | Clerk sign-in |
| `app/(authed)/layout.tsx` | Auth check, tab bar, `@sheet` slot |
| `app/(authed)/page.tsx` | Home placeholder (Plan 3 fills it) |
| `app/(authed)/@sheet/default.tsx` | Required slot fallback — returns null |
| `app/(authed)/@sheet/(.)log/page.tsx` | Intercepted dose-logger sheet (stub) |
| `app/(authed)/log/page.tsx` | Full-page dose logger (stub) |
| `components/tab-bar.tsx` | Bottom tab navigation |
| `components/sheet-shell.tsx` | Bottom-sheet chrome; closes via `router.back()` |
| `tests/helpers/db.ts` | PGlite test database factory + migration runner |
| `public/sw.js` | App-shell service worker |
| `.github/workflows/ci.yml` | typecheck + unit + integration on PR |

---

## Task 1: Scaffold the Next.js 16 project

**Files:**
- Create: `compound-tracker-web/` (whole project via `create-next-app`)
- Modify: `package.json`, `next.config.ts`, `.gitignore`
- Create: `vitest.config.ts`, `tests/unit/smoke.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a project where `pnpm typecheck`, `pnpm test:unit`, and `pnpm build` all pass. Every later task assumes these three scripts exist and are green.

- [ ] **Step 1: Create the project**

Run from the parent directory of the legacy repo (`/Users/rglov/Code`):

```bash
pnpm create next-app@latest compound-tracker-web \
  --typescript --tailwind --eslint --app --use-pnpm \
  --src-dir=false --import-alias="@/*" --turbopack
cd compound-tracker-web
```

If the CLI prompts for anything not covered by these flags, accept the default.

- [ ] **Step 2: Verify the Next.js major version is 16**

```bash
pnpm list next --depth=0
```

Expected: a version starting with `16.`. **If it prints 15.x or lower, stop and report it** — this plan's `proxy.ts` convention and `cacheComponents` flag are Next.js 16 features and the rest of the plan does not apply as written.

- [ ] **Step 3: Enable Cache Components**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

- [ ] **Step 4: Install test tooling**

```bash
pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 5: Write the Vitest config**

Create `vitest.config.ts`. The two projects are separated because integration tests need a database fixture and unit tests must stay fast enough to run on every save.

```typescript
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          // Each file gets its own PGlite instance; running them in one
          // process keeps that cheap.
          fileParallelism: false,
        },
      },
    ],
  },
});
```

- [ ] **Step 6: Add scripts to `package.json`**

Merge into the existing `"scripts"` block:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test:unit": "vitest run --project unit",
    "test:integration": "vitest run --project integration",
    "test": "vitest run"
  }
}
```

- [ ] **Step 7: Write the failing smoke test**

Create `tests/unit/smoke.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { appName } from '@/lib/constants';

describe('project scaffold', () => {
  it('exposes the app name', () => {
    expect(appName).toBe('Compound Tracker');
  });
});
```

- [ ] **Step 8: Run it to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `Failed to resolve import "@/lib/constants"`.

- [ ] **Step 9: Write the minimal implementation**

Create `lib/constants.ts`:

```typescript
export const appName = 'Compound Tracker';
export const appDescription =
  'Track peptide, AAS, and HGH compound levels with pharmacokinetic decay modeling';
```

- [ ] **Step 10: Run the test and the type checker**

```bash
pnpm test:unit && pnpm typecheck
```

Expected: 1 test passing, no type errors.

- [ ] **Step 11: Verify the app builds**

```bash
pnpm build
```

Expected: build completes with no errors.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app with Tailwind and Vitest

Two Vitest projects — unit (fast, no fixtures) and integration (PGlite,
added in a later task). Cache Components enabled up front so PPR is
available to the dashboard without a later config migration."
```

---

## Task 2: Design tokens and shadcn/ui

**Files:**
- Modify: `app/globals.css`
- Create: `components.json` (via shadcn CLI), `lib/utils.ts` (via shadcn CLI)
- Create: `tests/unit/tokens.test.ts`

**Interfaces:**
- Consumes: Task 1's project.
- Produces: CSS custom properties `--background`, `--foreground`, `--card`, `--muted`, `--muted-foreground`, `--border`, `--primary`, `--primary-foreground`, `--accent-active`, `--accent-warn`, `--accent-danger`, both light and dark. Later plans style exclusively against these tokens and the `cn()` helper from `lib/utils.ts`.

- [ ] **Step 1: Initialise shadcn/ui**

```bash
pnpm dlx shadcn@latest init
```

Choose the **Neutral** base colour when prompted; it is the closest starting point to the spec's muted clinical palette. Accept defaults otherwise.

- [ ] **Step 2: Add the components later plans need**

```bash
pnpm dlx shadcn@latest add button card input label select sheet dialog badge sonner tabs separator
```

- [ ] **Step 3: Write the failing token test**

The point of this test is not to check colours — it is to fail loudly if someone deletes a token that components depend on. Create `tests/unit/tokens.test.ts`:

```typescript
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const REQUIRED_TOKENS = [
  '--background',
  '--foreground',
  '--card',
  '--muted',
  '--muted-foreground',
  '--border',
  '--primary',
  '--primary-foreground',
  '--accent-active',
  '--accent-warn',
  '--accent-danger',
];

describe('design tokens', () => {
  const css = readFileSync('app/globals.css', 'utf8');

  it.each(REQUIRED_TOKENS)('defines %s', (token) => {
    expect(css).toContain(`${token}:`);
  });

  it('defines a dark variant for every token', () => {
    const dark = css.slice(css.indexOf('.dark'));
    for (const token of REQUIRED_TOKENS) {
      expect(dark, `${token} missing from .dark`).toContain(`${token}:`);
    }
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — the three `--accent-*` tokens are not in the shadcn defaults.

- [ ] **Step 5: Add the domain accent tokens**

Append to `app/globals.css`, after the block shadcn generated. These three are the only colours the app assigns *meaning* to: a compound is active in your system, a supply or vial is running low, something has expired or been missed.

```css
:root {
  /* Domain accents — calm, desaturated, readable on --card.
     Chart series colours come from per-compound values in the database,
     not from these. */
  --accent-active: oklch(0.62 0.11 195);
  --accent-warn: oklch(0.72 0.13 75);
  --accent-danger: oklch(0.58 0.16 25);
}

.dark {
  --accent-active: oklch(0.72 0.11 195);
  --accent-warn: oklch(0.78 0.13 75);
  --accent-danger: oklch(0.68 0.16 25);
}

@theme inline {
  --color-accent-active: var(--accent-active);
  --color-accent-warn: var(--accent-warn);
  --color-accent-danger: var(--accent-danger);
}
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS — all token assertions green.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: shadcn/ui and clinical-calm design tokens

Three domain accents on top of the shadcn neutral base: active, warn,
danger. Per-compound chart colours stay in the database rather than
becoming tokens. A test asserts every token has a dark variant so a
half-finished palette edit fails CI instead of shipping."
```

---

## Task 3: Drizzle, Neon, and the PGlite test harness

**Files:**
- Create: `lib/db/index.ts`, `drizzle.config.ts`, `tests/helpers/db.ts`
- Create: `tests/integration/harness.test.ts`
- Modify: `package.json`, `.env.example`, `.gitignore`

**Interfaces:**
- Consumes: Task 1's project.
- Produces:
  - `db` — the Drizzle client, from `lib/db/index.ts`.
  - `createTestDb(): Promise<{ db: TestDb; close: () => Promise<void> }>` from `tests/helpers/db.ts`. Every integration test in every later plan starts by calling it.
  - `pnpm db:generate` and `pnpm db:migrate` scripts.

- [ ] **Step 1: Install database dependencies**

```bash
pnpm add drizzle-orm @neondatabase/serverless ws
pnpm add -D drizzle-kit @electric-sql/pglite @types/ws
```

`@neondatabase/serverless` with `ws` (rather than the HTTP driver) because Server Actions and the legacy import script both need real transactions, which the HTTP driver does not support.

- [ ] **Step 2: Write the connection module**

Create `lib/db/index.ts`:

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import * as schema from './schema';

// The serverless driver needs a WebSocket implementation when it is not
// running in an environment that provides one globally.
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export type Db = typeof db;
```

- [ ] **Step 3: Create the schema barrel**

`lib/db/index.ts` imports `./schema`, which does not exist yet. Create `lib/db/schema/index.ts` with a placeholder that Tasks 4–7 will fill:

```typescript
// Re-exports every table so `drizzle(pool, { schema })` and drizzle-kit
// both see the full schema. Each task below adds one line.
export {};
```

- [ ] **Step 4: Write the drizzle-kit config**

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 5: Add database scripts to `package.json`**

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

- [ ] **Step 6: Write the failing harness test**

This test proves the fixture works before any real schema depends on it. Create `tests/integration/harness.test.ts`:

```typescript
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestDb, type TestDb } from '../helpers/db';

describe('PGlite test harness', () => {
  let db: TestDb;
  let close: () => Promise<void>;

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
  });

  afterAll(async () => {
    await close();
  });

  it('runs queries against a real Postgres', async () => {
    const result = await db.execute(sql`select 1 as one`);
    expect(result.rows[0]).toEqual({ one: 1 });
  });

  it('has applied the migrations', async () => {
    const result = await db.execute(
      sql`select count(*)::int as n from information_schema.tables where table_schema = 'public'`,
    );
    // No tables yet — Tasks 4-7 add them. This assertion is tightened
    // in Task 4 once the first migration exists.
    expect(result.rows[0]).toBeDefined();
  });
});
```

- [ ] **Step 7: Run it to verify it fails**

```bash
pnpm test:integration
```

Expected: FAIL — `Failed to resolve import "../helpers/db"`.

- [ ] **Step 8: Write the test database helper**

PGlite is a real Postgres compiled to WASM, running in-process. It gives integration tests genuine enums, foreign keys, and constraint enforcement with no Docker daemon and no network — which matters because CI runs these on every PR. Create `tests/helpers/db.ts`:

```typescript
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';

import * as schema from '@/lib/db/schema';

export type TestDb = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Spins up an isolated in-memory Postgres with all migrations applied.
 * Call once per test file in `beforeAll`, and `close()` in `afterAll`.
 */
export async function createTestDb(): Promise<{
  db: TestDb;
  close: () => Promise<void>;
}> {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  await migrate(db, { migrationsFolder: './drizzle' });

  return {
    db,
    close: async () => {
      await client.close();
    },
  };
}
```

- [ ] **Step 9: Create the empty migrations folder**

`migrate()` fails on a missing folder. Until Task 4 generates a real migration, create the journal drizzle-kit expects:

```bash
mkdir -p drizzle/meta
cat > drizzle/meta/_journal.json <<'JSON'
{
  "version": "7",
  "dialect": "postgresql",
  "entries": []
}
JSON
```

- [ ] **Step 10: Run the test to verify it passes**

```bash
pnpm test:integration
```

Expected: PASS — 2 tests.

- [ ] **Step 11: Document the environment**

Create `.env.example`:

```bash
# Neon Postgres — provisioned via `vercel integration add neon`
DATABASE_URL=

# Clerk — provisioned via `vercel integration add clerk` (Task 8)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Confirm `.gitignore` contains `.env*.local` and add `.env` if it is absent.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: Drizzle client, drizzle-kit config, PGlite test harness

Uses the Neon WebSocket driver rather than the HTTP one because Server
Actions and the legacy import script both need transactions.

Integration tests run against PGlite — a real Postgres compiled to WASM,
in-process. Enums, foreign keys and constraints all behave, with no
Docker daemon and no network in CI."
```

---

## Task 4: Schema — compounds, blends, and blend components

**Files:**
- Create: `lib/db/schema/enums.ts`, `lib/db/schema/compounds.ts`
- Modify: `lib/db/schema/index.ts`
- Create: `tests/integration/schema-compounds.test.ts`

**Interfaces:**
- Consumes: `createTestDb` from Task 3.
- Produces, imported by every later schema module and plan:
  - From `enums.ts`: `compoundTypeEnum`, `compoundSourceEnum`, `routeEnum`, `cycleStatusEnum`, `cycleFrequencyEnum`, `scheduledDoseStatusEnum`, `inventoryFormatEnum`, `inventoryStatusEnum`, `orderStatusEnum`.
  - From `compounds.ts`: `compounds`, `blends`, `blendComponents`.

- [ ] **Step 1: Write every enum**

All enums live in one module so that a route or status value is defined exactly once and every table that references it stays in sync. Create `lib/db/schema/enums.ts`:

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

/** Dosing category. Maps from the legacy COMPOUND_LIBRARY `category` field. */
export const compoundTypeEnum = pgEnum('compound_type', [
  'peptide',
  'aas',
  'hgh',
  'ancillary',
]);

/**
 * `library` rows are shared seeds with a null userId. `custom` rows are
 * user-created. `override` rows shadow a library row by name for one user.
 */
export const compoundSourceEnum = pgEnum('compound_source', [
  'library',
  'custom',
  'override',
]);

export const routeEnum = pgEnum('route', [
  'intramuscular',
  'subcutaneous',
  'oral',
  'intravenous',
  'topical',
]);

export const cycleStatusEnum = pgEnum('cycle_status', [
  'planned',
  'active',
  'paused',
  'completed',
  'archived',
]);

/** Mirrors the legacy FREQUENCY_LABELS keys in cycles.js exactly. */
export const cycleFrequencyEnum = pgEnum('cycle_frequency', [
  'daily',
  '2x_daily',
  '3x_weekly',
  'eod',
  'weekly',
  'every_n_days',
  'custom_days',
]);

export const scheduledDoseStatusEnum = pgEnum('scheduled_dose_status', [
  'pending',
  'taken',
  'skipped',
]);

export const inventoryFormatEnum = pgEnum('inventory_format', [
  'vial',
  'tablet',
  'capsule',
  'powder',
  'oral-solution',
]);

export const inventoryStatusEnum = pgEnum('inventory_status', [
  'in-stock',
  'in-use',
  'depleted',
  'expired',
  'discarded',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'ordered',
  'shipped',
  'delivered',
  'cancelled',
]);
```

- [ ] **Step 2: Write the compounds schema**

Note the two groups of columns. The dosing defaults come from the legacy `COMPOUND_LIBRARY`; the reference content (`benefits` through `sideEffects`) comes from `LIBRARY_DATA`. The spec's `Compound` entity only described the first group. Create `lib/db/schema/compounds.ts`:

```typescript
import { relations, sql } from 'drizzle-orm';
import {
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { compoundSourceEnum, compoundTypeEnum, routeEnum } from './enums';

export const compounds = pgTable(
  'compounds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Null for shared library seeds; set for user customs and overrides. */
    userId: text('user_id'),
    name: text('name').notNull(),
    type: compoundTypeEnum('type').notNull(),
    source: compoundSourceEnum('source').notNull(),

    // Dosing defaults (legacy COMPOUND_LIBRARY)
    defaultHalfLifeHours: doublePrecision('default_half_life_hours'),
    defaultUnit: text('default_unit').notNull().default('mg'),
    defaultRoute: routeEnum('default_route').notNull().default('subcutaneous'),
    defaultColor: text('default_color').notNull().default('#8e8e93'),

    // Reference content (legacy LIBRARY_DATA)
    benefits: text('benefits').array().notNull().default([]),
    sideEffects: text('side_effects').array().notNull().default([]),
    goodWith: text('good_with').array().notNull().default([]),
    notGoodWith: text('not_good_with').array().notNull().default([]),
    tags: text('tags').array().notNull().default([]),
    protocols: text('protocols'),
    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('compounds_user_idx').on(table.userId),
    // A user cannot have two compounds with the same name, and the shared
    // library cannot have two seeds with the same name. Postgres treats
    // NULLs as distinct in unique indexes, so library seeds (userId null)
    // need their own partial index to be constrained at all.
    uniqueIndex('compounds_user_name_key')
      .on(table.userId, table.name)
      .where(sql`user_id is not null`),
    uniqueIndex('compounds_library_name_key')
      .on(table.name)
      .where(sql`user_id is null`),
  ],
);

export const blends = pgTable(
  'blends',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('blends_user_idx').on(table.userId)],
);

export const blendComponents = pgTable(
  'blend_components',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    blendId: uuid('blend_id')
      .notNull()
      .references(() => blends.id, { onDelete: 'cascade' }),
    compoundId: uuid('compound_id')
      .notNull()
      .references(() => compounds.id, { onDelete: 'restrict' }),
    amountPerMl: doublePrecision('amount_per_ml').notNull(),
    unit: text('unit').notNull(),
  },
  (table) => [index('blend_components_blend_idx').on(table.blendId)],
);

export const blendsRelations = relations(blends, ({ many }) => ({
  components: many(blendComponents),
}));

export const blendComponentsRelations = relations(
  blendComponents,
  ({ one }) => ({
    blend: one(blends, {
      fields: [blendComponents.blendId],
      references: [blends.id],
    }),
    compound: one(compounds, {
      fields: [blendComponents.compoundId],
      references: [compounds.id],
    }),
  }),
);
```

- [ ] **Step 3: Export from the barrel**

Replace `lib/db/schema/index.ts`:

```typescript
export * from './enums';
export * from './compounds';
```

- [ ] **Step 4: Generate the migration**

```bash
pnpm db:generate
```

Expected: a new file under `drizzle/` creating the enum types and three tables.

- [ ] **Step 5: Write the failing schema test**

Create `tests/integration/schema-compounds.test.ts`:

```typescript
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { blendComponents, blends, compounds } from '@/lib/db/schema';

import { createTestDb, type TestDb } from '../helpers/db';

const USER = 'user_test_1';

describe('compounds schema', () => {
  let db: TestDb;
  let close: () => Promise<void>;

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
  });

  afterAll(async () => {
    await close();
  });

  it('stores a library seed with a null userId', async () => {
    const [row] = await db
      .insert(compounds)
      .values({
        name: 'BPC-157',
        type: 'peptide',
        source: 'library',
        defaultHalfLifeHours: 4,
        defaultUnit: 'mcg',
        defaultRoute: 'subcutaneous',
        defaultColor: '#00e676',
        benefits: ['Healing'],
        tags: ['Recovery'],
      })
      .returning();

    expect(row.userId).toBeNull();
    expect(row.defaultHalfLifeHours).toBe(4);
    // doublePrecision must round-trip as a number, not a string.
    expect(typeof row.defaultHalfLifeHours).toBe('number');
    expect(row.benefits).toEqual(['Healing']);
  });

  it('rejects a second library seed with the same name', async () => {
    await expect(
      db.insert(compounds).values({
        name: 'BPC-157',
        type: 'peptide',
        source: 'library',
      }),
    ).rejects.toThrow();
  });

  it('allows a user override that shadows a library seed by name', async () => {
    const [row] = await db
      .insert(compounds)
      .values({
        userId: USER,
        name: 'BPC-157',
        type: 'peptide',
        source: 'override',
        defaultHalfLifeHours: 6,
      })
      .returning();

    expect(row.userId).toBe(USER);
    expect(row.defaultHalfLifeHours).toBe(6);
  });

  it('rejects a duplicate name for the same user', async () => {
    await expect(
      db.insert(compounds).values({
        userId: USER,
        name: 'BPC-157',
        type: 'peptide',
        source: 'custom',
      }),
    ).rejects.toThrow();
  });

  it('rejects an invalid compound type', async () => {
    // Raw SQL because TypeScript would reject an invalid enum value at
    // compile time — the point is to prove the database rejects it too.
    await expect(
      db.execute(
        sql`insert into compounds (name, type, source) values ('X', 'vitamin', 'custom')`,
      ),
    ).rejects.toThrow();
  });

  it('cascades blend component deletion but protects the compound', async () => {
    const [compound] = await db
      .insert(compounds)
      .values({ userId: USER, name: 'Ipamorelin', type: 'peptide', source: 'custom' })
      .returning();

    const [blend] = await db
      .insert(blends)
      .values({ userId: USER, name: 'Morning stack' })
      .returning();

    await db.insert(blendComponents).values({
      blendId: blend.id,
      compoundId: compound.id,
      amountPerMl: 250,
      unit: 'mcg',
    });

    // Deleting a compound that a blend uses must fail.
    await expect(
      db.delete(compounds).where(eq(compounds.id, compound.id)),
    ).rejects.toThrow();

    // Deleting the blend takes its components with it.
    await db.delete(blends).where(eq(blends.id, blend.id));
    const remaining = await db.select().from(blendComponents);
    expect(remaining).toHaveLength(0);
  });
});
```

- [ ] **Step 6: Run it to verify it fails, then passes**

```bash
pnpm test:integration
```

If the migration in Step 4 was generated correctly this passes on the first run. If any test fails, fix the schema and re-run `pnpm db:generate` before continuing — **do not** hand-edit files under `drizzle/`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: compounds, blends, and blend components schema

One compounds table holds library seeds (null userId), user customs, and
per-user overrides, distinguished by source. Two partial unique indexes
enforce name uniqueness separately for the shared library and for each
user, because Postgres treats NULL userIds as distinct.

Carries both halves of the legacy library: dosing defaults from
COMPOUND_LIBRARY and reference content (benefits, protocols, side
effects) from LIBRARY_DATA, which the spec's entity omitted.

blend_components cascades from its blend but restricts on its compound,
so deleting a compound a blend depends on fails loudly."
```

---

## Task 5: Schema — cycles, cycle entries, scheduled doses, and doses

**Files:**
- Create: `lib/db/schema/cycles.ts`, `lib/db/schema/doses.ts`
- Modify: `lib/db/schema/index.ts`
- Create: `tests/integration/schema-cycles.test.ts`

**Interfaces:**
- Consumes: `compounds` (Task 4), `createTestDb` (Task 3).
- Produces: `cycles`, `cycleEntries`, `scheduledDoses`, `doses`. Plan 4 builds its schedule generator and reconciler directly against these.

This is the subsystem the spec's first draft omitted. The critical constraint is on `scheduledDoses.loggedDoseId`: it is **unique**, so one logged dose can satisfy at most one scheduled slot. In the legacy implementation that rule was maintained by a `Set` inside the reconciliation loop (`cycles.js:2059`); here the database enforces it.

- [ ] **Step 1: Write the doses schema**

`doses.ts` comes first because `cycles.ts` references it. Create `lib/db/schema/doses.ts`:

```typescript
import {
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { compounds } from './compounds';
import { routeEnum } from './enums';

export const doses = pgTable(
  'doses',
  {
    /** Client-generated so a retried submit is idempotent. */
    id: uuid('id').primaryKey(),
    userId: text('user_id').notNull(),
    compoundId: uuid('compound_id')
      .notNull()
      .references(() => compounds.id, { onDelete: 'restrict' }),

    /** Null for off-cycle logging. Set to null (not cascaded) if the
     *  cycle is deleted — the dose still happened. FK added in Step 3. */
    cycleId: uuid('cycle_id'),

    /** Shared by every dose expanded from one blend administration. */
    blendGroupId: uuid('blend_group_id'),

    amount: doublePrecision('amount').notNull(),
    unit: text('unit').notNull(),
    route: routeEnum('route').notNull(),
    /** Injection-site key, e.g. 'left-delt'. Null for oral. */
    site: text('site'),
    administeredAt: timestamp('administered_at', { withTimezone: true }).notNull(),

    /**
     * Denormalised on purpose. Editing a compound's half-life must not
     * silently rewrite the decay curve of doses already logged.
     */
    halfLifeHoursSnapshot: doublePrecision('half_life_hours_snapshot'),

    /** The vial this was drawn from, enabling auto-decrement. FK in Plan 5. */
    inventoryItemId: uuid('inventory_item_id'),

    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // The dashboard's hottest query: this user's doses, most recent first.
    index('doses_user_administered_idx').on(table.userId, table.administeredAt),
    index('doses_cycle_idx').on(table.cycleId),
    index('doses_blend_group_idx').on(table.blendGroupId),
  ],
);
```

- [ ] **Step 2: Write the cycles schema**

Create `lib/db/schema/cycles.ts`:

```typescript
import { relations } from 'drizzle-orm';
import {
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { compounds } from './compounds';
import { doses } from './doses';
import {
  cycleFrequencyEnum,
  cycleStatusEnum,
  routeEnum,
  scheduledDoseStatusEnum,
} from './enums';

export const cycles = pgTable(
  'cycles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    startDate: date('start_date'),
    /** Null means the cycle has no planned end. */
    endDate: date('end_date'),
    status: cycleStatusEnum('status').notNull().default('planned'),
    tags: text('tags').array().notNull().default([]),
    notes: text('notes'),
    /** Filled in by the post-cycle review form. */
    reviewNotes: text('review_notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('cycles_user_status_idx').on(table.userId, table.status)],
);

/**
 * One protocol line: "500mcg Tesamorelin, subcutaneous, daily, 90 days,
 * 5 days on / 2 days off."
 */
export const cycleEntries = pgTable(
  'cycle_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cycleId: uuid('cycle_id')
      .notNull()
      .references(() => cycles.id, { onDelete: 'cascade' }),
    compoundId: uuid('compound_id')
      .notNull()
      .references(() => compounds.id, { onDelete: 'restrict' }),

    dose: doublePrecision('dose').notNull(),
    unit: text('unit').notNull(),
    route: routeEnum('route').notNull(),

    frequency: cycleFrequencyEnum('frequency').notNull().default('daily'),
    /** The N in `every_n_days`. Null for every other frequency. */
    customFreqDays: integer('custom_freq_days'),
    /** Weekday indices (0 = Sunday) for `custom_days`. Null otherwise. */
    customDays: integer('custom_days').array(),

    /** May be later than the cycle's, for staggered starts. */
    startDate: date('start_date').notNull(),
    durationDays: integer('duration_days').notNull(),

    /** On/off cycling within the entry. Both null, or both set. */
    onDays: integer('on_days'),
    offDays: integer('off_days'),

    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('cycle_entries_cycle_idx').on(table.cycleId)],
);

/** One generated slot per planned administration. */
export const scheduledDoses = pgTable(
  'scheduled_doses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cycleId: uuid('cycle_id')
      .notNull()
      .references(() => cycles.id, { onDelete: 'cascade' }),
    cycleEntryId: uuid('cycle_entry_id')
      .notNull()
      .references(() => cycleEntries.id, { onDelete: 'cascade' }),
    compoundId: uuid('compound_id')
      .notNull()
      .references(() => compounds.id, { onDelete: 'restrict' }),

    dose: doublePrecision('dose').notNull(),
    unit: text('unit').notNull(),
    route: routeEnum('route').notNull(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    status: scheduledDoseStatusEnum('status').notNull().default('pending'),

    /**
     * The real dose that satisfied this slot. Unique: one dose can never
     * count toward two slots. Nulled rather than cascaded if the dose is
     * deleted, which reopens the slot as pending.
     */
    loggedDoseId: uuid('logged_dose_id').references(() => doses.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    index('scheduled_doses_cycle_status_idx').on(table.cycleId, table.status),
    index('scheduled_doses_scheduled_at_idx').on(table.scheduledAt),
    uniqueIndex('scheduled_doses_logged_dose_key').on(table.loggedDoseId),
  ],
);

export const cyclesRelations = relations(cycles, ({ many }) => ({
  entries: many(cycleEntries),
  scheduledDoses: many(scheduledDoses),
  doses: many(doses),
}));

export const cycleEntriesRelations = relations(cycleEntries, ({ one, many }) => ({
  cycle: one(cycles, {
    fields: [cycleEntries.cycleId],
    references: [cycles.id],
  }),
  compound: one(compounds, {
    fields: [cycleEntries.compoundId],
    references: [compounds.id],
  }),
  scheduledDoses: many(scheduledDoses),
}));

export const scheduledDosesRelations = relations(scheduledDoses, ({ one }) => ({
  cycle: one(cycles, {
    fields: [scheduledDoses.cycleId],
    references: [cycles.id],
  }),
  entry: one(cycleEntries, {
    fields: [scheduledDoses.cycleEntryId],
    references: [cycleEntries.id],
  }),
  loggedDose: one(doses, {
    fields: [scheduledDoses.loggedDoseId],
    references: [doses.id],
  }),
}));
```

- [ ] **Step 3: Wire the deferred `doses.cycleId` foreign key**

`doses` and `cycles` reference each other, so the FK cannot be declared inline in `doses.ts` without a circular import. Add it in `cycles.ts` after the table definitions:

```typescript
import { foreignKey } from 'drizzle-orm/pg-core';

// Declared here rather than in doses.ts to avoid a circular import.
// `set null` because deleting a cycle must unlink its doses, not delete
// them — the doses still happened.
export const dosesCycleFk = foreignKey({
  columns: [doses.cycleId],
  foreignColumns: [cycles.id],
  name: 'doses_cycle_id_fk',
}).onDelete('set null');
```

**RESOLVED during execution — use the inline form, not the standalone one.** drizzle-kit 0.31.10 silently ignores a standalone `foreignKey()` declared outside a table's config callback: it emits no constraint and no warning. Declare `cycleId` inline in `doses.ts` instead:

```typescript
// In doses.ts. Circular by design: cycles.ts imports doses for
// scheduledDoses.loggedDoseId. Safe because every reference is inside a
// lazy `() =>` callback, so neither module reads the other's tables
// during evaluation.
import { cycles } from './cycles';

    cycleId: uuid('cycle_id').references(() => cycles.id, {
      onDelete: 'set null',
    }),
```

Do not add the `foreignKey` import or the `dosesCycleFk` export to `cycles.ts`. Confirm the constraint appears in the generated SQL in Step 5.

- [ ] **Step 4: Export from the barrel**

Replace `lib/db/schema/index.ts`:

```typescript
export * from './enums';
export * from './compounds';
export * from './doses';
export * from './cycles';
```

- [ ] **Step 5: Generate the migration and check the SQL**

```bash
pnpm db:generate
cat drizzle/*_*.sql | grep -A2 -i "foreign key\|unique"
```

Expected: `scheduled_doses_logged_dose_key` unique index present, and a `doses_cycle_id_fk` with `ON DELETE set null`.

- [ ] **Step 6: Write the failing schema test**

Create `tests/integration/schema-cycles.test.ts`:

```typescript
import { eq, isNull } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  compounds,
  cycleEntries,
  cycles,
  doses,
  scheduledDoses,
} from '@/lib/db/schema';

import { createTestDb, type TestDb } from '../helpers/db';

const USER = 'user_test_1';

describe('cycles schema', () => {
  let db: TestDb;
  let close: () => Promise<void>;
  let compoundId: string;

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    const [c] = await db
      .insert(compounds)
      .values({ name: 'Tesamorelin', type: 'peptide', source: 'library' })
      .returning();
    compoundId = c.id;
  });

  afterAll(async () => {
    await close();
  });

  async function makeCycle() {
    const [cycle] = await db
      .insert(cycles)
      .values({
        userId: USER,
        name: 'Test cycle',
        startDate: '2026-09-01',
        status: 'active',
        tags: ['recomp'],
      })
      .returning();

    const [entry] = await db
      .insert(cycleEntries)
      .values({
        cycleId: cycle.id,
        compoundId,
        dose: 500,
        unit: 'mcg',
        route: 'subcutaneous',
        frequency: 'daily',
        startDate: '2026-09-01',
        durationDays: 30,
      })
      .returning();

    return { cycle, entry };
  }

  it('stores a cycle with tags and a paused status', async () => {
    const [cycle] = await db
      .insert(cycles)
      .values({
        userId: USER,
        name: 'Paused cycle',
        status: 'paused',
        tags: ['bulk', 'winter'],
      })
      .returning();

    expect(cycle.status).toBe('paused');
    expect(cycle.tags).toEqual(['bulk', 'winter']);
  });

  it('stores an entry with on/off cycling and custom weekdays', async () => {
    const { cycle } = await makeCycle();
    const [entry] = await db
      .insert(cycleEntries)
      .values({
        cycleId: cycle.id,
        compoundId,
        dose: 250,
        unit: 'mcg',
        route: 'subcutaneous',
        frequency: 'custom_days',
        customDays: [1, 3, 5],
        startDate: '2026-09-01',
        durationDays: 60,
        onDays: 5,
        offDays: 2,
      })
      .returning();

    expect(entry.customDays).toEqual([1, 3, 5]);
    expect(entry.onDays).toBe(5);
  });

  it('refuses to let one logged dose satisfy two scheduled slots', async () => {
    const { cycle, entry } = await makeCycle();

    const [dose] = await db
      .insert(doses)
      .values({
        id: crypto.randomUUID(),
        userId: USER,
        compoundId,
        amount: 500,
        unit: 'mcg',
        route: 'subcutaneous',
        administeredAt: new Date('2026-09-01T08:00:00Z'),
      })
      .returning();

    const slot = {
      cycleId: cycle.id,
      cycleEntryId: entry.id,
      compoundId,
      dose: 500,
      unit: 'mcg',
      route: 'subcutaneous' as const,
    };

    await db.insert(scheduledDoses).values({
      ...slot,
      scheduledAt: new Date('2026-09-01T08:00:00Z'),
      status: 'taken',
      loggedDoseId: dose.id,
    });

    await expect(
      db.insert(scheduledDoses).values({
        ...slot,
        scheduledAt: new Date('2026-09-02T08:00:00Z'),
        status: 'taken',
        loggedDoseId: dose.id,
      }),
    ).rejects.toThrow();
  });

  it('allows many pending slots, since their loggedDoseId is null', async () => {
    const { cycle, entry } = await makeCycle();
    const slot = {
      cycleId: cycle.id,
      cycleEntryId: entry.id,
      compoundId,
      dose: 500,
      unit: 'mcg',
      route: 'subcutaneous' as const,
      status: 'pending' as const,
    };

    await db.insert(scheduledDoses).values([
      { ...slot, scheduledAt: new Date('2026-09-03T08:00:00Z') },
      { ...slot, scheduledAt: new Date('2026-09-04T08:00:00Z') },
      { ...slot, scheduledAt: new Date('2026-09-05T08:00:00Z') },
    ]);

    const pending = await db
      .select()
      .from(scheduledDoses)
      .where(isNull(scheduledDoses.loggedDoseId));
    expect(pending.length).toBeGreaterThanOrEqual(3);
  });

  it('unlinks doses when a cycle is deleted, rather than deleting them', async () => {
    const { cycle, entry } = await makeCycle();
    const doseId = crypto.randomUUID();

    await db.insert(doses).values({
      id: doseId,
      userId: USER,
      compoundId,
      cycleId: cycle.id,
      amount: 500,
      unit: 'mcg',
      route: 'subcutaneous',
      administeredAt: new Date('2026-09-06T08:00:00Z'),
    });

    await db.insert(scheduledDoses).values({
      cycleId: cycle.id,
      cycleEntryId: entry.id,
      compoundId,
      dose: 500,
      unit: 'mcg',
      route: 'subcutaneous',
      scheduledAt: new Date('2026-09-06T08:00:00Z'),
    });

    await db.delete(cycles).where(eq(cycles.id, cycle.id));

    const [survivor] = await db.select().from(doses).where(eq(doses.id, doseId));
    expect(survivor).toBeDefined();
    expect(survivor.cycleId).toBeNull();

    // Entries and slots, by contrast, are cascaded away with the cycle.
    const orphanEntries = await db
      .select()
      .from(cycleEntries)
      .where(eq(cycleEntries.cycleId, cycle.id));
    expect(orphanEntries).toHaveLength(0);
  });

  it('reopens a slot when its logged dose is deleted', async () => {
    const { cycle, entry } = await makeCycle();
    const doseId = crypto.randomUUID();

    await db.insert(doses).values({
      id: doseId,
      userId: USER,
      compoundId,
      amount: 500,
      unit: 'mcg',
      route: 'subcutaneous',
      administeredAt: new Date('2026-09-07T08:00:00Z'),
    });

    const [slot] = await db
      .insert(scheduledDoses)
      .values({
        cycleId: cycle.id,
        cycleEntryId: entry.id,
        compoundId,
        dose: 500,
        unit: 'mcg',
        route: 'subcutaneous',
        scheduledAt: new Date('2026-09-07T08:00:00Z'),
        status: 'taken',
        loggedDoseId: doseId,
      })
      .returning();

    await db.delete(doses).where(eq(doses.id, doseId));

    const [after] = await db
      .select()
      .from(scheduledDoses)
      .where(eq(scheduledDoses.id, slot.id));
    expect(after.loggedDoseId).toBeNull();
  });
});
```

- [ ] **Step 7: Run the tests**

```bash
pnpm test:integration
```

Expected: PASS — 6 tests in this file. If the last test fails with `loggedDoseId` still set, the `set null` on the `loggedDoseId` FK did not make it into the migration; fix `cycles.ts` and regenerate.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: cycles, cycle entries, scheduled doses, and doses schema

Restores the cycle planning subsystem the spec's first draft omitted.
A cycle is a plan (cycle_entries) that generates a schedule
(scheduled_doses) reconciled against real doses.

scheduled_doses.logged_dose_id is unique, so the 'one dose satisfies one
slot' rule is a database constraint rather than a Set inside the
reconciliation loop as it was in cycles.js.

Deleting a cycle cascades its entries and slots but only unlinks its
doses — the doses still happened. Deleting a dose reopens the slot it
had satisfied.

half_life_hours_snapshot is denormalised on doses on purpose: editing a
compound must not rewrite the decay curve of doses already logged."
```

---

## Task 6: Schema — inventory, orders, and batch tests

**Files:**
- Create: `lib/db/schema/stock.ts`
- Modify: `lib/db/schema/index.ts`, `lib/db/schema/doses.ts`
- Create: `tests/integration/schema-stock.test.ts`

**Interfaces:**
- Consumes: `compounds` (Task 4), `cycles` and `doses` (Task 5).
- Produces: `inventoryItems`, `orders`, `orderLineItems`, `batchTests`, `batchTestAssays`. Plan 5 builds the whole Stock tab on these.

- [ ] **Step 1: Write the stock schema**

Create `lib/db/schema/stock.ts`:

```typescript
import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { compounds } from './compounds';
import { cycles } from './cycles';
import {
  inventoryFormatEnum,
  inventoryStatusEnum,
  orderStatusEnum,
} from './enums';

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    supplier: text('supplier').notNull(),
    /** The legacy statusHistory array collapses into these three dates. */
    orderedAt: timestamp('ordered_at', { withTimezone: true }),
    shippedAt: timestamp('shipped_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    trackingNumber: text('tracking_number'),
    totalCost: doublePrecision('total_cost'),
    currency: text('currency').notNull().default('USD'),
    status: orderStatusEnum('status').notNull().default('ordered'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('orders_user_status_idx').on(table.userId, table.status)],
);

export const orderLineItems = pgTable(
  'order_line_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    compoundId: uuid('compound_id')
      .notNull()
      .references(() => compounds.id, { onDelete: 'restrict' }),
    format: inventoryFormatEnum('format').notNull(),
    quantity: integer('quantity').notNull(),
    amountPerUnit: doublePrecision('amount_per_unit').notNull(),
    unit: text('unit').notNull(),
    batchNumber: text('batch_number'),
    capColor: text('cap_color'),
    cost: doublePrecision('cost'),
    tested: boolean('tested').notNull().default(false),
  },
  (table) => [index('order_line_items_order_idx').on(table.orderId)],
);

export const inventoryItems = pgTable(
  'inventory_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    compoundId: uuid('compound_id')
      .notNull()
      .references(() => compounds.id, { onDelete: 'restrict' }),

    format: inventoryFormatEnum('format').notNull(),
    quantity: integer('quantity').notNull().default(1),
    amountPerUnit: doublePrecision('amount_per_unit').notNull(),
    remainingAmount: doublePrecision('remaining_amount').notNull(),
    unit: text('unit').notNull().default('mg'),

    /** Set after reconstitution, for vials. */
    concentrationMgPerMl: doublePrecision('concentration_mg_per_ml'),
    reconstitutionVolumeMl: doublePrecision('reconstitution_volume_ml'),

    /** Join key against batchTests — not a foreign key, because a test
     *  may be added before or after the inventory it describes. */
    batchNumber: text('batch_number'),

    capColor: text('cap_color'),
    expiresAt: date('expires_at'),
    receivedAt: date('received_at'),
    cost: doublePrecision('cost'),

    orderId: uuid('order_id').references(() => orders.id, {
      onDelete: 'set null',
    }),
    cycleId: uuid('cycle_id').references(() => cycles.id, {
      onDelete: 'set null',
    }),

    status: inventoryStatusEnum('status').notNull().default('in-stock'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('inventory_user_status_idx').on(table.userId, table.status),
    index('inventory_batch_idx').on(table.compoundId, table.batchNumber),
  ],
);

export const batchTests = pgTable(
  'batch_tests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    compoundId: uuid('compound_id')
      .notNull()
      .references(() => compounds.id, { onDelete: 'restrict' }),
    /** Joins to inventoryItems.batchNumber, so one test covers every vial
     *  from the same batch. */
    batchNumber: text('batch_number').notNull(),
    lab: text('lab').notNull().default('Janoshik'),
    labTaskNumber: text('lab_task_number'),
    manufacturer: text('manufacturer'),
    testingOrderedAt: date('testing_ordered_at'),
    sampleReceivedAt: date('sample_received_at'),
    analysisConductedAt: date('analysis_conducted_at'),
    verifyUrl: text('verify_url'),
    verifyKey: text('verify_key'),
    /** Vercel Blob URL for the original PDF or image. */
    attachmentBlobUrl: text('attachment_blob_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('batch_tests_lookup_idx').on(
      table.userId,
      table.compoundId,
      table.batchNumber,
    ),
  ],
);

export const batchTestAssays = pgTable(
  'batch_test_assays',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    batchTestId: uuid('batch_test_id')
      .notNull()
      .references(() => batchTests.id, { onDelete: 'cascade' }),
    /** e.g. 'Tesamorelin', 'Purity', 'Endotoxin'. */
    analyte: text('analyte').notNull(),
    /** number[] — labs report multiple replicate readings per analyte. */
    values: jsonb('values').$type<number[]>().notNull(),
    unit: text('unit').notNull(),
  },
  (table) => [index('batch_test_assays_test_idx').on(table.batchTestId)],
);

export const ordersRelations = relations(orders, ({ many }) => ({
  lineItems: many(orderLineItems),
  inventoryItems: many(inventoryItems),
}));

export const orderLineItemsRelations = relations(orderLineItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderLineItems.orderId],
    references: [orders.id],
  }),
  compound: one(compounds, {
    fields: [orderLineItems.compoundId],
    references: [compounds.id],
  }),
}));

export const batchTestsRelations = relations(batchTests, ({ many, one }) => ({
  assays: many(batchTestAssays),
  compound: one(compounds, {
    fields: [batchTests.compoundId],
    references: [compounds.id],
  }),
}));

export const batchTestAssaysRelations = relations(batchTestAssays, ({ one }) => ({
  batchTest: one(batchTests, {
    fields: [batchTestAssays.batchTestId],
    references: [batchTests.id],
  }),
}));
```

- [ ] **Step 2: Wire the `doses.inventoryItemId` foreign key**

Same inline form as Task 5 Step 3, since the standalone `foreignKey()` is ignored by drizzle-kit. In `lib/db/schema/doses.ts`, add the import and make the column a reference:

```typescript
import { inventoryItems } from './stock';
```

```typescript
    /** The vial this was drawn from, enabling auto-decrement. `set null`
     *  because discarding a vial must not delete the doses drawn from it. */
    inventoryItemId: uuid('inventory_item_id').references(
      () => inventoryItems.id,
      { onDelete: 'set null' },
    ),
```

Confirm `doses_inventory_item_id_...fk` with `ON DELETE set null` appears in the generated SQL in Step 4.

- [ ] **Step 3: Export from the barrel**

Replace `lib/db/schema/index.ts`:

```typescript
export * from './enums';
export * from './compounds';
export * from './doses';
export * from './cycles';
export * from './stock';
```

- [ ] **Step 4: Generate the migration**

```bash
pnpm db:generate
```

- [ ] **Step 5: Write the failing schema test**

Create `tests/integration/schema-stock.test.ts`:

```typescript
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  batchTestAssays,
  batchTests,
  compounds,
  inventoryItems,
  orderLineItems,
  orders,
} from '@/lib/db/schema';

import { createTestDb, type TestDb } from '../helpers/db';

const USER = 'user_test_1';

describe('stock schema', () => {
  let db: TestDb;
  let close: () => Promise<void>;
  let compoundId: string;

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    const [c] = await db
      .insert(compounds)
      .values({ name: 'Retatrutide', type: 'peptide', source: 'library' })
      .returning();
    compoundId = c.id;
  });

  afterAll(async () => {
    await close();
  });

  it('stores an order with line items and cascades them on delete', async () => {
    const [order] = await db
      .insert(orders)
      .values({
        userId: USER,
        supplier: 'JEEP',
        status: 'delivered',
        orderedAt: new Date('2026-03-06T09:00:00Z'),
        deliveredAt: new Date('2026-03-06T09:58:56Z'),
        totalCost: 150,
      })
      .returning();

    await db.insert(orderLineItems).values({
      orderId: order.id,
      compoundId,
      format: 'vial',
      quantity: 5,
      amountPerUnit: 20,
      unit: 'mg',
      cost: 150,
      tested: true,
    });

    await db.delete(orders).where(eq(orders.id, order.id));
    const remaining = await db.select().from(orderLineItems);
    expect(remaining).toHaveLength(0);
  });

  it('keeps inventory when its order is deleted', async () => {
    const [order] = await db
      .insert(orders)
      .values({ userId: USER, supplier: 'JEEP', status: 'delivered' })
      .returning();

    const [item] = await db
      .insert(inventoryItems)
      .values({
        userId: USER,
        compoundId,
        format: 'vial',
        amountPerUnit: 20,
        remainingAmount: 18,
        unit: 'mg',
        orderId: order.id,
      })
      .returning();

    await db.delete(orders).where(eq(orders.id, order.id));

    const [after] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, item.id));
    expect(after).toBeDefined();
    expect(after.orderId).toBeNull();
    expect(after.remainingAmount).toBe(18);
  });

  it('looks a batch test up by compound and batch number', async () => {
    await db.insert(inventoryItems).values({
      userId: USER,
      compoundId,
      format: 'vial',
      amountPerUnit: 20,
      remainingAmount: 20,
      unit: 'mg',
      batchNumber: 'RETA-0426',
    });

    const [test] = await db
      .insert(batchTests)
      .values({
        userId: USER,
        compoundId,
        batchNumber: 'RETA-0426',
        lab: 'Janoshik',
        labTaskNumber: '12345',
      })
      .returning();

    await db.insert(batchTestAssays).values([
      { batchTestId: test.id, analyte: 'Retatrutide', values: [22.4, 22.8], unit: 'mg' },
      { batchTestId: test.id, analyte: 'Purity', values: [99.4], unit: '%' },
    ]);

    const found = await db
      .select()
      .from(batchTests)
      .where(
        and(
          eq(batchTests.userId, USER),
          eq(batchTests.compoundId, compoundId),
          eq(batchTests.batchNumber, 'RETA-0426'),
        ),
      );
    expect(found).toHaveLength(1);

    const assays = await db
      .select()
      .from(batchTestAssays)
      .where(eq(batchTestAssays.batchTestId, test.id));
    expect(assays).toHaveLength(2);

    // jsonb must round-trip as a number array, not a string.
    const purity = assays.find((a) => a.analyte === 'Purity');
    expect(purity?.values).toEqual([99.4]);
    expect(typeof purity?.values[0]).toBe('number');
  });

  it('cascades assays when their batch test is deleted', async () => {
    const [test] = await db
      .insert(batchTests)
      .values({ userId: USER, compoundId, batchNumber: 'RETA-0527' })
      .returning();
    await db.insert(batchTestAssays).values({
      batchTestId: test.id,
      analyte: 'Purity',
      values: [98.1],
      unit: '%',
    });

    await db.delete(batchTests).where(eq(batchTests.id, test.id));
    const orphans = await db
      .select()
      .from(batchTestAssays)
      .where(eq(batchTestAssays.batchTestId, test.id));
    expect(orphans).toHaveLength(0);
  });
});
```

- [ ] **Step 6: Run the tests**

```bash
pnpm test:integration
```

Expected: PASS — 4 tests in this file, and the earlier files still green.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: inventory, orders, and batch test schema

Batch tests join to inventory by (compound_id, batch_number) rather than
a foreign key, because a test can be filed before or after the vials it
describes, and one test covers every vial from the batch.

Deleting an order keeps its inventory and nulls the link; the vials
still exist. Deleting a batch test cascades its assays.

Assay readings are jsonb number arrays because labs report several
replicate measurements per analyte."
```

---

## Task 7: Schema — supplies, usage rules, bloodwork, and settings

**Files:**
- Create: `lib/db/schema/misc.ts`
- Modify: `lib/db/schema/index.ts`
- Create: `tests/integration/schema-misc.test.ts`

**Interfaces:**
- Consumes: `compounds` (Task 4), `routeEnum` (Task 4).
- Produces: `supplies`, `supplyUsageRules`, `bloodwork`, `userSettings`.

- [ ] **Step 1: Write the schema**

The legacy `supplyUsageConfig` is a single JSON blob with a `globalDefaults` map keyed by route plus per-compound overrides. Here it becomes rows: `compoundId` null means "the default for this route", `compoundId` set means "the override for this compound on this route". Create `lib/db/schema/misc.ts`:

```typescript
import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { compounds } from './compounds';
import { routeEnum } from './enums';

export const supplies = pgTable(
  'supplies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    /** e.g. 'needles', 'syringes', 'alcohol-swabs'. */
    category: text('category').notNull(),
    name: text('name').notNull(),
    specs: text('specs'),
    quantity: integer('quantity').notNull().default(0),
    unit: text('unit').notNull().default('pcs'),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(0),
    notes: text('notes'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('supplies_user_category_idx').on(table.userId, table.category)],
);

/**
 * One row per (route, supply, quantity) pairing. Replaces the legacy
 * supplyUsageConfig JSON blob so rules are queryable and editable
 * individually.
 */
export const supplyUsageRules = pgTable(
  'supply_usage_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    route: routeEnum('route').notNull(),
    supplyCategory: text('supply_category').notNull(),
    supplyName: text('supply_name').notNull(),
    quantityPerDose: integer('quantity_per_dose').notNull().default(1),
    /** Null is the global default for the route; set overrides it for
     *  one compound. */
    compoundId: uuid('compound_id').references(() => compounds.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [
    index('supply_usage_rules_user_route_idx').on(table.userId, table.route),
    // Two rules for the same supply on the same route and compound would
    // double-count consumption.
    //
    // nullsNotDistinct is essential: compoundId is null for route
    // defaults, and Postgres's default NULLS DISTINCT would let an
    // unlimited number of duplicate route defaults through — exactly the
    // rows that need constraining most.
    //
    // A unique *constraint* rather than a unique *index*: drizzle only
    // exposes nullsNotDistinct() on unique(), not on uniqueIndex().
    unique('supply_usage_rules_key')
      .on(table.userId, table.route, table.supplyName, table.compoundId)
      .nullsNotDistinct(),
  ],
);

export const bloodwork = pgTable(
  'bloodwork',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    drawnAt: timestamp('drawn_at', { withTimezone: true }).notNull(),
    /** e.g. 'Total Testosterone', 'Hematocrit'. */
    marker: text('marker').notNull(),
    value: doublePrecision('value').notNull(),
    unit: text('unit').notNull(),
    lab: text('lab'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('bloodwork_user_drawn_idx').on(table.userId, table.drawnAt)],
);

export const userSettings = pgTable(
  'user_settings',
  {
    userId: text('user_id').notNull(),
    /** Starts with 'enabledInjectionSites'. */
    key: text('key').notNull(),
    value: jsonb('value').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex('user_settings_key').on(table.userId, table.key)],
);
```

- [ ] **Step 2: Export from the barrel**

Replace `lib/db/schema/index.ts`:

```typescript
export * from './enums';
export * from './compounds';
export * from './doses';
export * from './cycles';
export * from './stock';
export * from './misc';
```

- [ ] **Step 3: Generate the migration and confirm the NULLS clause**

Import `unique` alongside `uniqueIndex` from `drizzle-orm/pg-core` — `userSettings` still uses `uniqueIndex`, so both are needed.

```bash
pnpm db:generate
grep -i "nulls not distinct" drizzle/*.sql
```

Expected: `CONSTRAINT "supply_usage_rules_key" UNIQUE NULLS NOT DISTINCT(...)`.

**RESOLVED during execution.** Verified working on drizzle-orm 0.45.2 with the `unique()` form above. Note that `uniqueIndex(...).on(...).nullsNotDistinct()` throws `nullsNotDistinct is not a function` — the method exists only on the unique-constraint builder. If a future drizzle version drops it from there too, fall back to two partial indexes mirroring `compounds` in Task 4:

```typescript
    uniqueIndex('supply_usage_rules_default_key')
      .on(table.userId, table.route, table.supplyName)
      .where(sql`compound_id is null`),
    uniqueIndex('supply_usage_rules_override_key')
      .on(table.userId, table.route, table.supplyName, table.compoundId)
      .where(sql`compound_id is not null`),
```

adding `import { sql } from 'drizzle-orm';` to `misc.ts`, then regenerate.

- [ ] **Step 4: Write the failing schema test**

Create `tests/integration/schema-misc.test.ts`:

```typescript
import { and, eq, isNull } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  bloodwork,
  compounds,
  supplies,
  supplyUsageRules,
  userSettings,
} from '@/lib/db/schema';

import { createTestDb, type TestDb } from '../helpers/db';

const USER = 'user_test_1';

describe('supplies, bloodwork and settings schema', () => {
  let db: TestDb;
  let close: () => Promise<void>;
  let compoundId: string;

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    const [c] = await db
      .insert(compounds)
      .values({ name: 'Testosterone Enanthate', type: 'aas', source: 'library' })
      .returning();
    compoundId = c.id;
  });

  afterAll(async () => {
    await close();
  });

  it('stores the legacy intramuscular default rules as rows', async () => {
    await db.insert(supplyUsageRules).values([
      { userId: USER, route: 'intramuscular', supplyCategory: 'needles', supplyName: 'Drawing Needle', quantityPerDose: 1 },
      { userId: USER, route: 'intramuscular', supplyCategory: 'needles', supplyName: 'Injection Needle', quantityPerDose: 1 },
      { userId: USER, route: 'intramuscular', supplyCategory: 'syringes', supplyName: 'Syringe', quantityPerDose: 1 },
      { userId: USER, route: 'intramuscular', supplyCategory: 'alcohol-swabs', supplyName: 'Alcohol Swab', quantityPerDose: 2 },
    ]);

    const defaults = await db
      .select()
      .from(supplyUsageRules)
      .where(
        and(
          eq(supplyUsageRules.userId, USER),
          eq(supplyUsageRules.route, 'intramuscular'),
          isNull(supplyUsageRules.compoundId),
        ),
      );
    expect(defaults).toHaveLength(4);
    expect(defaults.find((r) => r.supplyName === 'Alcohol Swab')?.quantityPerDose).toBe(2);
  });

  it('allows a per-compound override alongside the route default', async () => {
    await db.insert(supplyUsageRules).values({
      userId: USER,
      route: 'intramuscular',
      supplyCategory: 'needles',
      supplyName: 'Drawing Needle',
      quantityPerDose: 2,
      compoundId,
    });

    const all = await db
      .select()
      .from(supplyUsageRules)
      .where(
        and(
          eq(supplyUsageRules.userId, USER),
          eq(supplyUsageRules.supplyName, 'Drawing Needle'),
        ),
      );
    expect(all).toHaveLength(2);
  });

  it('rejects a duplicate rule for the same route and supply', async () => {
    await expect(
      db.insert(supplyUsageRules).values({
        userId: USER,
        route: 'intramuscular',
        supplyCategory: 'syringes',
        supplyName: 'Syringe',
        quantityPerDose: 3,
      }),
    ).rejects.toThrow();
  });

  it('stores supplies with a low-stock threshold', async () => {
    const [row] = await db
      .insert(supplies)
      .values({
        userId: USER,
        category: 'alcohol-swabs',
        name: 'Alcohol Pads',
        quantity: 1000,
        unit: 'pcs',
        lowStockThreshold: 10,
      })
      .returning();
    expect(row.quantity).toBe(1000);
  });

  it('stores a bloodwork marker', async () => {
    const [row] = await db
      .insert(bloodwork)
      .values({
        userId: USER,
        drawnAt: new Date('2026-08-01T09:00:00Z'),
        marker: 'Total Testosterone',
        value: 842.5,
        unit: 'ng/dL',
        lab: 'Quest',
      })
      .returning();
    expect(row.value).toBe(842.5);
  });

  it('stores one settings row per user and key', async () => {
    await db.insert(userSettings).values({
      userId: USER,
      key: 'enabledInjectionSites',
      value: ['left-delt', 'right-delt', 'abdomen-left'],
    });

    const [row] = await db
      .select()
      .from(userSettings)
      .where(
        and(
          eq(userSettings.userId, USER),
          eq(userSettings.key, 'enabledInjectionSites'),
        ),
      );
    expect(row.value).toEqual(['left-delt', 'right-delt', 'abdomen-left']);

    await expect(
      db.insert(userSettings).values({
        userId: USER,
        key: 'enabledInjectionSites',
        value: [],
      }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 5: Run the tests**

```bash
pnpm test:integration && pnpm typecheck
```

Expected: PASS — 6 tests in this file; all four schema test files green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: supplies, usage rules, bloodwork, and settings schema

supply_usage_rules replaces the legacy supplyUsageConfig JSON blob: one
row per route/supply pairing, with a null compound_id meaning 'route
default' and a set one meaning 'override for this compound'. A unique
index stops two rules double-counting the same supply.

Completes the schema. Every entity in spec section 3 now has a table."
```

---

## Task 8: Clerk authentication and the userScoped chokepoint

**Files:**
- Create: `proxy.ts`, `lib/auth.ts`, `lib/db/scoped.ts`
- Create: `app/sign-in/[[...rest]]/page.tsx`
- Modify: `app/layout.tsx`, `.env.example`
- Create: `tests/unit/scoped.test.ts`, `tests/integration/scoped.test.ts`

**Interfaces:**
- Consumes: `db` (Task 3), all schema (Tasks 4–7).
- Produces:
  - `requireUserId(): Promise<string>` from `lib/auth.ts` — throws if unauthenticated.
  - `userScoped<T>(table: T, userId: string, ...extra: SQL[]): SQL` from `lib/db/scoped.ts`. **Every** query in every later plan composes its `where` clause through this.

- [ ] **Step 1: Provision Clerk**

```bash
pnpm dlx vercel@latest link
pnpm dlx vercel@latest integration add clerk
pnpm dlx vercel@latest env pull .env.local
```

Confirm `.env.local` now has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

- [ ] **Step 2: Install the Clerk SDK**

```bash
pnpm add @clerk/nextjs
```

- [ ] **Step 3: Write the auth helper**

Create `lib/auth.ts`:

```typescript
import { auth } from '@clerk/nextjs/server';

/**
 * Returns the signed-in Clerk user ID, throwing if there is none.
 *
 * Server Components and Server Actions under `(authed)` should use this
 * rather than `auth()` directly: `proxy.ts` has already redirected any
 * unauthenticated request, so a null userId here means a routing bug,
 * and failing loudly is better than silently querying with `undefined`.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('requireUserId called without an authenticated session');
  }
  return userId;
}
```

- [ ] **Step 4: Write the failing scoping test**

The unit test pins the helper's shape; the integration test proves it actually filters. Create `tests/unit/scoped.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import { doses } from '@/lib/db/schema';
import { userScoped } from '@/lib/db/scoped';

describe('userScoped', () => {
  it('returns a condition referencing the table userId column', () => {
    const condition = userScoped(doses, 'user_abc');
    expect(condition).toBeDefined();
  });

  it('rejects an empty user id rather than matching everything', () => {
    expect(() => userScoped(doses, '')).toThrow(/user id/i);
  });

  it('rejects a table without a userId column', () => {
    // @ts-expect-error - deliberately passing an unscoped table
    expect(() => userScoped({}, 'user_abc')).toThrow(/userId/);
  });
});
```

- [ ] **Step 5: Run it to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `Failed to resolve import "@/lib/db/scoped"`.

- [ ] **Step 6: Write the scoping helper**

Create `lib/db/scoped.ts`:

```typescript
import { and, eq, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

/** A table that carries a non-null user_id column. */
export type ScopedTable = PgTable & { userId: PgColumn };

/**
 * The single chokepoint for auth filtering. Compose every `where` clause
 * through this rather than writing `eq(table.userId, userId)` by hand, so
 * that a forgotten filter is a missing import rather than a silent leak
 * of another user's rows.
 *
 *   db.select().from(doses).where(userScoped(doses, userId))
 *   db.select().from(doses).where(userScoped(doses, userId, eq(doses.cycleId, id)))
 */
export function userScoped(
  table: ScopedTable,
  userId: string,
  ...extra: (SQL | undefined)[]
): SQL {
  if (!table?.userId) {
    throw new Error('userScoped: table has no userId column');
  }
  if (!userId) {
    throw new Error('userScoped: refusing to scope to an empty user id');
  }
  const condition = and(eq(table.userId, userId), ...extra);
  if (!condition) {
    throw new Error('userScoped: produced an empty condition');
  }
  return condition;
}
```

- [ ] **Step 7: Run the unit test**

```bash
pnpm test:unit
```

Expected: PASS — 3 tests.

- [ ] **Step 8: Write the integration test that proves isolation**

Create `tests/integration/scoped.test.ts`:

```typescript
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { compounds, doses } from '@/lib/db/schema';
import { userScoped } from '@/lib/db/scoped';

import { createTestDb, type TestDb } from '../helpers/db';

const ALICE = 'user_alice';
const BOB = 'user_bob';

describe('userScoped isolation', () => {
  let db: TestDb;
  let close: () => Promise<void>;

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    const [compound] = await db
      .insert(compounds)
      .values({ name: 'BPC-157', type: 'peptide', source: 'library' })
      .returning();

    await db.insert(doses).values([
      {
        id: crypto.randomUUID(),
        userId: ALICE,
        compoundId: compound.id,
        amount: 250,
        unit: 'mcg',
        route: 'subcutaneous',
        administeredAt: new Date('2026-08-01T08:00:00Z'),
      },
      {
        id: crypto.randomUUID(),
        userId: BOB,
        compoundId: compound.id,
        amount: 500,
        unit: 'mcg',
        route: 'subcutaneous',
        administeredAt: new Date('2026-08-01T09:00:00Z'),
      },
    ]);
  });

  afterAll(async () => {
    await close();
  });

  it("returns only the scoped user's rows", async () => {
    const rows = await db.select().from(doses).where(userScoped(doses, ALICE));
    expect(rows).toHaveLength(1);
    expect(rows[0].amount).toBe(250);
  });

  it('composes additional conditions without dropping the user filter', async () => {
    const rows = await db
      .select()
      .from(doses)
      .where(userScoped(doses, ALICE, eq(doses.amount, 500)));
    // Bob's dose is 500mcg, but it is not Alice's, so nothing matches.
    expect(rows).toHaveLength(0);
  });
});
```

- [ ] **Step 9: Run it**

```bash
pnpm test:integration
```

Expected: PASS — 2 tests. The second is the important one: it fails if `userScoped` ever ORs its conditions instead of ANDing them.

- [ ] **Step 10: Write `proxy.ts`**

Next.js 16 renamed this file from `middleware.ts`, the function from `middleware`, and the config export from `config`. Create `proxy.ts` at the project root:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Everything except the sign-in flow and static assets requires a session.
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/manifest.webmanifest']);

/**
 * Anything with a file extension is a static asset, not an app route.
 *
 * REQUIRED — do not remove. proxyConfig's matcher below is meant to
 * exclude these, but it is not reliably applied in production: every
 * icon, /sw.js and even /next.svg came back 404 with
 * `x-clerk-auth-reason: protect-rewrite`, which silently breaks PWA
 * install. Only routes listed in isPublicRoute reached the origin at
 * all. Checking here keeps correctness independent of the matcher, and
 * fails safe — app routes have no extension.
 *
 * The dev server serves public/ before the proxy runs, so `pnpm dev`
 * will NOT reproduce this. Verify against `pnpm build && pnpm start`.
 */
const STATIC_ASSET = /\.[^/]+$/;

export default clerkMiddleware(async (auth, request) => {
  if (STATIC_ASSET.test(request.nextUrl.pathname)) return;
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const proxyConfig = {
  matcher: [
    // Skip Next internals and static files unless they appear in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

- [ ] **Step 11: Verify the export name Next.js 16 expects**

The default export above follows Clerk's documented pattern. Confirm Next.js picks it up:

```bash
pnpm build 2>&1 | grep -i "proxy\|middleware" || echo "no proxy warnings"
```

Expected: no warning about a missing or misnamed proxy export. **If the build warns that `proxy.ts` must export a function named `proxy`**, change the export to a named one:

```typescript
export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

Re-run the build and confirm the warning is gone before continuing.

- [ ] **Step 12: Add ClerkProvider to the root layout**

Modify `app/layout.tsx` so the whole tree is wrapped:

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';

import { appDescription, appName } from '@/lib/constants';

import './globals.css';

export const metadata: Metadata = {
  title: appName,
  description: appDescription,
};

export const viewport: Viewport = {
  // The dose logger is used one-handed on a phone; zoom-on-focus fighting
  // the layout is worse than the accessibility cost here is small.
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-dvh bg-background text-foreground antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 13: Add the sign-in page**

Create `app/sign-in/[[...rest]]/page.tsx`:

```tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <SignIn />
    </main>
  );
}
```

- [ ] **Step 14: Verify the redirect works**

```bash
pnpm dev
```

Visit `http://localhost:3000/` and confirm it redirects to `/sign-in`. Sign in and confirm it returns to `/`. Stop the dev server.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: Clerk auth and the userScoped query chokepoint

proxy.ts, not middleware.ts — Next.js 16 renamed the file, the function,
and the config export. The spec predates the rename.

Every Drizzle query composes its where clause through userScoped(), so a
forgotten auth filter is a missing import rather than a silent leak. It
refuses an empty user id instead of matching every row, and an
integration test asserts that adding a condition ANDs with the user
filter rather than replacing it."
```

---

## Task 9: The app shell — tab bar and sheet slot

**Files:**
- Create: `app/(authed)/layout.tsx`, `app/(authed)/page.tsx`
- Create: `app/(authed)/@sheet/default.tsx`, `app/(authed)/@sheet/(.)log/page.tsx`
- Create: `app/(authed)/log/page.tsx`
- Create: `app/(authed)/cycles/page.tsx`, `app/(authed)/library/page.tsx`, `app/(authed)/stock/page.tsx`
- Create: `components/tab-bar.tsx`, `components/sheet-shell.tsx`
- Create: `tests/unit/tab-bar.test.ts`

**Interfaces:**
- Consumes: `requireUserId` (Task 8), design tokens (Task 2).
- Produces:
  - `TABS` from `components/tab-bar.tsx` — the tab manifest later plans add nothing to.
  - `SheetShell` from `components/sheet-shell.tsx` — every intercepted modal in later plans wraps its content in this.

The spec's §4 layout shows `@sheet/log/page.tsx`. That is a plain parallel slot: it would render the logger *in addition to* whatever tab you were on, on every navigation, and a direct visit to `/log` would 404. The behaviour the spec describes — a sheet over the current tab, a full page on a direct link — needs an **intercepting** route, `@sheet/(.)log/page.tsx`, alongside a real `log/page.tsx`. This task builds the corrected shape.

- [ ] **Step 1: Write the failing tab manifest test**

Create `tests/unit/tab-bar.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import { TABS } from '@/components/tab-bar';

describe('tab manifest', () => {
  it('has the five tabs from the spec, in order', () => {
    expect(TABS.map((t) => t.label)).toEqual([
      'Home',
      'Cycles',
      'Log',
      'Library',
      'Stock',
    ]);
  });

  it('promotes Log to the centre primary action', () => {
    const log = TABS.find((t) => t.label === 'Log');
    expect(log?.primary).toBe(true);
    expect(TABS.indexOf(log!)).toBe(2);
  });

  it('gives every tab a distinct route', () => {
    const routes = TABS.map((t) => t.href);
    expect(new Set(routes).size).toBe(routes.length);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `Failed to resolve import "@/components/tab-bar"`.

- [ ] **Step 3: Write the tab bar**

Create `components/tab-bar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

export type Tab = {
  label: string;
  href: string;
  /** The centre action, rendered as a raised primary button. */
  primary?: boolean;
};

export const TABS: Tab[] = [
  { label: 'Home', href: '/' },
  { label: 'Cycles', href: '/cycles' },
  { label: 'Log', href: '/log', primary: true },
  { label: 'Library', href: '/library' },
  { label: 'Stock', href: '/stock' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      // pb accounts for the iOS home indicator; without it the centre
      // button sits under the system gesture area.
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-around px-2">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);

          if (tab.primary) {
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-label="Log a dose"
                  className="-mt-5 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
                >
                  <span className="text-2xl leading-none">+</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Write the sheet shell**

Closing must use `router.back()`. A `<Link>` or `router.push()` would push a new history entry instead of unwinding the interception, leaving the sheet stuck open on back-navigation. Create `components/sheet-shell.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function SheetShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') router.back();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [router]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => router.back()}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl sm:pb-6">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Write the authed layout**

Create `app/(authed)/layout.tsx`:

```tsx
import { requireUserId } from '@/lib/auth';
import { TabBar } from '@/components/tab-bar';

export default async function AuthedLayout({
  children,
  sheet,
}: {
  children: React.ReactNode;
  /** The @sheet parallel slot. */
  sheet: React.ReactNode;
}) {
  // proxy.ts has already redirected anonymous requests; this throws only
  // if that routing is broken, which we want to hear about loudly.
  await requireUserId();

  return (
    <div className="mx-auto max-w-lg">
      {/* Bottom padding clears the fixed tab bar. */}
      <main className="min-h-dvh px-4 pb-28 pt-6">{children}</main>
      {sheet}
      <TabBar />
    </div>
  );
}
```

- [ ] **Step 7: Write the required slot default**

Without this file, a hard refresh of any page 404s because Next cannot resolve the `@sheet` slot. Create `app/(authed)/@sheet/default.tsx`:

```tsx
export default function SheetDefault() {
  return null;
}
```

- [ ] **Step 8: Write the intercepted and full-page loggers**

Both are stubs; Plan 3 fills them with the real form. They share nothing yet, but the pairing is what makes `/log` work as both a sheet and a deep link.

Create `app/(authed)/@sheet/(.)log/page.tsx`:

```tsx
import { SheetShell } from '@/components/sheet-shell';

export default function LogSheet() {
  return (
    <SheetShell title="Log a dose">
      <p className="text-sm text-muted-foreground">
        The dose logger lands here in Plan 3.
      </p>
    </SheetShell>
  );
}
```

Create `app/(authed)/log/page.tsx`:

```tsx
export default function LogPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Log a dose</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The dose logger lands here in Plan 3.
      </p>
    </>
  );
}
```

- [ ] **Step 9: Write the remaining tab placeholders**

Each is a stub whose only job is to make its tab navigable. Create `app/(authed)/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Home</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Active compounds, today&apos;s doses, and the decay chart land here in
        Plan 3.
      </p>
    </>
  );
}
```

Create `app/(authed)/cycles/page.tsx`, `app/(authed)/library/page.tsx`, and `app/(authed)/stock/page.tsx` following the same shape, changing the heading to `Cycles`, `Library`, and `Stock` and the body to name Plan 4, Plan 2, and Plan 5 respectively.

- [ ] **Step 10: Verify the interception behaves**

```bash
pnpm dev
```

Check all four by hand:
1. From Home, tap the centre **+**. The logger appears as a sheet **over** the Home content, and the URL is `/log`.
2. Press Escape, or tap the backdrop. The sheet closes and you are back on Home.
3. With the sheet open, hard-refresh the page. You get the **full-page** logger, not the sheet, and no 404.
4. Navigate to `/cycles`, then tap **+**. The sheet opens over Cycles, and closing returns to Cycles — not to Home.

If step 3 404s, `@sheet/default.tsx` is missing or misnamed. If step 1 shows a full page instead of a sheet, the `(.)` interceptor is in the wrong directory. Stop the dev server.

- [ ] **Step 11: Verify build and types**

```bash
pnpm typecheck && pnpm build
```

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: phone-first app shell with tab bar and sheet slot

Five bottom tabs with Log promoted to a raised centre action, per spec
section 4.

The dose logger uses an intercepting route, @sheet/(.)log, plus a real
/log page — not the plain @sheet/log slot the spec's directory listing
shows. A plain slot would render the logger alongside every tab and 404
on a direct link. The interceptor gives a sheet over the current tab, a
full page on deep link, and closing returns to the tab you came from.

@sheet/default.tsx is required: without it every hard refresh 404s.

SheetShell closes with router.back() so the interception unwinds rather
than pushing another history entry."
```

---

## Task 10: PWA manifest, icons, and app-shell service worker

**Files:**
- Create: `app/manifest.ts`, `public/sw.js`, `components/service-worker.tsx`
- Create: `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`, `public/apple-touch-icon.png`
- Modify: `app/layout.tsx`
- Create: `tests/unit/manifest.test.ts`

**Interfaces:**
- Consumes: `appName`, `appDescription` (Task 1); design tokens (Task 2).
- Produces: an installable PWA. Nothing in later plans imports from this task.

- [ ] **Step 1: Write the failing manifest test**

Create `tests/unit/manifest.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import manifest from '@/app/manifest';

describe('PWA manifest', () => {
  const value = manifest();

  it('is installable as a standalone portrait app', () => {
    expect(value.display).toBe('standalone');
    expect(value.orientation).toBe('portrait');
    expect(value.start_url).toBe('/');
  });

  it('ships both the required icon sizes plus a maskable one', () => {
    const sizes = value.icons?.map((icon) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(value.icons?.some((icon) => icon.purpose === 'maskable')).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL — `Failed to resolve import "@/app/manifest"`.

- [ ] **Step 3: Write the manifest**

Create `app/manifest.ts`:

```typescript
import type { MetadataRoute } from 'next';

import { appDescription, appName } from '@/lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: 'Tracker',
    description: appDescription,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test:unit
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Generate the icons**

Write `scripts/make-icons.mjs`. A plain mark rather than a logo — this is a private tracker, and a legible glyph at 48px matters more than branding.

```javascript
import { mkdirSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = (size, inset) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${inset ? 0 : size * 0.22}" fill="#0d1b1e"/>
  <g transform="translate(${size / 2}, ${size / 2})">
    <circle r="${size * (inset ? 0.26 : 0.31)}" fill="none" stroke="#3aa8b8" stroke-width="${size * 0.055}"/>
    <path d="M ${-size * 0.16} ${size * 0.09} Q ${-size * 0.05} ${-size * 0.19} ${size * 0.03} ${size * 0.02} T ${size * 0.17} ${-size * 0.07}"
          fill="none" stroke="#e8f4f6" stroke-width="${size * 0.05}"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

mkdirSync('public', { recursive: true });

for (const [file, size, inset] of [
  ['public/icon-192.png', 192, false],
  ['public/icon-512.png', 512, false],
  ['public/icon-maskable-512.png', 512, true],
  ['public/apple-touch-icon.png', 180, false],
]) {
  const png = new Resvg(svg(size, inset), {
    fitTo: { mode: 'width', value: size },
  })
    .render()
    .asPng();
  writeFileSync(file, png);
  console.log(`wrote ${file}`);
}
```

Run it:

```bash
pnpm add -D @resvg/resvg-js
node scripts/make-icons.mjs
```

The maskable variant insets its artwork to ~52% of the canvas so Android's circular and squircle masks do not clip the glyph.

- [ ] **Step 6: Verify the icons rendered**

```bash
ls -la public/*.png
```

Expected: four PNGs, each non-zero. Open `public/icon-512.png` and confirm the mark is visible and centred.

- [ ] **Step 7: Write the service worker**

App shell only. Caching API responses would put stale dose data on screen, and the spec rules out offline data in v1. Create `public/sw.js`:

```javascript
// App-shell caching only. No data caching, no offline write queue —
// v1 requires the network for every mutation (spec section 5).
const CACHE = 'ct-shell-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never touch mutations or anything but same-origin GETs.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Navigations: network first, cache only as an offline fallback, so a
  // launched app never shows yesterday's dashboard while online.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/').then((r) => r ?? Response.error())),
    );
    return;
  }

  // Static assets: stale-while-revalidate for fast cold launch.
  if (/\.(?:css|js|png|svg|woff2?)$/.test(new URL(request.url).pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
        return cached ?? network;
      }),
    );
  }
});
```

- [ ] **Step 8: Register the service worker**

Create `components/service-worker.tsx`:

```tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration failure costs install-time caching only; the app
      // works without it, so there is nothing to surface to the user.
    });
  }, []);

  return null;
}
```

- [ ] **Step 9: Add iOS metadata and the registration to the root layout**

iOS ignores the web manifest for home-screen icons and standalone display, so it needs its own tags. Modify `app/layout.tsx` — extend `metadata`, and render `<ServiceWorker />` inside `<body>`:

```tsx
export const metadata: Metadata = {
  title: appName,
  description: appDescription,
  appleWebApp: {
    capable: true,
    title: appName,
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1b1e' },
  ],
};
```

Add the import and the component:

```tsx
import { ServiceWorker } from '@/components/service-worker';
```

```tsx
        <body className="min-h-dvh bg-background text-foreground antialiased">
          {children}
          <ServiceWorker />
        </body>
```

- [ ] **Step 10: Verify the manifest and every icon serves**

Against a production build, not `pnpm dev` — the dev server serves `public/` before the proxy runs and will hide a proxy misconfiguration:

```bash
pnpm build && pnpm start
```

In another terminal:

```bash
for p in /manifest.webmanifest /icon-192.png /icon-512.png \
         /icon-maskable-512.png /apple-touch-icon.png /sw.js; do
  printf "%-28s " "$p"
  curl -s -o /dev/null -w "status=%{http_code} type=%{content_type}\n" "localhost:3000$p"
done
```

Expected: all six 200, with `image/png` on the icons and `application/manifest+json` on the manifest. **A 404 here means the proxy is rewriting static assets** — see the `STATIC_ASSET` guard in Task 8 Step 10. Stop the server.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: installable PWA with app-shell service worker

Manifest, three icons (including a maskable variant inset for Android's
circular masks), and iOS-specific meta, since iOS ignores the web
manifest for home-screen install.

The service worker caches the app shell only. Navigations are network
first with the cache as an offline fallback, so a launched app never
shows a stale dashboard while online, and non-GET requests are never
intercepted. No data caching and no write queue — v1 requires the
network for every mutation."
```

---

## Task 11: CI and first deploy

**Files:**
- Create: `.github/workflows/ci.yml`, `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: the `typecheck`, `test:unit`, `test:integration`, and `db:migrate` scripts from earlier tasks.
- Produces: a green CI run on every PR, and a production deployment with migrations applied.

- [ ] **Step 1: Add the migration hook**

Migrations run on deploy, so a merged schema change reaches production without a manual step. Add to `package.json`:

```json
{
  "scripts": {
    "postbuild": "drizzle-kit migrate"
  }
}
```

- [ ] **Step 2: Write the CI workflow**

Integration tests need no services because PGlite runs in-process. Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm typecheck

      - run: pnpm test:unit

      # No Postgres service: the integration suite runs against PGlite
      # in-process. DATABASE_URL is only needed because lib/db/index.ts
      # throws at import time without it.
      - run: pnpm test:integration
        env:
          DATABASE_URL: postgres://unused:unused@localhost:5432/unused
```

- [ ] **Step 3: Verify the workflow locally**

Run exactly what CI runs:

```bash
pnpm typecheck && pnpm test:unit && pnpm test:integration
```

Expected: all green. If `test:integration` fails on `DATABASE_URL is not set`, an integration test is importing `@/lib/db` instead of the PGlite helper — fix the import rather than loosening the check in `lib/db/index.ts`.

- [ ] **Step 4: Write the README**

Create `README.md`:

````markdown
# Compound Tracker

Phone-first PWA for tracking peptide, AAS, and HGH compound levels with
pharmacokinetic decay modeling. Replaces the Electron app at
`rglov/compound-tracker`.

## Stack

Next.js 16 (App Router, Cache Components) · Clerk · Neon Postgres ·
Drizzle · Tailwind + shadcn/ui · Recharts · Vercel

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in, or: vercel env pull .env.local
pnpm db:migrate
pnpm dev
```

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test:unit` | Unit tests (fast, no fixtures) |
| `pnpm test:integration` | Integration tests against in-process PGlite |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Drizzle Studio |

## Conventions

- **Every query goes through `userScoped()`** (`lib/db/scoped.ts`). A query
  that filters on `userId` by hand is a bug waiting to happen.
- **Measured quantities use `doublePrecision`, never `numeric`** — Drizzle
  maps `numeric` to a string, which silently breaks arithmetic.
- **Request interception lives in `proxy.ts`**, not `middleware.ts`. Next.js
  16 renamed it.
- Migrations are generated, never hand-edited. Change the schema, run
  `pnpm db:generate`.

## Docs

- Design: `docs/spec.md`
- Plans: `docs/plans/`
````

- [ ] **Step 5: Copy the spec and plans into the new repo**

The plans are the working documents from here on, so they travel with the code:

```bash
mkdir -p docs/plans
cp /Users/rglov/Code/compound-tracker/docs/superpowers/specs/2026-08-29-compound-tracker-rebuild-design.md docs/spec.md
cp /Users/rglov/Code/compound-tracker/docs/superpowers/plans/*.md docs/plans/
```

- [ ] **Step 6: Preserve the legacy snapshot**

Plan 6's import script reads this, and the legacy repo gets archived:

```bash
cp /Users/rglov/Code/compound-tracker/data/compound-tracker-data.json \
   docs/legacy-import-snapshot.json
```

- [ ] **Step 7: Push and confirm CI passes**

```bash
git add -A
git commit -m "ci: typecheck, unit and integration tests on every PR

Integration tests need no Postgres service container because PGlite runs
in-process. Migrations apply on deploy via postbuild.

Carries the design spec, the plan set, and the legacy data snapshot into
the repo so they survive the old repo being archived."
git push -u origin main
```

Open the Actions tab and confirm the `verify` job is green. **If it fails, fix it before continuing** — every later plan assumes CI is a reliable gate.

- [ ] **Step 8: Deploy to production**

```bash
pnpm dlx vercel@latest --prod
```

- [ ] **Step 9: Run the manual verification checklist**

On a phone, against the production URL:

1. Sign in with a magic link. You land on Home.
2. All five tabs navigate, and the active tab is visibly distinct.
3. The centre **+** opens the logger as a sheet over the current tab; closing returns to that same tab.
4. "Add to Home Screen" installs the app with the correct icon.
5. Launching from the home screen opens standalone — no browser chrome, no address bar.
6. The tab bar sits above the home indicator, not under it.

On desktop:

7. Visiting the production URL signed out redirects to `/sign-in`.

Record any failure here and fix before declaring the plan done.

- [ ] **Step 10: Final commit**

```bash
git add -A
git commit --allow-empty -m "chore: foundation complete

Deployed, installable, sign-in-able shell with the full schema in place.
Plans 2-6 build features on this."
git push
```

---

## Self-Review

**Spec coverage.** Every §3 entity has a table: Compound, Blend, BlendComponent (Task 4); Cycle, CycleEntry, ScheduledDose, Dose (Task 5); InventoryItem, Order, OrderLineItem, BatchTest, BatchTestAssay (Task 6); Supply, SupplyUsageRule, Bloodwork, UserSetting (Task 7). §2's stack, data flow, and `userScoped` chokepoint are Tasks 1, 3, and 8. §4's tab bar and sheet routing are Task 9. §5's Clerk and PWA are Tasks 8 and 10. §10's CI line is Task 11.

**Deliberately deferred, and where each lands.** Recharts is installed when the first chart exists (Plan 3). Vercel Blob is installed with the batch-test upload (Plan 5). Playwright is set up with the one E2E hero-loop test (Plan 6). Installing them here would add dependencies no code imports.

**Two spec fields dropped, with reasons.** `Compound.aliases` — no such data exists; the current alias behaviour is a substring search over notes, tags, and benefits, which Plan 2 implements as full-text search. `Cycle.goal` — not present in the legacy model, and nothing in the spec's UI section uses it.

**Nullable columns in unique indexes.** Postgres treats NULLs as distinct, so a unique index over a nullable column constrains nothing for the rows where it is null — which here are the most important rows. Three indexes hit this: `compounds` (library seeds have a null `userId`), solved with two partial indexes; and `supply_usage_rules` (route defaults have a null `compoundId`), solved with `nullsNotDistinct()` and a partial-index fallback. `scheduled_doses.logged_dose_id` relies on the *default* behaviour instead — many pending slots share a null `loggedDoseId` and must be allowed to, while any two non-null values must collide.

**Known verification points.** Three steps ask the implementer to confirm behaviour rather than assume it, each flagged inline with a concrete fallback: Task 5 Step 3 (whether drizzle-kit picks up a standalone `foreignKey` for the circular `doses ↔ cycles` reference), Task 7 Step 3 (whether the installed drizzle-kit emits `NULLS NOT DISTINCT`), and Task 8 Step 11 (whether Next.js 16 accepts Clerk's default export in `proxy.ts` or requires a named `proxy` export). None blocks the plan; each names the alternative to use.

---

## Next

Plan 2 — PK core and compound library. It ports `decay.js` to `lib/pk/` with the test matrix from spec §10, seeds the `compounds` table by merging `COMPOUND_LIBRARY` and `LIBRARY_DATA`, and builds the Library tab.
