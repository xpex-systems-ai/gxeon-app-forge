# APPFORGE-000 Runtime and Repository Audit

Mission: `APPFORGE-000_RUNTIME_BOOT_AND_REPOSITORY_AUDIT`  
Repository: `xpex-systems-ai/gxeon-app-forge`  
Audit date: 2026-06-21 UTC  
Mode: read-only audit first; documentation-only changes committed.

## Executive decision

The fork is **conditionally ready for APPFORGE-001**. The current Remix/Vite/React application installs, lints, builds, and tests successfully in this environment, but `pnpm run typecheck` fails before a build because the Cloudflare Pages function imports generated `build/server` output. This is a boot-sequencing issue rather than a product-code regression.

## Top-level repository map

Top-level entries inspected:

- Configuration: `.depcheckrc.json`, `.dockerignore`, `.editorconfig`, `.env.example`, `.env.production`, `.gitignore`, `.lighthouserc.json`, `.prettierignore`, `.prettierrc`, `eslint.config.mjs`, `tsconfig.json`, `uno.config.ts`, `vite.config.ts`, `vite-electron.config.ts`, `wrangler.toml`, `worker-configuration.d.ts`.
- Documentation: `README.md`, `FAQ.md`, `PROJECT.md`, `CONTRIBUTING.md`, `CHANGES.md`, `changelog.md`, `LICENSE`, `docs/`.
- Application/runtime: `app/`, `functions/`, `load-context.ts`, `pre-start.cjs`, `bindings.sh`, `types/`.
- Static and assets: `assets/`, `icons/`, `public/`.
- Desktop: `electron/`, `electron-builder.yml`, `electron-update.yml`, `notarize.cjs`.
- Deployment and automation: `Dockerfile`, `docker-compose.yaml`, `.github/`, `.husky/`, `scripts/`, `test-workflows.sh`, Playwright preview config.
- Dependency state: `package.json`, `pnpm-lock.yaml`, `node_modules/` present in the working tree but ignored by Git.

## Application entry points

- Browser entry: `app/entry.client.tsx`.
- Server entry: `app/entry.server.tsx`.
- Remix root: `app/root.tsx`.
- Home route: `app/routes/_index.tsx`.
- Cloudflare Pages function shim: `functions/[[path]].ts`.
- Cloudflare load context: `load-context.ts`.
- Vite/Remix config: `vite.config.ts`.
- Electron main/preload/renderer build path: `electron/`, `vite-electron.config.ts`, and Electron scripts in `package.json`.

## Remix routes structure

Routes live under `app/routes/` and include:

- UI routes: `_index.tsx`, `chat.$id.tsx`, `git.tsx`, `webcontainer.connect.$id.tsx`, `webcontainer.preview.$id.tsx`.
- AI/runtime APIs: `api.chat.ts`, `api.llmcall.ts`, `api.enhancer.ts`, `api.models.ts`, `api.models.$provider.ts`, `api.configured-providers.ts`, `api.check-env-key.ts`.
- Git/GitHub/GitLab APIs: `api.git-info.ts`, `api.git-proxy.$.ts`, `api.github-*`, `api.gitlab-*`, `api.system.git-info.ts`.
- Deployment APIs: `api.vercel-*`, `api.netlify-*`.
- Supabase APIs: `api.supabase.ts`, `api.supabase.query.ts`, `api.supabase.variables.ts`, `api.supabase-user.ts`.
- System APIs: `api.health.ts`, `api.system.diagnostics.ts`, `api.system.disk-info.ts`, `api.update.ts`, `api.bug-report.ts`, `api.web-search.ts`, `api.mcp-*`.

## Important source directories

- UI/components: `app/components/`, including `@settings`, `chat`, `deploy`, `editor`, `git`, `header`, `sidebar`, `ui`, and `workbench`.
- AI provider implementation: `app/lib/modules/llm/providers/`.
- AI/server runtime: `app/lib/.server/llm/`, `app/lib/runtime/`, `app/routes/api.chat.ts`, `app/routes/api.llmcall.ts`.
- WebContainer/terminal/editor: `app/lib/webcontainer/`, `app/components/workbench/`, CodeMirror dependencies, and xterm dependencies.
- Git integrations: `app/components/git/`, `app/routes/api.github-*`, `app/routes/api.gitlab-*`, `app/lib/services/gitlabApiService.ts`, Git stores under `app/lib/stores/`.
- Deployment integrations: `app/components/deploy/`, `app/routes/api.vercel-*`, `app/routes/api.netlify-*`.
- Supabase implementation: `app/components/@settings/tabs/supabase/`, `app/lib/stores/supabase.ts`, `app/routes/api.supabase*`.

## Dependency and package audit

Package identity remains upstream-like: name `bolt`, description `An AI Agent`, license `MIT`, private package, ESM module type.

Confirmed runtime requirements:

- Node engine: `>=18.18.0`.
- Package manager: `pnpm@9.14.4`.
- Local validation used Node `v24.15.0` and pnpm `9.14.4`.

Major frameworks and runtime libraries:

