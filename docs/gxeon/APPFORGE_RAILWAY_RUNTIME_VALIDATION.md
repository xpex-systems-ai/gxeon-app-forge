# APPFORGE-001.8 Railway Runtime Validation

Public URL: <https://gxeon-app-forge-production.up.railway.app>

## Purpose

Validate the deployed runtime, not only source code, displays a single canonical GXEON App Forge Founder Preview shell.

## Deployment consistency checklist

1. Redeploy the Railway service from the latest `main` commit containing APPFORGE-001.8.
2. Confirm the Railway deployment/build log references the expected commit SHA when available.
3. Open the public URL in a new/private browser window.
4. Hard refresh with `Ctrl+F5` / `Cmd+Shift+R`.
5. If duplication persists, clear site data for the Railway domain and reload again.

## DOM validation checklist

Run these checks in browser DevTools console on the initial pre-chat page:

```js
document.querySelectorAll('[data-gxeon-shell="founder-preview"]').length;
```

Expected result: `1`.

```js
[...document.querySelectorAll('[data-gxeon-shell="founder-preview"] h1')].map((node) => node.textContent?.trim());
```

Expected result: one item, `GXEON App Forge`.

```js
document.body.innerText.includes('Foundation build: APPFORGE-001.8');
```

Expected result: `true` after the latest deployment is serving.

## Manual UI validation

- Confirm the top header displays GXEON App Forge.
- Confirm exactly one main GXEON App Forge hero is visible.
- Scroll through the whole pre-chat page and confirm no second hero block appears.
- Confirm the module cards appear once.
- Confirm Founder Preview appears once.
- Confirm Product Factory Mode appears once.
- Click `Criar Produto Digital` and confirm the prompt input is populated.
- Confirm chat does not start until the send button or Enter is used.
- Open provider/model controls and confirm selection still works.
- Confirm API key status UI renders without requiring a real key to render the page.
- Confirm Import Chat, Import Folder, and Clone a repo remain visible.

## If stale assets are suspected

A page that does not show `Foundation build: APPFORGE-001.8` is not serving the latest APPFORGE-001.8 runtime. Redeploy latest `main`, verify the commit SHA in Railway if available, then hard refresh and repeat the DOM checks.
