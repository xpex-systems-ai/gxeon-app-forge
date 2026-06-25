# Product Catalog MVP patch note

- Manual product and asset form drafts remain empty and do not store generated `id`, `createdAt`, or `updatedAt` values while the operator is typing.
- Product and asset IDs are generated only when the operator clicks Add Product or Add Asset, preventing repeated manual entries from reusing placeholder IDs.
- Empty manual product names, empty asset titles, and assets without a selected product are blocked with local status messages; import/normalization fallback names remain available in helper logic.
