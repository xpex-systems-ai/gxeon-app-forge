# APPFORGE Core Bridge Contracts Report

## Scope

APPFORGE-014 adds a local-only Core Bridge MVP and restores the Product Catalog workspace without enabling real integrations.

## Core Bridge contract

- `mode` is forced to `dry_run`.
- `integrationRequest.needsWebhook`, `needsProductMapping`, and `licenseReviewRequired` are boolean contract anchors only.
- `approval.humanApprovalRequired` remains `true`; `humanApproved` remains `false`.
- Safety flags require local-only behavior, no external calls, no automatic forks, no deployments, and no publishing.
- Secret-like keys, webhook endpoints, checkout URLs, bearer values, and API-key-like values are stripped from preview payloads.

## Product Catalog contract

- Product and asset records are normalized locally with manual review status defaults.
- Explicit local import drafts can be built from browser localStorage sources after operator clicks only.
- `idea`, `sourceProductIdea`, `targetAudience`, and `desiredPrice` are mapped into catalog product fields when present.
- `serializeCatalogPreview` sanitizes content previews and removes secret-like fields before display or export.
- Export safety flags prohibit uploads, external API calls, databases, payments, checkout links, marketplace connections, and auto-publishing.

## Forbidden actions preserved

This consolidation intentionally does not add a real Core API, webhook receiver, token handling, secrets, database, payment flow, checkout link, external network request, auto-fork, auto-deploy, or auto-publish behavior.
