# APPFORGE Translation Guard

Mission: `APPFORGE-001_7_BRAND_COPY_TRANSLATION_GUARD_AND_LLM_READINESS`.

## Decision

This mission adds a lightweight browser translation guard, not a full localization framework. Brand-critical and module-critical terms use `translate="no"` where safe so browser auto-translation does not distort the product vocabulary.

## Protected terms

- GXEON
- GXEON App Forge
- Digital Product Creation OS
- Product Factory Mode
- Product Builder
- Landing Builder
- Marketplace Pack Generator
- Checkout Blueprint
- Content Factory
- CRM Inbox
- Deploy Center
- Revenue Ledger
- Founder Preview

## Why this matters

The public copy is intentionally premium pt-BR with selected English product terms kept as product vocabulary. Browser auto-translation can turn module names into awkward literal Portuguese and weaken brand consistency. The guard protects names while leaving normal explanatory Portuguese text translatable.

## Not a full i18n system

No i18n framework was introduced. APPFORGE-002 can add structured copy catalogs later if the Product Builder MVP requires multiple locales, locale-specific exports, or user-selectable language modes.
