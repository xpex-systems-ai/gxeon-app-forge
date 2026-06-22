# Content Context Payload Architecture

The Content Factory prompt includes a compact visible payload delimited by `<gxeon_content_context_payload>` and `</gxeon_content_context_payload>`.

## Included fields

The payload includes product, niche, audience, problem, offer, promise, price, delivery format, platforms, landing goal, campaign goal, campaign tone, CTA mode, content channels, proof notes, approval notes, and safety flags.

## Sanitization

User strings are trimmed and delimiter tags are neutralized before JSON serialization. Generic angle brackets are converted to safer glyphs to reduce accidental delimiter injection.

## Secret protection

Secret-like keys are excluded from payload serialization. The payload must not include provider keys, API keys, tokens, cookies, credentials, gateway data, or secret-like fields.

## Guardrails

Generated content must avoid guaranteed income claims, health cures, legal result guarantees, investment guarantees, fake scarcity, fake testimonials, fake endorsements, spam strategy, and platform manipulation. Proof placeholders remain explicit unless proof notes are provided and approved.
