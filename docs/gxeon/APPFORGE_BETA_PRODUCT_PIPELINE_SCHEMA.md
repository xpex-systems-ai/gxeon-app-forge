# APPFORGE-009 Beta Product Pipeline Schema

Storage key: `gxeon.betaProductPipeline.items.v1`.

Stages: `idea`, `product_draft`, `pack_ready`, `checkout_ready`, `landing_ready`, `content_ready`, `integration_dry_run_ready`, `needs_review`, `approved_for_beta`, `manual_published`, `testing`, `paused`, `archived`.

Priorities: `low`, `medium`, `high`, `critical`.

Readiness checklist: `productBlueprint`, `marketplacePack`, `checkoutBlueprint`, `landingBlueprint`, `contentPack`, `integrationDryRun`, `approvalLedgerEntry`, `humanApproval`.

Item fields: `id`, `productName`, `niche`, `audience`, `offer`, `basePrice`, `stage`, `priority`, `readiness`, `readinessScore`, `blockers`, `nextAction`, `launchNotes`, `evidenceNotes`, `owner`, `createdAt`, `updatedAt`.

Export includes items, summary counts, Markdown, safety flags and `exportedAt`. Safety flags assert local-only operation, no database, no real API calls, no live payments, no auto-publishing, no secrets stored and human approval required.
