# Integration Readiness Schema

The MVP defines `IntegrationPlatform`, `IntegrationReadinessDraft`, `IntegrationReadinessOutput` and `IntegrationReadinessExport` in `app/lib/gxeon/integrationReadiness.ts`.

The export contains the draft, readiness output, visible context payload, prompt, Markdown, safety flags and export timestamp. Safety flags assert manual-first, dry-run-only, no real API calls, no live payments, no real checkout, no auto-publishing, no external send, no secrets stored and local-only draft behavior.
