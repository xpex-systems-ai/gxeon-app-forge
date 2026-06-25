# APPFORGE-014 — Core Bridge Contracts Local-Only Report

## Scope

Core Bridge is a local-only preparation layer between GXEON Core/GX1 and GXEON App Forge. It defines typed contracts and an operator UI for mock payload review only. It does not call GXEON Core, GitHub, Railway, Vercel, Hotmart, payment providers, webhook endpoints, checkout systems or external services.

## Core-to-Forge contract

`CoreOpportunityPayload` represents a future GXEON Core discovery result that can be pasted into Forge by an operator. The payload captures:

- `source: "gxeon-core"` and `type: "repo_product_opportunity"`.
- Repository reference data: URL, owner, name, license, stars and last commit.
- Technical hints: stack, possible deploy targets, complexity and security risk.
- Commercial hypothesis: suggested product, audience, distribution channel and pricing hypothesis.
- Safety gates: license review required, human approval required, no auto fork, no auto deploy and no auto publish.

Repository URLs are references only. They are never fetched by the Core Bridge code.

## Forge-to-Core contract

`ForgeProductReadyPayload` represents a future outbound readiness signal from Forge back to Core/GX1. The payload captures:

- `source: "gxeon-app-forge"` and `type: "product_ready_for_integration"`.
- Product metadata: name, local status, catalog ID and delivery type.
- Integration request: future target, `dry_run` mode, webhook mapping need and product mapping need.
- Approval state: human approval remains false by default and the next action is manual review.

The bridge can export Markdown or JSON locally so an operator can review and copy the contract manually.

## Safety policy

Core Bridge enforces the following flags in code and tests:

- `localOnly`
- `dryRunOnly`
- `noRealCoreApi`
- `noExternalActions`
- `noTokensStored`
- `noWebhooks`
- `noAutoDeploy`
- `noAutoPublish`
- `humanApprovalRequired`

Secret-like fields such as token, secret, password, API key, authorization, webhook and checkout URL keys are stripped from normalized payloads. The UI uses local state, localStorage, clipboard and browser download only.

## Mock/local-only guarantee

This release only adds TypeScript contracts, normalization helpers, local export builders, localStorage persistence and a UI panel. It does not add API clients, tokens, secrets, database writes, webhooks, checkout links, payments, external network requests, GitHub API calls, Railway API calls, Vercel API calls, Hotmart API calls, auto-forking, auto-deployment or auto-publishing.

## Future path

Planned next layers remain gated behind explicit human approval:

1. **Core GitHub Scanner** — future Core-side scanner that may produce `CoreOpportunityPayload` data after policy review.
2. **Fork-to-Product Pipeline** — future local-first intake that transforms approved repository opportunities into product packaging tasks.
3. **Hotmart Delivery Adapter** — future dry-run-first delivery mapping adapter, not a live checkout or payment integration in this phase.
