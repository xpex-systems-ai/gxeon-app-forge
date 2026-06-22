# Landing Context Payload Architecture

Landing Builder uses a visible payload delimiter:

`<gxeon_landing_context_payload>{...}</gxeon_landing_context_payload>`

The payload includes landing/product context only: idea, niche, audience, problem, offer, promise, base price, delivery format, selected platforms, landing goal, page style, CTA mode, proof notes, approval notes, and safety intent.

User-entered delimiter tags and angle brackets are sanitized before payload construction. Secret-like keys are excluded during JSON serialization and platform normalization.

Persistence is local-only under `gxeon.landingBuilder.draft.v1`. Cross-module drafts are not read automatically; imports require explicit user actions.
