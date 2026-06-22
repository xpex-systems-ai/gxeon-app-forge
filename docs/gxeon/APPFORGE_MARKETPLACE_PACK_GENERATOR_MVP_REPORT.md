# APPFORGE-003 Marketplace Pack Generator MVP Report

## Status
Marketplace Pack Generator MVP is implemented as a compact, collapsible Product Factory module. It prepares product metadata, copy, assets, FAQ, affiliate copy, launch posts, risk warnings, and human approval checklists for manual marketplace review.

## Manual-first boundaries
- No OAuth, client secrets, API keys, marketplace API clients, SDK posting, checkout generation, payment processing, database persistence, auto-publishing, or external API calls are included.
- The module produces local preview, Markdown, JSON export, and a composer handoff only.
- Composer handoff fills the real composer prompt and focuses it; it does not send the message.

## Product Builder preservation
The Product Builder MVP remains visible before Marketplace Pack. Marketplace Pack may import a local browser draft only after the operator clicks **Usar rascunho local do Product Builder**.

## Platform mapping summary
- Hotmart, Kiwify, Eduzz, Monetizze, Braip, Perfect Pay: short name, descriptions, modules, guarantee notes, FAQ, affiliate copy, and access terms.
- Shopee, Mercado Livre: optimized title, objective description, image checklist, delivery clarity, and digital-delivery policy risk warning.
- Shopify, WooCommerce: product page structure, button microcopy, SEO, legal pages, thank-you page, and manual checkout review.
- ClickBank, Gumroad, Lemon Squeezy: product description, support, refund/terms, and manual review checklist.

## APPFORGE-004 readiness
Checkout Blueprint can start when manual pricing, terms, refund policy, post-purchase experience, and platform-specific compliance notes are approved by a human operator.
