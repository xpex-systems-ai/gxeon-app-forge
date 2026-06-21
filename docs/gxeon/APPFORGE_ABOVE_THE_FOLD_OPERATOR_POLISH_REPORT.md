# APPFORGE Above-the-Fold Operator Polish Report

## Mission

APPFORGE-001_11_ABOVE_THE_FOLD_OPERATOR_UX_POLISH tightens the Founder Preview home into a composer-first GXEON operator shell. The work keeps the current builder core and does not introduce Product Builder MVP, payment processing, marketplace clients, automatic publishing, or live integrations.

## Prior layout density audit

The previous above-the-fold composition was directionally correct, but the first fold still felt heavy because:

- The hero used generous desktop top/bottom padding before the real composer.
- The right-side Command Center card repeated status information already present in the header and Product Factory copy.
- The Command Center card contained a dedicated "Focar compositor real" action even though the real composer should already be near the top.
- The shell container and composer had enough vertical spacing to reduce the prompt input's prominence on common desktop viewports.
- Below-fold operational panels were compact compared with marketing sections, but their padding and gaps could still be slimmer.

## Final layout order

1. Compact GXEON header/navigation.
2. Micro hero with `GXEON App Forge` headline and concise operating-system tagline.
3. Short operator status chips replacing the large Command Center panel.
4. Real `ChatBox` composer with `id="composer"` immediately after the hero.
5. `Product Factory Mode` directly below the composer, aligned with the composer width.
6. Slim Machine Status Strip.
7. Compact import/clone actions.
8. Compact 8-module grid.
9. Compact Fluxo da Forja cards.
10. Templates Compactos as compact chips.
11. Minimal footer with GXEON Systems AI, upstream `bolt.diy` attribution, and MIT foundation reference.

## Files changed

- `app/components/chat/GxeonProductShellIntro.tsx` — reduced hero padding and visual weight, removed the large Command Center card, removed the focus button, and added compact status chips.
- `app/components/chat/BaseChat.tsx` — reduced pre-chat top spacing and composer margins so the real composer appears closer to the hero.
- `app/components/chat/PreChatHome.tsx` — kept Product Factory Mode directly under the composer, slimmed below-fold sections, and ensured buttons populate the real prompt and focus the real textarea without sending.
- `app/components/chat/__tests__/gxeon-single-shell.spec.ts` — strengthened composition assertions for one hero, one real composer, Product Factory Mode, prompt placeholder, upstream attribution, and no redundant Command Center bulk.
- `docs/gxeon/APPFORGE_ABOVE_THE_FOLD_OPERATOR_POLISH_REPORT.md` — this report.

## Safety boundaries preserved

- No API keys, tokens, or real environment values were added.
- No payment processing was added.
- No marketplace API clients were added.
- No automatic publishing to marketplaces or social networks was added.
- Existing provider/model controls remain inside the real `ChatBox`.
- Existing API key UI remains inside the real `ChatBox`.
- The prompt input placeholder remains: `Descreva o produto digital que você quer criar, embalar ou vender hoje.`
- Import Chat, Import Folder, and Clone a repo actions remain accessible.
- Upstream `bolt.diy` attribution and MIT foundation language remain visible.

## Manual browser validation steps

1. Open `https://gxeon-app-forge-production.up.railway.app` after deployment.
2. Hard refresh with Ctrl+F5.
3. Confirm the compact GXEON App Forge header appears once.
4. Confirm the hero is short and the large Command Center panel is gone.
5. Confirm the real composer is visible near the top on desktop without heavy scrolling.
6. Confirm `Product Factory Mode` sits directly below the composer.
7. Click `Criar Produto Digital` and confirm the prompt input updates and focuses.
8. Confirm no chat starts until the user presses send.
9. Open provider/model controls and confirm selection remains usable.
10. Confirm API key safety UI remains usable.
11. Scroll and confirm the status strip, modules, flow, templates, and footer remain compact.
12. Confirm no fake customer logos, fake metrics, live payment claims, or marketplace automation claims appear.
13. Confirm upstream `bolt.diy` attribution and MIT foundation reference remain visible.

## Readiness for APPFORGE-002

The shell is ready for APPFORGE-002 Product Builder MVP only after this polish is reviewed in a browser and merged. APPFORGE-002 should be treated as the next mission, not as part of this change.
