# APPFORGE-015 Hotmart Distribution OS Report

## Scope

APPFORGE-015 keeps the Hotmart Distribution OS as a local-only, manual-first draft generator for Product Catalog items. The module prepares reviewed listing copy, affiliate material, sales assets, traffic-manager notes, launch queue guidance, JSON exports and Markdown exports without contacting Hotmart or any external marketplace.

## Audience Preservation Patch

Product Catalog imports now preserve audience context locally by selecting the first non-empty value in this priority order: `targetAudience`, `audience`, `publicoAlvo`, `public`, `targetPublic`, `clienteIdeal`, then `avatar`. The importer keeps `targetAudience` as the highest-priority field and uses `audience` aliases only when the primary field is absent, so existing Product Catalog records that store real audience under `audience` no longer fall back to a generic audience.

This patch remains local-only and review-first: it adds no Hotmart API integration, no auto-publish behavior, no checkout creation, no payment processing, no webhook receiver, no token/secret handling and no database persistence. Human review remains required before any manual Hotmart action.

## Duplicate PR Status

PR #45 and PR #46 are duplicate audience-preservation patches and are superseded by PR #44 after this in-branch patch. This environment has no usable GitHub remote/API permissions for commenting on or closing those PRs, so manual closure or superseded comments are required by a repository maintainer. PR #45 and PR #46 must not be merged.
