# APPFORGE-015 — Hotmart Distribution OS MVP Report

## Audience preservation patch

Product Catalog imports preserve local audience and target audience fields when preparing Hotmart Distribution OS drafts. The local importer reads `targetAudience` first, then compatible Product Catalog audience aliases, so draft copy, affiliate guidance, and traffic-manager briefs keep the reviewed audience context.

The import remains local-only and manual-first: it does not call Hotmart APIs, create checkouts, process payments, receive webhooks, store tokens, or publish automatically. Human review is required before any manual Hotmart publication outside App Forge.
