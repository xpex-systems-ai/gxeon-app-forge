# GXEON Agent Safety Policy

Agent-ready does not mean agent-autonomous. This layer only makes the local UI easier to operate safely by future agents under human supervision.

## Excluded features
No browser automation runtime, no Playwright execution, no computer-control agent, no external APIs, no payments, no checkout creation or activation, no database, no webhooks, no n8n live connection, no publishing and no send actions.

## Data handling
The agent action log is local-only and must not contain API keys, tokens, credentials, payment data or customer sensitive data. Secret-like field names are redacted in exports.
