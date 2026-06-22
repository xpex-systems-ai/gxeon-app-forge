# Approval Ledger Schema

Storage key: `gxeon.approvalLedger.entries.v1`.

## Entry

- `id`: local string id.
- `type`: `product_blueprint`, `marketplace_pack`, `checkout_blueprint`, `landing_blueprint`, `content_pack`, `integration_readiness`, `operator_decision`, `risk_review`, or `evidence_note`.
- `status`: `draft`, `generated`, `needs_review`, `approved_manual`, `blocked`, `ready_for_beta`, or `archived`.
- `productName`, `summary`, `sourceModule`, `approvedBy`, `approvalNotes`, `evidenceNotes`, `nextAction`: sanitized text.
- `riskLevel`: `low`, `medium`, or `high`.
- `approvalRequired`: boolean.
- `createdAt`, `updatedAt`: ISO-like strings.

## Export

Exports include `entries`, aggregate `summary`, `markdown`, safety flags, and `exportedAt`. Secret-like keys are filtered, including API keys, tokens, cookies, credentials, webhook secrets and channel tokens.
