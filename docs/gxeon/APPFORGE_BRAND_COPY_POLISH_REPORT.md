# APPFORGE Brand & Copy Polish Report

Mission: `APPFORGE-001_7_BRAND_COPY_TRANSLATION_GUARD_AND_LLM_READINESS`.

## Public copy changed

- Main prompt placeholder changed from Bolt-oriented copy to: "Descreva o produto digital que você quer criar, embalar ou vender hoje."
- Discuss-mode placeholder changed to: "O que você quer discutir ou planejar?"
- Browser metadata now presents `GXEON App Forge` as the product title and describes the product as a `Digital Product Creation OS`.
- Founder Preview shell copy was polished to the canonical notice: "Founder Preview: módulos comerciais em fundação manual-first. Integrações reais entram por fases, com aprovação humana."
- Product Factory Mode description was polished to: "Prompts estruturados para criar ofertas, páginas, packs comerciais e lançamentos sem publicar automaticamente nem conectar marketplaces reais."

## Upstream attribution intentionally kept

The repository remains based on the open-source `bolt.diy` project under the MIT license. References that identify upstream credits, package lineage, documentation links, update scripts, user agents, internal type names, terminal internals, and license notices were kept intentionally unless they were direct public product copy conflicting with GXEON App Forge identity.

## Public Bolt copy audit classification

- Replaced: main textarea placeholder, page metadata, and landing-page comments that presented the public app as Bolt.
- Kept as attribution: README upstream section, LICENSE, `docs/gxeon/UPSTREAM_CREDITS.md`, package description, and open-source documentation references.
- Kept as internal/core implementation: `BoltAction`, `BoltShell`, parser/runtime names, upstream prompts, importer compatibility comments, and API user-agent strings.

## Guardrails preserved

- No payment processing was added.
- No marketplace API client was added.
- No social auto-posting was added.
- No real secrets or environment values were added.
- Existing app builder, provider/model selection, import chat, import folder, clone repo, and prompt starter behavior were preserved.

## APPFORGE-002 readiness

GXEON App Forge is ready for the next mission, `APPFORGE-002_PRODUCT_BUILDER_MVP`, with a clean founder-preview shell, canonical module vocabulary, and clear separation between manual-first starter prompts and future product-builder workflows.