- Remix 2, Vite 5, React 18, TypeScript 5, UnoCSS, Cloudflare Pages/Workers via Wrangler.
- AI stack: Vercel AI SDK (`ai`, `@ai-sdk/*`), OpenRouter provider, Ollama provider, MCP SDK.
- Editors/terminal/runtime: CodeMirror packages, `@webcontainer/api`, `@xterm/*`, `isomorphic-git`.
- UI and state: Radix UI, Headless UI, nanostores, Zustand, Framer Motion, react-markdown, rehype/remark packages.
- Desktop: Electron, electron-builder, electron-updater.
- Deployment integrations: Octokit, Vercel/Netlify route implementations, Cloudflare Wrangler.

Sensitive/risk packages and patterns:

- `VITE_*_ACCESS_TOKEN` values can be bundled or read client-side. Treat these as high-risk convenience settings and prefer browser/session storage or server-side bindings where possible.
- `@webcontainer/api` executes generated projects in browser WebContainers; keep dependency versions pinned and review CSP/preview isolation before production launch.
- `isomorphic-git`, GitHub/GitLab/Vercel/Netlify/Supabase management APIs can perform write/deploy actions when tokens are supplied.
- AI provider keys are intentionally numerous; never commit real values.
- `dotenv` is loaded by Vite config from `.env.local`, `.env`, and default `.env`, so accidental local secret files are a primary leakage risk.

## Commands and runtime validation

| Command | Result | Notes |
| --- | --- | --- |
| `node -v` | PASS | `v24.15.0`. Repo requires `>=18.18.0`; production Docker uses Node 22. |
| `pnpm -v` | PASS | `9.14.4`, matching `packageManager`. |
| `pnpm install --frozen-lockfile` | PASS | Lockfile up to date; install completed. Node emitted a `url.parse()` deprecation warning. |
| `pnpm run typecheck` | FAIL | `functions/[[path]].ts(5,37): error TS2307: Cannot find module '../build/server' or its corresponding type declarations.` This occurs before `build/server` exists. |
| `pnpm run lint` | PASS | ESLint completed with no reported violations. |
| `pnpm run build` | PASS with warnings | Build completed. Warnings included Vite CJS API deprecation, browser externalization notices, missing UnoCSS icons, and large chunks. |
| `pnpm run test` | PASS with environment warning | 3 test files and 52 tests passed. Test stderr noted `indexedDB is not available in this environment.` |

## Build and preview commands

From `package.json`:

- Development: `pnpm run dev`.
- Build: `pnpm run build`.
- Typecheck: `pnpm run typecheck`.
- Lint: `pnpm run lint`.
- Test: `pnpm run test`.
- Preview: `pnpm run preview`, which builds and then runs the Cloudflare Pages local server.
- Production start: `pnpm run start`, dispatching to `start:unix` or `start:windows` and serving `./build/client` through Wrangler Pages dev.
- Docker start: `pnpm run dockerstart` on `0.0.0.0:5173`.

## Docker and Cloudflare deployment audit

- Docker production target: `bolt-ai-production`.
- Docker development target: `development`.
- Exposed port: `5173`.
- Production command: `pnpm run dockerstart`.
- Healthcheck: `curl -fsS http://localhost:5173/`.
- Cloudflare config: `wrangler.toml` names the project `bolt`, enables `nodejs_compat`, uses compatibility date `2025-03-28`, and outputs Pages assets from `./build/client`.
- Cloudflare Pages function imports `build/server`; build must occur before typechecking that includes the function shim, or typecheck should exclude/generated-type-handle build output in a future safe fix.

## License and attribution

- `package.json` declares `MIT`.
- `LICENSE` exists and preserves `Copyright (c) 2024 StackBlitz, Inc. and bolt.diy contributors`.
- `README.md` contains substantial upstream bolt.diy attribution, community links, and project context.
- Recommendation for APPFORGE-001: add `UPSTREAM_CREDITS.md` or `NOTICE.md` describing that GXEON App Forge is a fork/product transformation based on bolt.diy, while preserving the MIT license and upstream credits.

## Secret audit summary

Inspected `.env.example`, `.env.production`, deployment files, and repository references to API keys/tokens/secrets. No real API keys, private keys, or hardcoded live credentials were identified in the inspected files. The committed `.env.production` is a template with empty values and should remain secret-free.

Primary risk: multiple `VITE_` access-token variables are documented for GitHub, GitLab, Vercel, Netlify, and Supabase. Vite-prefixed variables can be exposed to client code. For production, prefer server-side Cloudflare bindings, Vercel/Railway environment variables without `VITE_` prefixes, or user-scoped runtime entry rather than build-time public env injection.

## Readiness for APPFORGE-001

Status: **Ready with guardrails**.

Guardrails before product transformation:

1. Do not rebrand deeply until attribution/notice strategy is added.
2. Do not add commercial integrations until the env strategy is tightened.
3. Do not introduce real `.env`, `.env.local`, or platform tokens into Git.
4. Consider a safe future fix for typecheck sequencing around `functions/[[path]].ts` and generated `build/server` output.
5. Review `VITE_*_ACCESS_TOKEN` usage before production deployment.
