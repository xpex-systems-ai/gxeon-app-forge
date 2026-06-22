# Content Factory Manual Validation

1. Open the app and hard refresh.
2. Confirm Product Builder, Marketplace Pack, Checkout Blueprint, and Landing Builder still open and generate locally.
3. Open Content Factory MVP.
4. Fill product, audience, promise, CTA mode, content channels, campaign goal, and proof notes.
5. Click import buttons only if local drafts exist; confirm imports are not automatic.
6. Click **Gerar Content Pack** and confirm local preview appears.
7. Confirm there are no buttons for real post, send, schedule, boost, or publish operations.
8. Confirm Prompt includes `<gxeon_content_context_payload>`.
9. Click **Enviar para Composer** and confirm the composer is populated but not submitted.
10. Copy Prompt, copy Markdown, export JSON, and inspect the JSON for no secrets.

No browser validation should involve external social, email, WhatsApp, ad, gateway, marketplace, or database APIs.
1. Open Product Factory Mode and expand Content Factory MVP.
2. Optionally import local drafts with the explicit Product Builder, Marketplace Pack, Checkout Blueprint, or Landing Builder buttons.
3. Fill product, audience, promise, campaign goal, content channels, CTA mode, proof notes, and approval notes.
4. Click **Gerar Content Pack** and confirm only local preview content appears.
5. Confirm there are no buttons to post, schedule, send email, send WhatsApp, create ads, or connect platforms.
6. Confirm the prompt contains `<gxeon_content_context_payload>...</gxeon_content_context_payload>`.
7. Click **Enviar para Composer** and verify the textarea is populated but not submitted.
8. Copy Prompt, copy Markdown, and Export JSON.
9. Inspect JSON for safety flags and absence of secret-like fields.

All browser validation is manual. No external send or publishing action should occur.
