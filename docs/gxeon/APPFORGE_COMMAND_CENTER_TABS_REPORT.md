# APPFORGE-012 Command Center Tabs Report

## Audit before UI changes

PR #27 is present in the current branch history as merge commit `b1c03a8`, which added the agent-ready operating layer safety docs before this mission began.

`app/components/chat/PreChatHome.tsx` previously rendered Product Factory Mode as one long vertical stack with these imports and modules: `ProductBuilderMvp`, `MarketplacePackGeneratorMvp`, `CheckoutBlueprintMvp`, `LandingBuilderMvp`, `ContentFactoryMvp`, `IntegrationReadinessMvp`, `ApprovalLedgerMvp`, `BetaProductPipelineMvp`, `RevenueLedgerMvp`, and `AgentOperatingLayerMvp`.

Visible actions remain owned by module internals: generate, send/copy/export/save/load/import where already present. The new workspace only switches tabs and never clicks module internals, writes module storage, sends to Composer, calls APIs, publishes, pays, or runs integrations.

Existing data-testid selectors audited before reorganization include the Product Factory container, every module container, Product Builder actions, Marketplace Pack actions, Checkout Blueprint actions, Landing Builder actions, Content Factory actions, Integration Readiness dry-run selector, Approval Ledger add-entry selector, Beta Pipeline add-item selector, Revenue Ledger add-entry selector, and Agent Operating Layer selectors for container, toggle, command/log fields, log buttons, command map selectors and module selectors.

Agent Operating Layer was confirmed to expose local-only logs, command map selectors, blocked-action safety copy, and playbook cards. It remains rendered as `AgentOperatingLayerMvp` in the new Agent tab.

## Reorganization

The long stack is now grouped into six local navigation tabs:

- **Criar**: Product Builder.
- **Embalar**: Marketplace Pack Generator, Landing Builder, Content Factory.
- **Monetizar**: Checkout Blueprint, Revenue Ledger.
- **Validar**: Approval Ledger, Beta Product Pipeline.
- **Integrar**: Integration Readiness.
- **Agente**: Agent Operating Layer.

## Safety exclusions

This mission adds no autonomous agent runtime, external API call, payment processing, checkout activation, database persistence, webhook, n8n live run, OAuth, credentials, social posting, email sending, WhatsApp sending, marketplace API client, browser automation runtime, Playwright execution or Cypress execution.
