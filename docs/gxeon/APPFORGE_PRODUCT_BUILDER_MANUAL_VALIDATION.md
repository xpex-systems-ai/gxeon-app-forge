# APPFORGE Product Builder MVP Manual Validation

## Browser validation steps

1. Open the GXEON App Forge preview.
2. Hard refresh the page.
3. Confirm the compact GXEON operator shell and real composer appear near the top.
4. Find **Product Builder MVP** inside Product Factory Mode.
5. Fill product idea, niche, audience, problem, product type, offer, promise, price, channels, delivery format, and approval notes.
6. Click **Gerar Blueprint** and confirm the local preview appears with structured sections.
7. Click **Enviar para Composer** and confirm the real textarea is populated and focused.
8. Confirm no message is auto-sent.
9. Click **Copiar Markdown** and confirm success or a clear fallback message.
10. Click **Exportar JSON** and confirm a local JSON file is created.
11. Confirm exported JSON includes draft, blueprint, prompt, safety flags, and no secrets.
12. Click **Salvar Rascunho**, reload the page, then click **Carregar Rascunho**.
13. Confirm the simple Product Factory Mode starter buttons still populate the composer.
14. Confirm provider/model dropdowns and API key UI remain usable.
15. Confirm Import Chat, Import Folder, and Clone Repo actions remain accessible.

## Safety validation

- No automatic LLM send occurs from Product Builder actions.
- No payment, marketplace, social posting, database, or external API integration is triggered.
- The generated prompt states manual-first, no guaranteed income, no auto-publishing, no live payments, and no marketplace API execution.

## Required before Marketplace Pack Generator MVP

- Validate Product Builder output with multiple real product examples.
- Approve marketplace pack fields as a separate manual-only schema.
- Define explicit boundaries for any future marketplace export so it remains copy/download-first until a later approved integration mission.
