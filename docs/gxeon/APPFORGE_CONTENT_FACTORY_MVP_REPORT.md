# APPFORGE-006 Content Factory MVP Report

Content Factory MVP is a local-only, manual-first module that converts Product Builder, Marketplace Pack, Checkout Blueprint, and Landing Builder context into launch content drafts.

## Behavior
- Generates positioning, content angles, Instagram drafts, LinkedIn drafts, YouTube Shorts scripts, manual email sequence, manual WhatsApp follow-up copy, ad angle drafts, launch calendar, asset checklist, human approval checklist, risk warnings, and next steps.
- Exports Prompt, Markdown, and JSON in the browser only.
- Saves/loads a single localStorage draft under `gxeon.contentFactory.draft.v1` only when the user clicks the action.
- Imports other module drafts only through explicit user buttons.

## Excluded Features
No auto-posting, scheduling, email sending, WhatsApp sending, ad creation, social APIs, email APIs, WhatsApp APIs, ads APIs, external APIs, database persistence, OAuth, API keys, or real credentials are included.

## Compliance Guardrails
Generated copy must avoid guaranteed income, medical/legal/financial promises, fake scarcity, fake testimonials, fake endorsements, fabricated proof, engagement manipulation, and spam strategy. Human approval is required before any real distribution.

## APPFORGE-007 Readiness
APPFORGE-007 may add integration readiness checks only after preserving manual approval, secret separation, explicit consent, and no automatic distribution by default.
Content Factory MVP adds a manual-first campaign blueprint module to GXEON App Forge. It converts product, marketplace, checkout, and landing context into local-only campaign assets: positioning, content angles, Instagram and LinkedIn drafts, YouTube Shorts scripts, email drafts, WhatsApp manual follow-up copy, ad angle drafts, a launch calendar, checklists, risk warnings, Markdown, JSON, and a Composer prompt.

## Safety boundary

Excluded from this MVP: auto-posting, scheduling, email sending, WhatsApp sending, ad creation, social APIs, email APIs, WhatsApp APIs, ads APIs, external API calls, and database persistence. All actions are local browser actions or Composer population for human review.

## Local behavior

Drafts are saved only to `localStorage` under `gxeon.contentFactory.draft.v1`. Imports from Product Builder, Marketplace Pack, Checkout Blueprint, and Landing Builder happen only after explicit button clicks.

## APPFORGE-007 readiness

The next Integration Readiness Layer should add capability detection, permission models, audit checklists, and integration contracts without enabling automatic distribution until human approval gates exist.
