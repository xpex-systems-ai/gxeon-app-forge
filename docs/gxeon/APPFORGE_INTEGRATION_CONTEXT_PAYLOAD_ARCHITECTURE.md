# Integration Context Payload Architecture

The prompt includes a visible delimiter:

`<gxeon_integration_context_payload>{...}</gxeon_integration_context_payload>`

The payload is compact JSON containing product, marketplace, checkout, landing/content-derived context and integration options. It intentionally excludes full generated Markdown, provider keys, API keys, tokens, cookies, credentials, payment keys, webhook secrets and endpoint credentials.

User strings are sanitized so accidental opening or closing delimiter tags are replaced before serialization.
