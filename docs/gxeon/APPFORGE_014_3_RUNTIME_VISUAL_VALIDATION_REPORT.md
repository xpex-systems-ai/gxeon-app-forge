# APPFORGE-014.3 Runtime Visual Validation and Superseded PR Cleanup Report

Date: 2026-06-29 UTC

## Scope and Safety Lock

APPFORGE-014.3 is a validation-and-cleanup report only. No feature code, runtime behavior, Core Bridge contract, Product Catalog schema, local import logic, real Core API, Hotmart API, webhooks, tokens, secrets, databases, payments, checkout links, external network requests from the app, or auto-publish behavior was added.

APPFORGE-015 remains blocked until this report is reviewed and any repository-permission cleanup gaps are accepted or completed by a maintainer.

## Production URL and Railway Runtime Validation

| Item | Result |
| --- | --- |
| Production URL validated | `https://gxeon-app-forge-production.up.railway.app/` |
| Railway active deployment status | Not independently inspectable from this environment because Railway project access and deploy logs are not available here. Prior APPFORGE-014.2 documented the URL as reachable after the temporary 502 incident. |
| Clean browser/private context | Attempted via available browser/web validation tooling; a full interactive browser/session screenshot was not available in this environment. |
| Hard refresh/cache bypass | Attempted with no-cache headers from the command line, but outbound HTTPS CONNECT was blocked by the environment proxy before reaching Railway. |
| Production app opens without 502 | Could not be re-confirmed from command-line networking in this environment. Prior APPFORGE-014.2 recorded browser/web validation as reachable with no 502 on 2026-06-29 UTC. |
| Hard refresh changed result | Not observed; the cache-bypass command did not reach Railway because the environment proxy returned HTTP 403 for the CONNECT tunnel. |

## Runtime Render Count

Because the environment could not provide an authenticated/interactive production browser screenshot and command-line HTTPS to Railway was blocked before reaching the app, APPFORGE-014.3 does **not** claim a fresh visual count from a live DOM. The safe conclusion is therefore split between runtime and source:

| Section | Live visual count | Source-audited expected count |
| --- | ---: | ---: |
| Product Factory Mode | Not re-confirmed from live DOM in this environment | 1 |
| Operator Workspace | Not re-confirmed from live DOM in this environment | 1 |
| Product Builder MVP | Not re-confirmed from live DOM in this environment | 1 visible instance on the default `Criar` tab |

No duplicate source render path was found. If a fresh private-window Railway screenshot still shows repeated Forge sections, the most likely causes to investigate before any code change are: stale browser/cache state, old Railway deployment still serving an obsolete bundle, or a duplicated/stale client bundle at the deployed runtime. The current main source does not support an actual duplicate Product Factory / Operator Workspace source rendering path.

## Source Audit Confirmation

| Requirement | Result | Evidence |
| --- | --- | --- |
| `PreChatHome` renders only one section with `data-testid="gxeon-product-factory-mode"` | Passed | The file has one `section` carrying that test id and the Product Factory Mode heading. |
| `PreChatHome` renders one `OperatorWorkspaceShell` | Passed | The same Product Factory section contains one `OperatorWorkspaceShell` invocation. |
| `BaseChat` renders `PreChatHome` once before chat starts | Passed | `PreChatHome` is rendered once behind the `!chatStarted` guard. |
| `ProductBuilderMVP` does not import or render `OperatorWorkspaceShell` | Passed | `ProductBuilderMVP` imports only React and product-builder library helpers; no workspace shell import or render exists. |
| `OperatorWorkspaceShell` renders only `activeTab.moduleKeys` | Passed | The workspace maps only over `activeTab.moduleKeys` inside the tab panel. |

## Superseded PR Cleanup Status

Target comment requested for superseded PRs:

> Superseded by APPFORGE-014 final consolidation PR #40, APPFORGE-014.1 UI cleanup PR #41, and APPFORGE-014.2 production health lock PR #42. Do not merge this PR. Closing to keep the mainline clean.

| PR | Observed status | Cleanup result |
| --- | --- | --- |
| #34 | Open in unauthenticated GitHub PR listing on 2026-06-29 | Could not close from this environment; GitHub CLI is unavailable and no authenticated GitHub write token/session is exposed. Maintainer closure still required. |
| #36 | Open in unauthenticated GitHub PR listing on 2026-06-29 | Could not close from this environment; maintainer closure still required. |
| #37 | Open in unauthenticated GitHub PR listing on 2026-06-29 | Could not close from this environment; maintainer closure still required. |
| #38 | Open in unauthenticated GitHub PR listing on 2026-06-29 | Could not close from this environment; maintainer closure still required. |
| #39 | Open in unauthenticated GitHub PR listing on 2026-06-29 | Could not close from this environment; maintainer closure still required. |

No unrelated PRs were modified or targeted.

## APPFORGE-015 Gate

APPFORGE-015 is **still blocked** from this environment because the live Railway DOM count and superseded PR closures could not be completed with the available access. Source audit passes and indicates APPFORGE-014 is locked in `main`, but a maintainer should still complete one private-window production check and close PRs #34, #36, #37, #38, and #39 or explicitly accept them as manual follow-up.
