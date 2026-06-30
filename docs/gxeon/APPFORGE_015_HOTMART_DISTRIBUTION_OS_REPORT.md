# APPFORGE-015 — Hotmart Distribution OS Report

PR #44 (`codex/adicionar-modulo-hotmart-distribution-os`) is the single source of truth for APPFORGE-015. PR #45, #46, #47, #48, #49 and #50 are superseded duplicate security patches and must not be merged as standalone replacements.

## Preserved feature surface

The PR #44 implementation keeps the full Hotmart Distribution OS surface: idea/product draft planning, affiliate kit, asset pack, compliance validation, launch queue, JSON export, Markdown export and manual publish helpers. It remains integrated into the Operator Workspace package tab and Product Factory Mode without introducing a duplicate shell render path.

## Security hardening ported from PR #50

- Secret-like slug candidates are rejected before slugification. If the submitted slug is secret-like, the module derives a slug from the safe product name; if both are empty or secret-like, it uses `hotmart-local-draft`.
- Audience aliases are preserved in priority order: `targetAudience`, `audience`, `publicoAlvo`, `public`, `targetPublic`, `clienteIdeal`, `avatar`. `targetAudience` wins over `audience`, and `audience` remains valid when it is the only safe alias.
- `createdAt` and `updatedAt` are sanitized before JSON export, context payload, prompt and Markdown. Empty, invalid, oversized or secret-like timestamps are replaced with the current safe timestamp and never exported as raw or slugified secrets.
- JSON export is allowlisted and never emits unknown enumerable fields, including `hotmart_token`, `client_secret`, API keys, access tokens, bearer tokens, private keys, passwords, `senha`, refresh tokens or other secret-like values.
- Normalization returns a new object and does not mutate the original input.

## Safety contract

APPFORGE-015 is local-only, manual-first and human-approval-required. It does not add Hotmart API calls, autopublishing, checkout creation, payment processing, webhooks, tokens, secrets, database writes or external sends.
