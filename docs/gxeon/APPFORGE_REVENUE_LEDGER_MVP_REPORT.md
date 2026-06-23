# APPFORGE-010 Revenue Ledger MVP Report

## Status
Revenue Ledger MVP is local-only operational inside Product Factory Mode. APPFORGE-010 review fixes are applied for destructive clear persistence cleanup and export summary consistency.

## Local-only behavior
- Entries are created by the operator in the browser.
- Save and load use `localStorage` only with key `gxeon.revenueLedger.entries.v1`.
- Clear Ledger keeps the confirmation dialog, clears in-memory Revenue Ledger entries, and removes only the Revenue Ledger `localStorage` key (`gxeon.revenueLedger.entries.v1`) so old entries do not return after refresh. Other GXEON module drafts are not touched.
- JSON export is a browser download only.
- JSON export normalizes entries once, calculates the summary from those normalized entries, and uses that same summary for the export payload and embedded Markdown.
- Markdown copy uses the browser clipboard only and derives its totals from the same normalization and summary path used by exports.

## Safety exclusions
This MVP does not add database persistence, Supabase, external API calls, payment processing, checkout creation, checkout links, marketplace API clients, webhooks, n8n live connections, OAuth, credentials, secrets, email sending, WhatsApp sending, social posting, automatic publishing or deployment.

## Operator confirmation
`operator_confirmed` means the operator manually recorded evidence. It is not a processor settlement, bank settlement, tax receipt, guaranteed revenue claim or financial advice.

## Manual checks outside this MVP
Platform dashboards, banks, payment processors, accounting records and customer evidence must be checked outside the app.
