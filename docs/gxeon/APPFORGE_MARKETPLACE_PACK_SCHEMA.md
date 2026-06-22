# APPFORGE Marketplace Pack Schema

## MarketplacePlatform
`hotmart`, `kiwify`, `eduzz`, `monetizze`, `braip`, `perfect_pay`, `clickbank`, `gumroad`, `lemon_squeezy`, `mercado_livre`, `shopee`, `shopify`, `woocommerce`, `generic`.

## MarketplacePackDraft
Fields: `sourceProductIdea`, `sourceNiche`, `sourceAudience`, `sourceProblem`, `sourceOffer`, `sourcePromise`, `sourcePrice`, `deliveryFormat`, `selectedPlatforms`, `mainCategory`, `tone`, `approvalNotes`, `createdAt`, `updatedAt`.

Recommended fields are product idea, niche, audience, offer or promise, and at least one selected platform.

## MarketplacePackOutput
Fields: `productTitle`, `shortDescription`, `longDescription`, `seoTitle`, `seoDescription`, `categories`, `tags`, `faq`, `guaranteeNotes`, `assetChecklist`, `affiliateCopy`, `launchPosts`, `platformChecklist`, `humanApprovalChecklist`, `riskWarnings`, `nextSteps`.

## MarketplacePackExport
Fields: `draft`, `pack`, `prompt`, `markdown`, `safety`, `exportedAt`.

Safety flags are always `manualFirst`, `noGuaranteedIncome`, `noAutoPublishing`, `noLivePayments`, `noMarketplaceApiExecution` and `localOnlyDraft`.
