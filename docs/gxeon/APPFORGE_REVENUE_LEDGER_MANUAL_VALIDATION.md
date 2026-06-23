# Revenue Ledger Manual Validation

1. Hard refresh the deployed app after deployment.
2. Confirm Product Builder through Beta Product Pipeline still render and work.
3. Open Product Factory Mode and expand Revenue Ledger MVP.
4. Create a manual planned revenue entry.
5. Set channel to `manual_landing_page`.
6. Set planned price to `297` and estimated cost to `0`.
7. Save Ledger and refresh the page.
8. Load Ledger and confirm the saved entry returns from the Revenue Ledger localStorage key.
9. Click Clear Ledger, confirm the dialog, refresh the page again, and confirm the old entry does not return. Clear Ledger must remove only `gxeon.revenueLedger.entries.v1` and must not touch other GXEON module drafts.
10. Create another entry with planned price `297`, estimated cost `20`, manual confirmed amount `197`, and status `operator_confirmed`.
11. Export JSON and confirm the visible summary totals match the exported JSON summary derived from the same normalized entries as the export payload.
12. Confirm JSON safety flags are present and no secret-like keys are exported.
13. Copy Markdown and verify status, channel, proof type, safety warnings and summary totals are consistent with the JSON export.
14. Confirm no database, API, payment, checkout, webhook, n8n, marketplace integration, automatic publication, email, WhatsApp or social-posting action exists.
