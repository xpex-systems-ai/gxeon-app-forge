# Marketplace Pack Manual Validation

1. Open Product Factory Mode.
2. Confirm Product Builder remains usable.
3. Open Marketplace Pack Generator MVP.
4. Optionally click **Usar rascunho local do Product Builder** and confirm the status says the source was local browser storage.
5. Fill product idea, niche, audience, offer or promise, and select platforms such as Hotmart, Kiwify, Shopee, and Shopify.
6. Click **Gerar Marketplace Pack**.
7. Confirm the preview includes short titles, copy, SEO, FAQ, guarantee notes, assets, affiliate copy, launch posts, human approval, risks, and next steps.
8. Confirm the prompt includes visible `<gxeon_context_payload>{...}</gxeon_context_payload>`.
9. Click **Enviar para Composer** and verify the textarea is populated but not sent.
10. Test **Copiar Prompt**, **Copiar Markdown**, **Exportar JSON**, **Salvar Rascunho**, **Carregar Rascunho**, and **Limpar**.
11. Inspect exported JSON for no forbidden secret-like fields.
12. Confirm no marketplace, checkout, payment, database, or external API activity occurs.
