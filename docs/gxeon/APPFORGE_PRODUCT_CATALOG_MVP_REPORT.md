# APPFORGE Product Catalog MVP Report

The Product Catalog and Asset Library MVP is a local-only Operator Workspace module for grouping products, offers, assets, source modules, tags, channels, proof notes, beta/revenue references, risks and next actions before any distribution work.

## Local-only policy

- Saves only to browser `localStorage` keys `gxeon.productCatalog.items.v1` and `gxeon.productCatalog.assets.v1`.
- Loads only those catalog keys unless the operator clicks an explicit import button.
- JSON export uses browser download only.
- Markdown copy uses clipboard only with a visible fallback message.

## Import behavior

Explicit operator-click imports are available for Product Builder, Marketplace Pack, Checkout Blueprint, Landing Builder, Content Factory, Integration Readiness, Approval Ledger, Beta Product Pipeline and Revenue Ledger local drafts/logs. Imports create compact catalog records and short asset previews only. They do not automatically run on page load and do not mark products approved without human review.

## Safety exclusions

No APIs, uploads, database, Supabase, file storage provider, payment processing, checkout links, marketplace connection, n8n live run, webhooks, OAuth, credentials, social posting, email sending, WhatsApp sending, autonomous agent or browser automation runtime are introduced.
