# APPFORGE-000 Secrets and Environment Strategy

Audit date: 2026-06-21 UTC.

## Secret audit result

No committed real secrets were identified during this audit. `.env.example` uses placeholder values, and `.env.production` is a template with empty values. Do not commit populated `.env`, `.env.local`, API keys, access tokens, private keys, or platform credentials.

## Environment variable classification

| Variable | Classification | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | provider-key | Server/runtime AI provider key. |
| `CEREBRAS_API_KEY` | provider-key | Server/runtime AI provider key. |
| `FIREWORKS_API_KEY` | provider-key | Server/runtime AI provider key. |
| `OPENAI_API_KEY` | provider-key | Server/runtime AI provider key. |
| `GITHUB_API_KEY` | provider-key/platform-token | Used for GitHub Models provider; token-like. |
| `PERPLEXITY_API_KEY` | provider-key | Server/runtime AI provider key. |
| `DEEPSEEK_API_KEY` | provider-key | Server/runtime AI provider key. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | provider-key | Server/runtime AI provider key. |
| `COHERE_API_KEY` | provider-key | Server/runtime AI provider key. |
| `GROQ_API_KEY` | provider-key | Server/runtime AI provider key. |
| `MISTRAL_API_KEY` | provider-key | Server/runtime AI provider key. |
| `TOGETHER_API_KEY` | provider-key | Server/runtime AI provider key. |
| `XAI_API_KEY` | provider-key | Server/runtime AI provider key. |
| `MOONSHOT_API_KEY` | provider-key | Server/runtime AI provider key. |
| `ZAI_API_KEY` | provider-key | Server/runtime AI provider key. |
| `HuggingFace_API_KEY` | provider-key | Server/runtime AI provider key; nonstandard mixed-case name. |
| `HYPERBOLIC_API_KEY` | provider-key | Server/runtime AI provider key. |
| `OPEN_ROUTER_API_KEY` | provider-key | Server/runtime AI provider key. |
| `OLLAMA_API_BASE_URL` | runtime-config | Local model endpoint; usually not secret. |
| `OPENAI_LIKE_API_BASE_URL` | runtime-config | Compatible-provider endpoint. |
| `OPENAI_LIKE_API_KEY` | provider-key | Compatible-provider key. |
| `TOGETHER_API_BASE_URL` | runtime-config | Provider endpoint override. |
| `HYPERBOLIC_API_BASE_URL` | runtime-config | Provider endpoint override. |
| `LMSTUDIO_API_BASE_URL` | runtime-config | Local model endpoint. |
| `AWS_BEDROCK_CONFIG` | provider-key/platform-token | JSON may include access key ID and secret access key; high sensitivity. |
| `VITE_GITHUB_ACCESS_TOKEN` | platform-token | High risk: Vite-prefixed token may be exposed to client bundle/client code. |
| `VITE_GITHUB_TOKEN_TYPE` | public-config | Token type only; not secret. |
| `GITHUB_TOKEN` | platform-token | Server-side GitHub token fallback. |
| `GITHUB_ACCESS_TOKEN` | platform-token | Server/system diagnostics token fallback. |
| `GITHUB_BUG_REPORT_TOKEN` | platform-token | Server bug-report token. |
| `BUG_REPORT_REPO` | runtime-config | Repository identifier; not secret. |
| `VITE_GITLAB_ACCESS_TOKEN` | platform-token | High risk: Vite-prefixed token may be exposed to client bundle/client code. |
| `VITE_GITLAB_URL` | public-config | GitLab instance URL. |
| `VITE_GITLAB_TOKEN_TYPE` | public-config | Token type only; not secret. |
| `VITE_VERCEL_ACCESS_TOKEN` | platform-token | High risk: Vite-prefixed platform token. |
| `VITE_NETLIFY_ACCESS_TOKEN` | platform-token | High risk: Vite-prefixed platform token. |
| `NETLIFY_TOKEN` | platform-token | Server-side Netlify token fallback. |
| `VITE_SUPABASE_URL` | public-config | Supabase project URL; public but should match intended project. |
| `VITE_SUPABASE_ANON_KEY` | public-config/platform-token | Supabase anon key is designed for client use but must rely on RLS. |
| `VITE_SUPABASE_ACCESS_TOKEN` | platform-token | High risk: Supabase management token must not be public. |
| `NODE_ENV` | runtime-config | Runtime mode. |
| `PORT` | runtime-config | App port; Docker defaults to `5173`. |
| `REMIX_PORT` | runtime-config | Referenced by runtime tooling. |
| `DEFAULT_NUM_CTX` | runtime-config | Local model context window. |
| `VITE_LOG_LEVEL` | public-config | Client-visible log level. |
| `VITE_PUBLIC_APP_URL` | public-config | Public app URL build arg. |
| `VITE_HMR_PROTOCOL` | runtime-config | Dev-only HMR setting. |
| `VITE_HMR_HOST` | runtime-config | Dev-only HMR setting. |
| `VITE_HMR_PORT` | runtime-config | Dev-only HMR setting. |
| `VITE_DISABLE_PERSISTENCE` | public-config | Client persistence toggle. |
| `VITE_APP_VERSION` | public-config | Client-visible version. |
| `VITE_GIT_BRANCH` | public-config | Client-visible build metadata. |
| `VITE_GIT_COMMIT` | public-config | Client-visible build metadata. |
| `APP_PATH_ROOT` | runtime-config | Electron path override. |
| `VITE_APP_PATH_ROOT` | public-config/runtime-config | Electron path override exposed through Vite. |
| `APPLE_TEAM_ID` | platform-token | Apple notarization/team configuration. |
| `PREVIEW_URL` | runtime-config | Playwright preview target. |
| `CI` | runtime-config | CI behavior toggle. |
| `RUNNING_IN_DOCKER` | runtime-config | Docker runtime marker. |
| `WRANGLER_SEND_METRICS` | runtime-config | Wrangler metrics toggle. |
| `CHOKIDAR_USEPOLLING` | runtime-config | Docker dev file-watch setting. |
| `WATCHPACK_POLLING` | runtime-config | Docker dev file-watch setting. |
| `HOST` | runtime-config | Container host binding. |
| `COMPOSE_PROFILES` | runtime-config | Docker Compose profile marker. |

