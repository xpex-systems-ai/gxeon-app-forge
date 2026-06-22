# APPFORGE-006 Content Factory MVP Report

Content Factory MVP adds a manual-first campaign blueprint module to GXEON App Forge. It converts product, marketplace, checkout, and landing context into local-only campaign assets: positioning, content angles, Instagram and LinkedIn drafts, YouTube Shorts scripts, email drafts, WhatsApp manual follow-up copy, ad angle drafts, a launch calendar, checklists, risk warnings, Markdown, JSON, and a Composer prompt.

## Safety boundary

Excluded from this MVP: auto-posting, scheduling, email sending, WhatsApp sending, ad creation, social APIs, email APIs, WhatsApp APIs, ads APIs, external API calls, and database persistence. All actions are local browser actions or Composer population for human review.

## Local behavior

Drafts are saved only to `localStorage` under `gxeon.contentFactory.draft.v1`. Imports from Product Builder, Marketplace Pack, Checkout Blueprint, and Landing Builder happen only after explicit button clicks.

## APPFORGE-007 readiness

The next Integration Readiness Layer should add capability detection, permission models, audit checklists, and integration contracts without enabling automatic distribution until human approval gates exist.
