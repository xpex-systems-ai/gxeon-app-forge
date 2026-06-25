# APPFORGE Product Catalog MVP Report

## Patch notes

- Product Catalog remains a local-only, manual-first catalog and asset library using `gxeon.productCatalog.items.v1` and `gxeon.productCatalog.assets.v1`.
- Manual form drafts remain empty while the operator is typing and do not store generated `id`, `createdAt` or `updatedAt` values.
- IDs are generated only when the operator clicks Add Product/Add Asset or when an import action creates normalized catalog records.
- Empty product names are blocked at UI level with `Informe o nome do produto antes de adicionar ao catálogo.`.
- Empty asset titles are blocked at UI level with `Informe o título do asset antes de adicionar ao catálogo.`.
- Assets without a selected product are blocked at UI level with `Selecione um produto antes de adicionar o asset.`.
- Export JSON, Copy Markdown, Save, Load, Clear Catalog and import buttons remain manual and local; uploads, live payments, checkout links, webhooks, autonomous agents and auto-publishing remain blocked.
