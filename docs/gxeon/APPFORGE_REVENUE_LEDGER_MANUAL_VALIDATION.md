# Revenue Ledger Manual Validation

1. Hard refresh the deployed app after deployment.
2. Confirm Product Builder through Beta Product Pipeline still render and work.
3. Open Product Factory Mode and expand Revenue Ledger MVP.
4. Create a manual planned revenue entry.
5. Set channel to `manual_landing_page`.
6. Set planned price to `297` and estimated cost to `0`.
7. Save Ledger and then Load Ledger.
8. Change status to `pending_manual_confirmation`.
9. Only after adding proof type and proof notes, change status to `operator_confirmed`.
10. Export JSON and verify safety flags are present.
11. Copy Markdown and verify status, channel, proof type and safety warnings are present.
12. Confirm no database, API, payment, checkout, webhook, n8n, marketplace integration, automatic publication, email, WhatsApp or social-posting action exists.
