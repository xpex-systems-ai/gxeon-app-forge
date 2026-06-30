# APPFORGE-015 Hotmart Distribution OS Report

APPFORGE-015 adds a local-only, manual-first Hotmart Distribution OS planning layer for product drafting, affiliate kits, asset packs, compliance validation, launch queues, JSON export, Markdown export, manual publish playbooks, UI/workspace integration, and human approval gates.

## Final Security Patch Applied Into PR #44

- Applied the final security hardening directly into the APPFORGE-015 PR #44 branch scope; PR #45, PR #46, PR #47, PR #48, and PR #49 are superseded duplicates and must not be merged.
- Secret-like slug candidates are rejected before slugification. If `input.slug` resembles a token, client secret, API key, password, bearer credential, private key, or Hotmart token, the module ignores it and derives the slug from a safe `productName` instead.
- If both `slug` and `productName` are empty or secret-like, the slug falls back to `hotmart-local-draft` so raw or slugified secrets are never exported.
- `createdAt` and `updatedAt` are sanitized before JSON, context payload, prompt, and Markdown export. Empty, oversized, invalid, or secret-like timestamp values are replaced with the current safe `now` timestamp.
- Audience alias preservation remains intact with this priority: `targetAudience`, `audience`, `publicoAlvo`, `public`, `targetPublic`, `clienteIdeal`, and `avatar`. `targetAudience` wins over `audience`, while `audience` is preserved when it is the only valid alias.
- Exports are allowlisted so unknown enumerable fields, including `hotmart_token` and `client_secret`, are not copied into the serialized draft.
- Safety remains local-only and manual-first: no Hotmart API, no auto-publish, no checkout creation, no payment processing, no webhook handling, no tokens, no secrets, no database writes, and no external send behavior are introduced.
