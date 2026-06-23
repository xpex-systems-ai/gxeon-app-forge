# APPFORGE-010.5 Baseline Stabilization — Content Factory and Main QA

Date: 2026-06-23

## Scope

Safe maintenance only. No new product modules, database persistence, real integrations, checkout creation, payment processing, webhooks, n8n live connections, marketplace clients, social posting, email sending, WhatsApp sending, API keys, tokens, credentials or secrets were added.

## Original failing diagnostics

Before changing files, baseline diagnostics were run from the repository root.

### `pnpm run lint`

Failed with three parser errors:

- `app/components/gxeon/ContentFactoryMVP.tsx:313:12` — JSX expressions had no single parent element.
- `app/lib/gxeon/contentFactory.spec.ts:21:2` — malformed import/test syntax, `',' expected` / `Expected ";" but found "from"`.
- `app/lib/gxeon/contentFactory.ts:124:2` — malformed TypeScript union, `Expression expected`.

### `pnpm run build`

Failed during Vite/esbuild transform:

- `app/components/gxeon/ContentFactoryMVP.tsx:314:17` — `Expected ")" but found "className"` caused by interleaved fieldset JSX.

### `pnpm run test`

Failed with one suite transform error:

- `app/lib/gxeon/contentFactory.spec.ts:21:2` — `Expected ";" but found "from"`.
- The remainder of the suite that had already run reported 104 passing tests before the Content Factory spec transform failure stopped the run.

## Root causes found

1. `app/components/gxeon/ContentFactoryMVP.tsx` contained duplicated import specifiers, duplicate state/status calls, duplicate select controls and interleaved platform/channel fieldset JSX from a bad merge or pasted block.
2. `app/lib/gxeon/contentFactory.ts` contained duplicated type aliases, malformed union members after a semicolon, duplicated `CTA_LABELS`, duplicate object properties and interleaved output arrays.
3. `app/lib/gxeon/contentFactory.spec.ts` contained malformed test code where imported symbols were accidentally inserted into the `strongDraft` object followed by `} from './contentFactory';`, plus nested/duplicated test cases without closing braces.

## Files changed

- `app/components/gxeon/ContentFactoryMVP.tsx`
- `app/lib/gxeon/contentFactory.ts`
- `app/lib/gxeon/contentFactory.spec.ts`
- `docs/gxeon/APPFORGE_BASELINE_STABILIZATION_CONTENT_FACTORY_REPORT.md`

## Fixes applied

- Restored valid Content Factory helper exports, draft normalization, validation, output generation, prompt generation, Markdown generation and JSON export logic.
- Restored valid Content Factory MVP React JSX with separate platform and content-channel checkbox groups.
- Preserved localStorage save/load behavior, explicit local import actions, copy/export actions, manual-first warnings and the composer handoff requiring user review.
- Restored Content Factory tests so they validate missing recommended fields, manual-first prompt safety language, generated content sections, JSON safety flags, secret-like key exclusion and payload delimiter sanitization.
- Verified PreChatHome still imports and renders Product Builder, Marketplace Pack Generator, Checkout Blueprint, Landing Builder, Content Factory, Integration Readiness, Approval Ledger, Beta Product Pipeline and Revenue Ledger in the existing module cluster, with Import Chat and Clone repo controls still present.

## Local-only safety review

No changed file adds real API calls, database writes, payment processing, checkout link creation, social posting, email sending, WhatsApp sending, marketplace API clients, OAuth, webhooks, n8n live connections or secrets.

The GXEON module scan found localStorage usage, dry-run labels, placeholder payloads and safety text only. Strings mentioning checkout, Stripe, n8n, webhooks, tokens or API keys are either safety warnings, enum labels, test fixtures for secret exclusion, or dry-run blueprint fields.

## Validation commands run

- `pnpm run lint` — passed.
- `pnpm run build` — passed with existing non-blocking Vite/UnoCSS/chunk-size warnings.
- `pnpm run test` — passed, 13 files / 109 tests.
- `pnpm exec vitest --run app/lib/gxeon/contentFactory.spec.ts` — passed, 5 tests.
- `pnpm exec vitest --run app/lib/gxeon/revenueLedger.spec.ts` — passed, 8 tests.

Additional final checks:

- `git diff --check` — passed.
- Changed-file secret scan — passed with no findings.

## Remaining warnings

`pnpm run build` emits non-blocking warnings already outside this stabilization fix:

- Vite CJS Node API deprecation warning.
- React Router/Remix single-fetch future flag notice.
- Browser externalization warnings for `node:crypto` / `path` usage in existing dependencies/providers.
- UnoCSS icon-load warnings for `ph:lock-closed`, `ph:git-repository` and `ph-filter-duotone`.
- Vite dynamic/static import chunking notices and large chunk warnings.

These warnings do not block the build.

## APPFORGE-011 readiness

APPFORGE-011 Agent-Ready Operating Layer is safe to start after this stabilization, provided it keeps the existing manual-first / human-approved safety boundaries and does not add live integrations without a separate approved mission.
