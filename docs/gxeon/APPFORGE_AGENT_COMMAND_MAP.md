# GXEON Agent Command Map

The command map is descriptive metadata only. It does not execute UI actions, call APIs, start automation, publish content or create payments.

## Safe local commands

Safe command definitions identify module, selector, label, local-only status, risk level and human approval requirement for local draft generation, local imports, copy Markdown, export JSON, saving local drafts, adding local ledger entries and updating local pipeline status.

## Blocked actions

The following remain blocked in the agent-ready layer: publish, payment, checkout activation, API call, webhook, email, WhatsApp, social post, marketplace deploy and n8n live run.

## Approval gates

Every command is marked `requiresHumanApproval: true`, `localOnly: true` and `externalActionBlocked: true` so future operators and agents can inspect intent without treating metadata as permission to execute external work.
