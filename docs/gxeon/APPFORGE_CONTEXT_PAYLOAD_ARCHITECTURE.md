# GXEON Safe Context Payload Architecture

## Purpose
Safe Context Payload mirrors local Product Builder context into Marketplace Pack without server persistence or hidden transport.

## Source
Marketplace Pack reads Product Builder data only from browser `localStorage` key `gxeon.productBuilder.draft.v1`, and only after an explicit operator click.

## Payload contents
The payload is minified JSON with product context only: idea, niche, audience, problem, offer, promise, price, channels, delivery format, and tone.

## Prompt visibility
Generated prompts include the payload inside visible delimiters:

```text
<gxeon_context_payload>{...}</gxeon_context_payload>
```

## Secret exposure protection
The helper normalizes allowed draft fields and intentionally ignores extra keys. Tests cover forbidden key names including api_key, apiKey, token, access_token, refresh_token, secret, client_secret, password, credential, and cookie while avoiding false positives from safety text such as `noMarketplaceApiExecution`.

## Excluded from v1
OAuth, client secrets, API keys, marketplace POST requests, auto-publishing, real checkout, payment activation, and database persistence remain excluded.
