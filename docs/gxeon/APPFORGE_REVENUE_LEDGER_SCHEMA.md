# GXEON Revenue Ledger Schema

## Storage
`REVENUE_LEDGER_STORAGE_KEY = gxeon.revenueLedger.entries.v1`

## Statuses
`planned`, `offer_prepared`, `sent_manual`, `pending_manual_confirmation`, `operator_confirmed`, `lost`, `refunded`, `cancelled`, `archived`.

## Channels
`manual_whatsapp`, `manual_email`, `manual_instagram`, `manual_linkedin`, `manual_landing_page`, `manual_marketplace`, `manual_call`, `partner`, `affiliate_manual`, `other`.

## Proof types
`none`, `operator_note`, `screenshot_reference`, `manual_receipt_reference`, `platform_dashboard_checked_manually`, `bank_statement_checked_manually`, `customer_confirmation_manual`, `other`.

## Entry fields
Each entry tracks id, product name, pipeline item id, source module, channel, status, currency, planned price, manual confirmed amount, estimated cost, quantity, net estimate, buyer/segment, offer summary, proof type, proof notes, risk notes, next action, operator confirmation metadata and timestamps.

## Net estimate
- If status is `operator_confirmed`: `manualConfirmedAmount - estimatedCost`.
- Otherwise: `(plannedPrice * quantity) - estimatedCost`.

## Export safety flags
Exports include local-only, no payment processing, no checkout creation, no real API calls, no auto publishing, no secrets stored, operator confirmation required, not financial advice and not tax receipt flags.
