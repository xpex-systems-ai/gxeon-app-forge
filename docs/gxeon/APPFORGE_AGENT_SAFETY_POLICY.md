# GXEON Agent Safety Policy

Agent-ready does not mean autonomous execution. The operating layer is manual-first, local-only and human-approved.

## Prohibited capabilities

This mission excludes browser automation runtime, Playwright execution, Cypress execution, computer-control agents, external APIs, databases, Supabase persistence, payments, checkout links, webhooks, n8n live connections, OAuth, credentials, secrets, API keys, social posting, email sending, WhatsApp sending, marketplace integrations and auto-publishing.

## Data handling

Action-log exports sanitize secret-like field names and unsafe delimiters/control characters. Operators must not paste API keys, tokens, credentials, payment data or customer sensitive data into the log.
