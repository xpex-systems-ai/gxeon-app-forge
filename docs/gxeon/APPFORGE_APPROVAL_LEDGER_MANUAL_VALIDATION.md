# Manual Browser Validation

1. Merge PR #18 first, wait for Railway deploy, then hard refresh the public URL.
2. Confirm Product Builder through Integration Readiness still open and generate local drafts.
3. Open Approval & Operations Ledger inside Product Factory Mode.
4. Create a manual ledger entry and confirm summary cards update.
5. Save Ledger and Load Ledger; confirm data remains local to browser storage.
6. Click an import checkpoint button such as Product Builder only after a local draft exists.
7. Change a card status to `approved_manual` and verify the approved count changes.
8. Export JSON and inspect safety flags.
9. Copy Markdown and confirm approval warnings are present.
10. Confirm no database, API, payment, webhook, n8n, social, email or WhatsApp action occurs.
