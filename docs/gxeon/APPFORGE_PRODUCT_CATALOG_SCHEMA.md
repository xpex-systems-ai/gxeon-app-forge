# APPFORGE Product Catalog Schema

## ProductCatalogItem

Fields: `id`, `productName`, `slug`, `niche`, `audience`, `problem`, `offer`, `promise`, `basePrice`, `status`, `tags`, `channels`, `sourceModules`, `assetIds`, `approvalStatus`, `betaPipelineStatus`, `revenueStatus`, `riskNotes`, `proofNotes`, `nextAction`, `createdAt`, `updatedAt`.

Statuses: `idea`, `draft`, `packaged`, `landing_ready`, `content_ready`, `integration_dry_run_ready`, `needs_review`, `approved`, `beta_ready`, `manual_distribution_ready`, `paused`, `archived`.

## ProductCatalogAsset

Fields: `id`, `productId`, `assetType`, `title`, `sourceModule`, `summary`, `contentPreview`, `tags`, `status`, `localOnly`, `humanApprovalRequired`, `createdAt`, `updatedAt`.

Asset types: `product_blueprint`, `marketplace_pack`, `checkout_blueprint`, `landing_blueprint`, `content_pack`, `integration_dry_run`, `approval_record`, `beta_pipeline_record`, `revenue_record`, `prompt`, `markdown`, `json`, `image_prompt`, `video_prompt`, `audio_prompt`, `other`.

Channels: `internal`, `manual_whatsapp`, `manual_email`, `manual_instagram`, `manual_linkedin`, `manual_youtube`, `manual_marketplace`, `manual_landing`, `hotmart_future`, `kiwify_future`, `clickbank_future`, `gumroad_future`, `shopify_future`, `generic_future`.

## Export safety

Exports include summary counts, markdown and safety flags confirming local-only, no uploads, no external API calls, no database, no payments, no checkout links, no auto-publishing, no marketplace connection, no secrets stored and human approval required.
