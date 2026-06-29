# APPFORGE-015 Hotmart Distribution OS Report

## Product Catalog import patch

Product Catalog imports preserve local audience and target-audience fields when preparing Hotmart Distribution drafts. The import remains local-only: it does not call Hotmart APIs, create checkout links, process payments, store tokens, receive webhooks or publish automatically.

Every imported draft and generated asset pack still requires human review before any manual Hotmart publication.
