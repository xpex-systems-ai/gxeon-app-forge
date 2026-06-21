# APPFORGE-001.8 Definitive Single-Shell Validation Report

## Scope

Mission `APPFORGE-001_8_DEFINITIVE_SINGLE_SHELL_RUNTIME_VALIDATION` audited and hardened the Founder Preview pre-chat shell so the GXEON hero/module grid has one canonical UI render path.

## Observed issue

The public Railway screenshot was reported to show the GXEON App Forge hero/module shell duplicated even though source rendered `GxeonProductShellIntro` once under `!chatStarted` in `BaseChat`.

## Source search classification

Search command:

```bash
rg -n "GXEON App Forge|Digital Product Creation OS|Crie\. Embale\. Venda\. Distribua\. Acompanhe\.|Founder Preview|Product Builder|GxeonProductShellIntro" .
```

| File/line | Classification | Notes |
| --- | --- | --- |
| `package.json:3` | metadata/docs | Package description only. |
| `app/components/header/Header.tsx:23,28` | header UI | Header brand only; not the hero/module shell. |
| `app/components/chat/BaseChat.tsx:33,396` | canonical render path | Imports and renders `GxeonProductShellIntro` exactly once when `!chatStarted`. |
| `app/components/chat/APIKeyManager.tsx:92` | API key UI copy | Provider-key safety notice only. |
| `app/components/chat/GxeonProductShellIntro.tsx:4,14,20,24,27,33,40,63` | canonical component | Single source of truth for category, hero, module grid, Founder Preview notice, attribution, and build marker. |
| `app/components/chat/ExamplePrompts.tsx:4` | starter prompt | Example prompt text only. |
| `app/routes/git.tsx:11,14` | metadata | Route title/description only. |
| `app/routes/_index.tsx:10,13,21` | metadata/docs | Route title/description/comment only. |
| `app/components/chat/__tests__/gxeon-single-shell.spec.ts:*` | validation | Static regression test assertions. |

No suspicious duplicated UI render path remains in `ChatBox`, `ExamplePrompts`, `StarterTemplates`, routes, or parent containers.

## Runtime/layout audit

- `BaseChat` now keeps `GxeonProductShellIntro` in one guarded block: `!chatStarted`.
- `ChatBox` remains responsible only for the composer, provider/model controls, API key UI, files, screenshots, voice, enhance prompt, web search, and send controls.
- `PreChatHome` owns secondary pre-chat actions only: Product Factory Mode, import/clone buttons, examples, and starter templates.
- Product Factory buttons call `handleInputChange` and focus the textarea; they do not call `sendMessage`, `append`, or `reload`.
- `sendMessage` remains the only normal path that calls `runAnimation()` to transition `chatStarted` and hide the intro.

## Strongest confirmed root-cause hypothesis

The source code already had one direct `GxeonProductShellIntro` render, so the reported Railway duplicate is most consistent with stale deployed assets, an old container image, or a cached browser session showing pre-PR code. This change adds a visible harmless build marker (`Foundation build: APPFORGE-001.8`) and a `data-gxeon-shell="founder-preview"` marker to make deployed-runtime verification deterministic.

## Files changed

- `app/components/chat/BaseChat.tsx`
- `app/components/chat/GxeonProductShellIntro.tsx`
- `app/components/chat/PreChatHome.tsx`
- `app/components/chat/__tests__/gxeon-single-shell.spec.ts`
- `docs/gxeon/APPFORGE_DEFINITIVE_SINGLE_SHELL_REPORT.md`
- `docs/gxeon/APPFORGE_RAILWAY_RUNTIME_VALIDATION.md`

## Final pre-chat layout order

1. Header brand.
2. One canonical `GxeonProductShellIntro` hero/module shell.
3. Prompt composer with provider/model/API key controls.
4. Product Factory Mode prompt-fill buttons.
5. Import Chat, Import Folder, and Clone a repo actions.
6. Example prompts.
7. Starter templates.

## Safety confirmation

No secrets, real environment values, provider SDKs, payment integrations, marketplace API clients, social auto-posting, or automatic publishing logic were added. MIT license metadata and upstream bolt.diy attribution remain preserved.

## Readiness

After Railway redeploys the latest `main` and the public URL is hard-refreshed, this foundation is ready for the next mission: `APPFORGE-002_PRODUCT_BUILDER_MVP`.
