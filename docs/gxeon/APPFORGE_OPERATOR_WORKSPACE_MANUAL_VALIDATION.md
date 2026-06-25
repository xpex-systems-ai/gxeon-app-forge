# APPFORGE Operator Workspace Manual Validation

1. Merge PR #27 first and wait for deployment.
2. Hard refresh the public URL.
3. Confirm Composer/provider/model/API key controls still appear outside the Operator Workspace shell.
4. Open Product Factory Mode.
5. Confirm the Operator Workspace shell appears with tabs: Criar, Embalar, Monetizar, Validar, Integrar and Agente.
6. Click Criar and confirm Product Builder appears.
7. Click Embalar and confirm Marketplace Pack, Landing Builder and Content Factory appear.
8. Click Monetizar and confirm Checkout Blueprint and Revenue Ledger appear.
9. Click Validar and confirm Approval Ledger and Beta Product Pipeline appear.
10. Click Integrar and confirm Integration Readiness appears.
11. Click Agente and confirm Agent Operating Layer appears with local-only logs, command map, blocked actions and playbooks.
12. Confirm quick-action rail buttons only switch tabs.
13. Confirm no tab click generates content, sends prompts, publishes, pays, calls APIs, runs n8n, posts externally, sends email, sends WhatsApp or creates marketplace integrations.
14. Confirm Import Chat, Import Folder and Clone repo remain accessible below Product Factory Mode.

Agent Operating Layer remains local-only and human-approved. It is metadata and logging support for future approved workflows, not an autonomous agent runtime.
