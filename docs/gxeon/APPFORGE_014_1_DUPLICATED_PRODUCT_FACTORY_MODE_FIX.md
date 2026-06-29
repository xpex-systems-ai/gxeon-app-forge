# APPFORGE-014.1 — Duplicated Product Factory Mode visual cleanup

## Duplicate source

After APPFORGE-014, the pre-chat area rendered the intended `Product Factory Mode` section with the `OperatorWorkspaceShell`, then rendered an additional legacy prompt-preset row from `productFactoryModes` inside that same product-factory container. Visually, this made the product-factory area look like two product-factory/operator entry points below the composer even though the primary Operator Workspace was already present.

## What changed

- Removed the legacy `productFactoryModes` rendering path from `PreChatHome` so the page has one primary `Product Factory Mode` / `Operator Workspace` block.
- Removed the unused `PRODUCT_FACTORY_MODES` handoff from `BaseChat` because those legacy presets no longer render.
- Kept the `OperatorWorkspaceShell` as the canonical workspace rendering path.
- Kept the module summary aligned with the intended `12 módulos + 8 abas` display by not listing `Command Center Tabs` as a separate module card.

## Safety confirmation

- No GXEON modules were removed from the operator workspace definitions.
- The Product Builder remains visible in the `Criar` tab.
- Product Catalog remains available through the `Catálogo` tab and quick action.
- Core Bridge remains available through the `Core` tab and quick action.
- Product Catalog local import behavior, localStorage keys, Core Bridge contracts, and dry-run/manual-first safety gates were not changed.
- No APIs, webhooks, tokens, secrets, databases, payments, checkout links, or external network calls were added.

## Manual validation checklist

1. Open the app after deploy.
2. Confirm only one `Product Factory Mode` section appears below the composer.
3. Confirm `Operator Workspace` renders once inside that section.
4. Confirm the workspace still shows 12 modules and 8 tabs.
5. Confirm Product Builder appears once in the `Criar` tab.
6. Confirm the `Catálogo` quick action opens Product Catalog.
7. Confirm the `Core Bridge` quick action opens Core Bridge.
8. Confirm no duplicate workspace block appears below the composer.
