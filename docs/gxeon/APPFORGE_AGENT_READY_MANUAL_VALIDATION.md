# APPFORGE Agent-Ready Manual Validation

Manual validation should be performed in a browser after deployment.

1. Merge the prerequisite PR and wait for deployment.
2. Hard refresh the public URL.
3. Confirm Product Builder, Marketplace Pack, Checkout Blueprint, Landing Builder, Content Factory, Integration Readiness, Approval Ledger, Beta Product Pipeline and Revenue Ledger open.
4. Open Agent Operating Layer.
5. Confirm command map, blocked actions and playbooks appear.
6. Add a local action-log entry.
7. Save and load the log from localStorage.
8. Export JSON and copy Markdown.
9. Clear Log, refresh, and confirm the log does not return.
10. Confirm no action performs API, payment, checkout, webhook, n8n, social, email, WhatsApp, marketplace or publish behavior.
