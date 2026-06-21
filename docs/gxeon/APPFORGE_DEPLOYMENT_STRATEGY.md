# APPFORGE-000 Deployment Strategy

Audit date: 2026-06-21 UTC.

## Recommended first boot target

**Recommended first deployment target: Railway Docker.**

Reasoning:

- The repository has a production Docker target, explicit port `5173`, and a container healthcheck.
- Docker isolates Node, pnpm, Wrangler, and system dependencies more predictably than a direct platform build.
- Runtime secrets can be injected as Railway variables without writing `.env` files into the repository.
- This is the least invasive boot-test path before APPFORGE-001 product transformation.

## Candidate matrix

| Target | Status | Deployment path | Risk |
| --- | --- | --- | --- |
| Railway Docker | Recommended for first boot | Build `Dockerfile` target `bolt-ai-production`; expose `5173`; run `pnpm run dockerstart`. | Medium: Wrangler Pages dev is used as the serving command inside the container, so verify long-running production behavior and healthchecks. |
| Cloudflare Pages | Candidate | `pnpm run build`, output `./build/client`, deploy with `wrangler pages deploy`; Functions use `functions/[[path]].ts` and generated `build/server`. | Medium: typecheck fails before build because `build/server` is generated; must manage env bindings carefully. |
| Vercel | Candidate but not first | Deploy as Remix/Vite app only after confirming Cloudflare-specific assumptions and server adapter behavior. | Medium/high: app currently uses Cloudflare packages and Wrangler start scripts; Vercel API integrations are app features, not necessarily deployment config. |
| Local Docker Compose | Good boot-test path | `docker compose --profile production up` or `docker compose --profile development up`. | Medium: compose references `.env` and `.env.local`; never commit populated copies. |

## Docker audit

`Dockerfile` stages:

1. `build`: Node 22 Bookworm slim, pnpm via Corepack, git installed, deps fetched/installed, app built with `NODE_OPTIONS=--max-old-space-size=4096 pnpm run build`.
2. `prod-deps`: prunes production dependencies.
3. `bolt-ai-production`: sets `NODE_ENV=production`, `PORT=5173`, `HOST=0.0.0.0`, non-sensitive env defaults, installs curl, copies build artifacts and bindings script, exposes `5173`, runs `pnpm run dockerstart`.
4. `development`: sets dev env defaults and runs `pnpm run dev --host`.

`docker-compose.yaml` services:

- `app-prod`: builds `bolt-ai-production`, maps `5173:5173`, reads `.env` and `.env.local`, and runs `pnpm run dockerstart`.
- `app-dev`: builds `development`, bind-mounts the repo, maps `5173:5173`, and runs `pnpm run dev --host 0.0.0.0`.
- `app-prebuild`: runs upstream prebuilt `ghcr.io/stackblitz-labs/bolt.diy:latest`.

## Cloudflare Pages path

Cloudflare files and settings:

- `wrangler.toml`: project name `bolt`, `nodejs_compat`, compatibility date `2025-03-28`, Pages output `./build/client`, metrics disabled.
- `functions/[[path]].ts`: server function shim for Remix server build.
- `bindings.sh`: converts local env variables to Wrangler bindings for local Pages dev.

Recommended Cloudflare process:

1. Store secrets in Cloudflare Pages project environment variables, not in Git.
2. Run `pnpm install --frozen-lockfile`.
3. Run `pnpm run build`.
4. Deploy `./build/client` with Pages and function output available.
5. Validate `/api.health`, app shell load, chat route boot, and provider configuration behavior.

## Vercel path

Vercel is feasible only after validating adapter behavior. The current project has Vercel integration APIs for deploying generated projects, but the app itself is configured around Remix + Cloudflare Pages/Workers. If Vercel is used later:

1. Avoid build-time `VITE_*_ACCESS_TOKEN` secrets.
2. Add or confirm Vercel-specific Remix adapter configuration.
3. Verify server route compatibility for WebContainer previews and API routes.
4. Validate production SSR and streaming behavior.

## Railway Docker path

Recommended first Railway boot-test procedure:

1. Create a Railway service from the repository.
2. Use the `Dockerfile` and production target `bolt-ai-production` if Railway allows target selection; otherwise verify default final stage selection.
3. Set port `5173` or allow Railway to route to container port `5173`.
4. Add only needed runtime variables in Railway's variable UI.
5. Do not add `.env`, `.env.local`, or secrets to Git.
6. Boot and verify `/`, `/api.health`, and a no-key provider settings load.

## Pre-APPFORGE-001 deployment checklist

- Confirm app starts from clean clone with no local `.env` files.
- Confirm `pnpm run build` remains green.
- Confirm typecheck sequencing decision: either build before typecheck, exclude generated Cloudflare shim, or add safe generated type handling.
- Decide whether to rename Cloudflare project from `bolt` in a later identity mission.
- Add upstream attribution file before public GXEON launch.