## VITE variable warning

Any variable prefixed with `VITE_` is eligible for client-side access through Vite's environment loading. Do not put long-lived management credentials in `VITE_*` variables for production. Variables of special concern:

- `VITE_GITHUB_ACCESS_TOKEN`
- `VITE_GITLAB_ACCESS_TOKEN`
- `VITE_VERCEL_ACCESS_TOKEN`
- `VITE_NETLIFY_ACCESS_TOKEN`
- `VITE_SUPABASE_ACCESS_TOKEN`

## Local development strategy

- Keep `.env.local` untracked and local-only.
- Start from `.env.example` placeholders only.
- Add only the minimum provider keys needed for local testing.
- Prefer browser-entered/session-scoped tokens for Git/deploy services during development.
- Before any commit, run a secret scan using `rg` patterns for `API_KEY`, `TOKEN`, `SECRET`, `BEGIN .*PRIVATE KEY`, `github_pat_`, `sk-`, and provider-specific prefixes.

## Cloudflare strategy

- Store provider keys and platform tokens in Cloudflare Pages environment variables/bindings.
- Avoid build-time injection of management tokens into Vite client variables.
- Use Wrangler/Pages bindings for server-side APIs.
- Keep `wrangler.toml` free of real secrets.

## Vercel strategy

- Use Vercel Project Settings environment variables for server-side secrets.
- Do not expose management tokens as `VITE_*` build variables.
- If Vercel adapter support is added later, use non-public server-only names for platform integrations.

## Railway strategy

- Use Railway service variables for provider keys and platform tokens.
- Do not mount committed `.env` files.
- Prefer Docker deployment target `bolt-ai-production` for first boot.
- Keep public settings such as `VITE_LOG_LEVEL` separate from secret provider/platform values.

## Secret handling policy for GXEON missions

1. Never commit populated `.env`, `.env.local`, private keys, or token exports.
2. Never add OpenAI, OpenRouter, GitHub, Vercel, Supabase, Stripe, Mercado Pago, Hotmart, Mercado Livre, Shopee, or other commercial credentials to the repository.
3. If future missions add integrations, document required variables with placeholders only.
4. Prefer server-only environment variable names for management credentials.
5. Treat all `VITE_*_ACCESS_TOKEN` usage as a pre-production risk until reviewed and hardened.
