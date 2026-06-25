# Product Catalog MVP patch note

- Manual product and asset form drafts remain empty and do not store generated `id`, `createdAt`, or `updatedAt` values while the operator is typing.
- Product and asset IDs are generated only when the operator clicks Add Product or Add Asset, preventing repeated manual entries from reusing placeholder IDs.
- Empty manual product names, empty asset titles, and assets without a selected product are blocked with local status messages; import/normalization fallback names remain available in helper logic.
# APPFORGE Product Catalog MVP Report

## Patch notes

- Product Catalog remains a local-only, manual-first catalog and asset library using `gxeon.productCatalog.items.v1` and `gxeon.productCatalog.assets.v1`.
- Manual form drafts remain empty while the operator is typing and do not store generated `id`, `createdAt` or `updatedAt` values.
- IDs are generated only when the operator clicks Add Product/Add Asset or when an import action creates normalized catalog records.
- Empty product names are blocked at UI level with `Informe o nome do produto antes de adicionar ao catálogo.`.
- Empty asset titles are blocked at UI level with `Informe o título do asset antes de adicionar ao catálogo.`.
- Assets without a selected product are blocked at UI level with `Selecione um produto antes de adicionar o asset.`.
- Export JSON, Copy Markdown, Save, Load, Clear Catalog and import buttons remain manual and local; uploads, live payments, checkout links, webhooks, autonomous agents and auto-publishing remain blocked.
# APPFORGE-013 Product Catalog MVP Report

The Product Catalog MVP restores the full APPFORGE-013 local schema for products, assets, channels, summary counts, markdown export, and JSON safety flags.

## Final wiring

- `ProductCatalogMVP` owns its import behavior directly; no optional `importModule` prop is required.
- Import buttons read exact module `localStorage` keys only when clicked.
- Missing local drafts show a safe status and create no records.
- Successful imports create compact product and asset records with fresh IDs at import time, secret-like data stripped, preview text capped, and `nextAction` set to manual review.

## Safety

The catalog remains local-only: no uploads, external API calls, database writes, payments, checkout links, marketplace connection, webhooks, n8n live connection, social posting, email, WhatsApp sending, or auto-publishing were added.
