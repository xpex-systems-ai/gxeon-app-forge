# Manual Validation

1. Open Product Factory Mode.
2. Confirm Product Builder, Marketplace Pack, Checkout Blueprint, Landing Builder and Content Factory remain visible.
3. Open Integration Readiness MVP.
4. Import local drafts if available.
5. Select Hotmart, Stripe, Shopify, n8n and Generic.
6. Generate Integration Readiness.
7. Confirm payload previews are labeled `DRY_RUN_ONLY` and `dryRunOnly: true`.
8. Confirm no credential fields, real webhook URLs or connected statuses are shown.
9. Send to Composer and verify the prompt is populated but not auto-sent.
10. Copy Prompt, Copy Markdown and Export JSON.
11. Inspect the JSON for no secrets and safety flags.
