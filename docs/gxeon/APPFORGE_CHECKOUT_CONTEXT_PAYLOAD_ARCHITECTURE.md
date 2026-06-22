# Checkout Context Payload Architecture

Checkout Blueprint serializes product and monetization context into a visible prompt block:

`<gxeon_checkout_context_payload>{...}</gxeon_checkout_context_payload>`

The payload includes product, audience, problem, offer, promise, price, platforms, delivery format, marketplace category, tone, checkout goal, and pricing model. It excludes provider keys, API keys, tokens, cookies, credentials, gateway data, OAuth data, client secrets, webhook secrets, and database identifiers.

String values are sanitized so user input cannot accidentally close or inject the context delimiter tags. Secret exposure tests scan export object keys and serialized payloads for forbidden key names while avoiding false positives from safety flags such as `noGatewayApiExecution` and `noMarketplaceApiExecution`.
