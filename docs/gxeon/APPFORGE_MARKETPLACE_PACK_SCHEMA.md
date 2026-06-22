# Marketplace Pack Schema

## Storage key
`gxeon.marketplacePack.draft.v1` is used only in browser `localStorage`.

## Draft
`MarketplacePackDraft` stores product context: source product idea, niche, audience, problem, offer, promise, price, delivery format, selected platforms, category, tone, approval notes, and timestamps.

## Output
`MarketplacePackOutput` contains short commercial titles, product title, descriptions, SEO fields, categories, tags, FAQ, guarantee notes, asset checklist, affiliate copy, launch posts, platform checklist, human approval checklist, risk warnings, and next steps.

## Export
`MarketplacePackExport` contains draft, pack, visible context payload, prompt, Markdown, safety flags, and exported timestamp.

## Safety flags
Exports mark manual-first operation, no guaranteed income, no auto-publishing, no live payments, no marketplace API execution, and local-only draft behavior.
