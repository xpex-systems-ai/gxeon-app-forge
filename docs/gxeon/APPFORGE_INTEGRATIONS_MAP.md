# GXEON App Forge Integrations Map

No real credentials, SDK secrets, payment keys, or marketplace tokens belong in this repository.

> **VITE_ exposure warning:** any environment variable prefixed with `VITE_` can be exposed to browser-side code. Never place private API keys, marketplace tokens, payment secrets, or user tokens in `VITE_` variables.

| Priority | Area | Integrations | Classification | Notes |
|---|---|---|---|---|
| P0 | Infrastructure | Railway, Cloudflare/Wrangler, GitHub, Netlify, Vercel | Assisted API / full sync future | Use only documented, user-approved deployment flows. |
| P1 | Payment/checkout | Stripe, Mercado Pago, PayPal, Pix, Lemon Squeezy, Asaas, Hotmart, Kiwify | Manual pack first; assisted API future | No SDKs, keys, or live checkout endpoints in APPFORGE-001. |
| P2 | Digital marketplaces | Hotmart, Kiwify, Eduzz, Monetizze, Braip, Perfect Pay, Ticto, ClickBank, Gumroad, Lemon Squeezy, Whop, AppSumo | Manual pack; blocked pending review for auto-publish | Do not assume API publishing is allowed. |
| P3 | Stores/ecommerce | Mercado Livre, Shopee, Amazon, Shopify, WooCommerce, Nuvemshop | Manual pack; assisted API future | Product data can be generated for manual review/submission. |
| P4 | CRM | Email inboxes, HubSpot, Pipedrive, Airtable, Google Sheets, Notion | Manual pack / assisted API future | Human approval required for contact actions. |
| P5 | Content/distribution | Instagram, TikTok, YouTube, LinkedIn, X, Meta Ads, Google Ads, email platforms | Manual pack; blocked pending review for auto-post | No automatic posting without explicit user approval. |

All integrations must begin manual-first or sandbox-first. Platform terms and user consent determine whether any future assisted API or full sync mode can exist.
