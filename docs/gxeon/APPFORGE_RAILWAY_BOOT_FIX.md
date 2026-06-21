# APPFORGE-000.5 Railway Public Boot Fix

Mission: `APPFORGE-000_5_RAILWAY_PUBLIC_BOOT_FIX`  
Audit/fix date: 2026-06-21 UTC  
Public URL: `https://gxeon-app-forge-production.up.railway.app`

## Observed error

Railway build and container startup were reported as successful, but the public URL showed the Vite development-server host validation error:

```text
Blocked request. This host "gxeon-app-forge-production.up.railway.app" is not allowed. To allow this host, add "gxeon-app-forge-production.up.railway.app" to server.allowedHosts in vite.config.js.
```

The observed runtime command was:

```text
node pre-start.cjs && remix vite:dev --host
```

## Root cause

The existing multi-stage `Dockerfile` ends with the `development` stage. If Railway builds the Dockerfile without explicitly selecting the `bolt-ai-production` target, Docker uses the final stage by default. That means Railway can boot the Vite development server instead of the production Wrangler/Remix runtime path.

Because the Vite dev server validates incoming hosts, the Railway public host was blocked.

## Files changed

- `vite.config.ts`
  - Added `server.host = '0.0.0.0'` so the dev server binds correctly in containerized environments.
  - Added `server.allowedHosts = ['gxeon-app-forge-production.up.railway.app']` to allow the known Railway public host.
- `Dockerfile.railway`
  - Added a Railway-specific production Dockerfile whose final stage is the production runtime.
  - Exposes port `5173`.
  - Starts with `pnpm run dockerstart`.

## Security tradeoff

This fix allows only the exact Railway host, not the wildcard `.up.railway.app` domain. A wildcard would be more convenient for preview or regenerated Railway domains, but it would also broaden the set of hosts accepted by the Vite development server. If the Railway domain changes, add the new exact host instead of enabling a wildcard unless there is a clear operational need.

The preferred production-safe fix is to make Railway use `Dockerfile.railway` so the deployed app does not rely on the Vite development server at all.

## Railway settings

Recommended Railway configuration:

1. Set the service Dockerfile path to `Dockerfile.railway`.
2. Ensure the service routes to container port `5173`.
3. Keep runtime secrets in Railway Variables only.
4. Do not commit `.env`, `.env.local`, provider keys, platform tokens, or commercial-integration credentials.
5. Redeploy the service and verify the start command in logs is `pnpm run dockerstart`, not `remix vite:dev`.

If Railway cannot use a custom Dockerfile path, configure the original `Dockerfile` build target as `bolt-ai-production` in Railway/Nixpacks settings if supported.

## Validation steps after deploy

1. Run `pnpm run lint` locally.
2. Run `pnpm run build` locally.
3. Deploy Railway using `Dockerfile.railway`.
4. Open `https://gxeon-app-forge-production.up.railway.app`.
5. Confirm the Vite blocked-host error is gone.
6. Check Railway logs for `pnpm run dockerstart` and absence of `remix vite:dev --host`.
7. Verify `/api.health` responds if exposed by the deployment.

## Safety confirmation

- No secrets were added.
- No API keys or platform tokens were added.
- No commercial integrations were added.
- No deep GXEON rebrand was performed.
- Existing bolt.diy core behavior and MIT license were preserved.
