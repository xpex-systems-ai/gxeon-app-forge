# APPFORGE LLM Provider Readiness

Mission: `APPFORGE-001_7_BRAND_COPY_TRANSLATION_GUARD_AND_LLM_READINESS`.

## Current provider behavior

GXEON App Forge preserves the existing provider/model selection foundation inherited from `bolt.diy`. Users can select supported providers and enter keys through the UI when needed. Keys entered through the UI are stored locally in browser cookies by the existing application flow.

## Founder Preview safety guidance

For Founder Preview usage:

- Use temporary, revocable, low-limit test keys when entering provider keys through the UI.
- Treat browser/cookie-stored keys as local convenience only, not a production secret-management system.
- For controlled internal testing, prefer environment-based keys configured at runtime by the deployment platform or local `.env.local` files that are never committed.
- Rotate any key used during demos or shared-browser sessions.
- Do not paste production marketplace, payment, GitHub, Vercel, Supabase, Stripe, Mercado Pago, Hotmart, Kiwify, Mercado Livre, Shopee, ClickBank, or social-network tokens into Founder Preview unless the storage and runtime model has been explicitly approved.

## What was not added

- No new provider SDKs.
- No real API keys.
- No committed environment values.
- No payment processing.
- No marketplace publishing clients.
- No automatic social posting.

## Recommended APPFORGE-002 direction

The Product Builder MVP should continue to rely on the existing LLM provider foundation while introducing product-specific structured prompts, review steps, and exportable artifacts. Any future production credential handling should use server-side secret storage, scoped permissions, auditability, and human approval before external publishing or payment activation.
