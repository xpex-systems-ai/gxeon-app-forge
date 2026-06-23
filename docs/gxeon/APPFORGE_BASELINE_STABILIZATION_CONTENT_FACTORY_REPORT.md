# APPFORGE-010.5 Baseline Stabilization — Content Factory and Main QA

## Mission

Stabilize the GXEON App Forge main branch after Revenue Ledger PR #23 by repairing the remaining ContentFactory parser, JSX, TypeScript, lint, build, and test failures without adding product modules, live integrations, database persistence, payment processing, checkout creation, webhooks, external API clients, secrets, or automated send/post/publish behavior.

## Original failing diagnostics

### `pnpm run lint`

Initial lint failed with three parser errors:

- `app/components/gxeon/ContentFactoryMVP.tsx:313:12` — JSX expressions needed one parent element.
- `app/lib/gxeon/contentFactory.spec.ts:21:2` — malformed import/test fixture produced `',' expected` / `Expected ';' but found "from"`.
- `app/lib/gxeon/contentFactory.ts:124:2` — malformed union type / duplicated block produced `Expression expected`.

### `pnpm run build`

Initial production build failed in Vite/esbuild:

- `app/components/gxeon/ContentFactoryMVP.tsx:314:17` — `Expected ")" but found "className"` caused by interleaved platform/channel fieldset JSX.

### `pnpm run test`

Initial test run failed one suite while other suites, including Revenue Ledger, passed:

- `app/lib/gxeon/contentFactory.spec.ts:21:2` — transform failed because the spec had a broken import/object literal merge.
- `app/lib/gxeon/revenueLedger.spec.ts` passed in the initial baseline run.

## Root causes found

1. `app/lib/gxeon/contentFactory.ts` contained duplicated and interleaved declarations, including duplicate type aliases, duplicate CTA label maps, duplicate defaults, duplicated local variables inside `buildContentFactoryOutput`, and duplicated `buildContentFactoryMarkdown` declarations.
2. `app/lib/gxeon/contentFactory.ts` had a malformed `ContentFactoryRecommendedField` union and an unclosed `if` block in validation logic.
3. `app/lib/gxeon/contentFactory.spec.ts` mixed imported symbols into the `strongDraft` object literal and had nested, unclosed `it` blocks.
4. `app/components/gxeon/ContentFactoryMVP.tsx` had duplicate imports, an invalid two-argument `useState` call, interleaved platform/channel JSX maps, duplicate checkbox props, and a stray closing `</span>` in the generated preview block.

## Files changed

- `app/lib/gxeon/contentFactory.ts`
- `app/lib/gxeon/contentFactory.spec.ts`
- `app/components/gxeon/ContentFactoryMVP.tsx`
- `app/components/gxeon/BetaProductPipelineMVP.tsx`
- `docs/gxeon/APPFORGE_BASELINE_STABILIZATION_CONTENT_FACTORY_REPORT.md`

## Fixes applied

1. Rebuilt `contentFactory.ts` into a single coherent local-only Content Factory library with stable exports for storage keys, option constants, draft/output/export types, normalization, validation, context payload generation, prompt generation, Markdown generation, JSON export, and secret-like key filtering.
2. Preserved the manual-first safety contract: output remains local draft material only, with explicit no-auto-posting, no external send, no social/email/WhatsApp/ads API execution, no guaranteed claims, and human approval requirements.
3. Repaired Content Factory tests without deleting coverage: validation, prompt safety language, structured output, JSON safety flags/secret filtering, Markdown, and delimiter sanitization are covered.
4. Repaired Content Factory MVP JSX while keeping the existing UI flow, buttons, localStorage draft behavior, import actions, copy/export behavior, and manual-first warnings.
5. Repaired a pre-existing Beta Product Pipeline typecheck mismatch by allowing imported compact checkpoints to be normalized from partial item data before insertion.
6. Verified `PreChatHome` still imports and renders Product Builder, Marketplace Pack Generator, Checkout Blueprint, Landing Builder, Content Factory, Integration Readiness, Approval Ledger, Beta Product Pipeline, and Revenue Ledger in the current module area, while Import Chat/Folder and Clone repo remain accessible.

## Safety verification

No unsafe behavior was added. The changed files do not add:

- Product modules.
- Database persistence.
- Supabase integration.
- Payment processing.
- Checkout links.
- Marketplace API clients.
- Social, email, WhatsApp, ads, or n8n live clients.
- Webhook connections.
- Secrets, tokens, credentials, or real environment values.

Content Factory remains a local-only draft generator. Actions copy, save/load localStorage drafts, import local drafts from other MVP modules, send text to the Composer prompt field for human review, or export JSON/Markdown locally.

## Validation commands run

- `pnpm run lint` — passed.
- `pnpm run build` — passed with existing non-blocking build warnings about Vite/Rollup externalized browser modules, missing UnoCSS icons, large chunks, empty chunks, and dynamic/static import chunking.
- `pnpm run test` — passed: 13 test files, 110 tests.
- `pnpm run test -- app/lib/gxeon/contentFactory.spec.ts app/lib/gxeon/revenueLedger.spec.ts` — command completed successfully; the current script invocation still ran the suite and confirmed Content Factory and Revenue Ledger specs passed.
- `pnpm run typecheck` — passed.
- `git diff --check` — passed.
- Changed-file secret scan — passed; no secret-like assignments were found in changed files.

## Remaining warnings

The remaining warnings are non-blocking and pre-existing/build-environment related:

- Vite CJS Node API deprecation warning.
- React Router v7 single-fetch future flag warning.
- Vite browser externalization warnings for `path` / `node:crypto` in existing dependency/provider paths.
- UnoCSS missing icon warnings for `ph:lock-closed`, `ph:git-repository`, and `ph-filter-duotone`.
- Rollup warnings for large chunks and dynamic imports that are also statically imported.
- Vitest environment warning: `indexedDB is not available in this environment.`

## APPFORGE-011 readiness

APPFORGE-011 Agent-Ready Operating Layer is safe to start from this baseline. Lint, build, tests, diff whitespace validation, targeted Content Factory/Revenue Ledger coverage, and changed-file secret scan have all passed, with only non-blocking warnings documented above.
