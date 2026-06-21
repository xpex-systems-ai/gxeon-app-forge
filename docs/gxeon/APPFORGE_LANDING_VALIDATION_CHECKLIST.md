# APPFORGE Landing Validation Checklist

## Automated checks

- Run `pnpm run lint`.
- Run `pnpm run build`.
- Run `pnpm run test` when feasible.
- Run `git diff --check`.
- Run a changed-file secret scan.

## Manual browser checks

1. Open the public landing and hard refresh.
2. Confirm the GXEON navigation appears.
3. Confirm the gradient hero and GXEON headline appear.
4. Confirm the existing prompt composer remains visible and usable.
5. Confirm provider, model and API key controls remain available in the real composer.
6. Confirm Product Factory Mode content remains accessible below the composer.
7. Scroll through social proof, how-it-works, modelos, números, final CTA and footer.
8. Click landing CTA buttons and confirm they scroll/focus the real composer.
9. Confirm there is no Lovable logo, customer logo, screenshot, exact copy or trademarked asset.
10. Confirm there are no claims of live marketplace publishing, live payment processing or automatic social posting.
11. Confirm the footer preserves bolt.diy upstream attribution and MIT foundation language.

## Secret/integration safety

No API keys, payment secrets, marketplace tokens, real integration clients, or production credentials should be present in changed files.
