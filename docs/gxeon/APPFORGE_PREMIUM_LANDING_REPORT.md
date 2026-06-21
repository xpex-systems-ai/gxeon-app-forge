# APPFORGE-001.9 Premium Public Landing Report

## Summary

The public home now presents a premium GXEON-branded landing foundation around the existing builder composer. The implementation evolves the canonical `GxeonProductShellIntro` into a multi-section landing experience while keeping `BaseChat` as the owner of the real `ChatBox` composer and provider/model/API key controls.

## Sections created

- Top navigation with GX icon, GXEON App Forge brand, scroll-safe links, Entrar and Começar actions.
- Gradient hero with Founder Preview helper copy and original GXEON positioning.
- Safe social proof labels: Builders, Creators, Agencies, Sellers and Operators.
- How-it-works explanation with manual-first approval language.
- Eight preview template cards rendered with CSS gradients only.
- Roadmap/foundation metrics only: modules planned, beta phases and mapped integrations.
- Final CTA that scrolls/focuses the real composer instead of creating a second fake composer.
- Enterprise-style footer with upstream bolt.diy attribution and MIT foundation note.

## Architecture choice

The landing is implemented in `app/components/chat/GxeonProductShellIntro.tsx` because `BaseChat` already renders that canonical shell exactly once before chat starts. `BaseChat` now exposes the existing composer wrapper with `id="composer"` so landing CTAs can scroll to the real prompt input without duplicating prompt state.

## Safety boundaries

- No Lovable branding, logos, screenshots, customer logos or copy were added.
- No real payment processing, marketplace API clients, social posting, or auto-publishing was added.
- No secrets or real environment values were added.
- All public claims remain founder-preview, roadmap, foundation or manual-first claims.
- Upstream attribution to bolt.diy and the MIT foundation are preserved in the footer copy.
