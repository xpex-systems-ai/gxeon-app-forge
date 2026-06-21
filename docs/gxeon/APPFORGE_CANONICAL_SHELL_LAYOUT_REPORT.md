# APPFORGE Canonical Shell Layout Report

## Mission

APPFORGE-001.6 fixes the GXEON App Forge public pre-chat shell so the founder preview renders as one canonical page flow instead of feeling like stacked or duplicated home screens.

## Duplication root cause

The repeated public-shell impression came from `BaseChat.tsx` owning a large inline GXEON intro block and then placing the composer inside a `StickToBottom` region whose pre-chat wrapper used `my-auto`. Because sticky/chat layout behavior and natural marketing content were mixed in the same vertical stack, the prompt composer could visually separate from the hero and make the lower content feel like a second public shell. Repository searches found GXEON hero copy only in `BaseChat.tsx` before this change, while `ChatBox`, `ExamplePrompts`, and `StarterTemplates` did not render a second hero.

## Final canonical layout order

The pre-chat page now renders in this order:

1. Top navigation / GXEON App Forge mark.
2. Single DIGITAL PRODUCT CREATION OS badge.
3. Single GXEON App Forge headline.
4. Single Portuguese subheadline.
5. Tagline: `Crie. Embale. Venda. Distribua. Acompanhe.`
6. Founder Preview notice.
7. Module cards grid.
8. Small upstream attribution.
9. Prompt composer with provider/model controls and API key status UI.
10. Product Factory Mode prompt buttons.
11. Import Chat / Import Folder / Clone a repo actions.
12. Example prompts.
13. Starter templates.

## Files changed

- `app/components/chat/GxeonProductShellIntro.tsx` — new canonical intro component containing the single hero, Founder Preview notice, module grid, and upstream attribution.
- `app/components/chat/BaseChat.tsx` — renders the intro only for `!chatStarted`, removes pre-chat `my-auto` centering from the composer wrapper, keeps sticky bottom behavior only for started chats, and preserves ChatBox/provider/model/import controls.
- `docs/gxeon/APPFORGE_CANONICAL_SHELL_LAYOUT_REPORT.md` — this validation and implementation report.

## Validation steps

- Search for duplicated hero/product-shell copy across the app.
- Run lint.
- Run production build.
- Run tests when feasible.
- Run `git diff --check`.
- Scan changed files for high-risk secret tokens and forbidden implementation additions.

## Remaining UI risks / follow-ups

- Manual browser validation should still be performed after deployment on the Railway public URL to confirm the perceived scroll flow at production viewport sizes.
- The module names mention marketplace concepts as manual preview labels only; no marketplace API clients or publishing flows were added.
- The Product Factory Mode buttons still populate the prompt locally and do not trigger API calls by themselves.

## Safety confirmation

No secrets, payment processing, marketplace API clients, Hotmart/Kiwify/Mercado Livre/Shopee integrations, or social auto-posting features were added. The MIT license declaration and upstream bolt.diy attribution remain preserved.
