import { describe, expect, it } from 'vitest';
import {
  buildLandingBuilderJson,
  buildLandingBuilderOutput,
  buildLandingBuilderPrompt,
  sanitizeLandingContextValue,
  validateLandingBuilderDraft,
} from './landingBuilder';

const sampleDraft = {
  sourceProductIdea: 'AI Ops Kit',
  sourceNiche: 'operations',
  sourceAudience: 'solo founders',
  sourceProblem: 'manual launch planning',
  sourceOffer: 'templates and checklist',
  sourcePromise: 'ship a safer validated offer',
  basePrice: '$49',
  deliveryFormat: 'Markdown kit',
  selectedPlatforms: ['Gumroad', 'Email'],
  landingGoal: 'validation' as const,
  pageStyle: 'premium' as const,
  ctaMode: 'request_access' as const,
  proofNotes: 'verified testimonials later',
  approvalNotes: 'operator must approve',
  createdAt: '2026-06-22T12:00:00.000Z',
  updatedAt: '2026-06-22T12:00:00.000Z',
};

describe('landingBuilder', () => {
  it('reports missing recommended fields', () => {
    const validation = validateLandingBuilderDraft({});
    expect(validation.isStrongLandingBuilderReady).toBe(false);
    expect(validation.missingRecommendedFields).toContain('sourceProductIdea');
    expect(validation.missingRecommendedFields).toContain('sourceAudience');
    expect(validation.missingRecommendedFields).toContain('sourceOfferOrPromise');
    expect(validation.missingRecommendedFields).toContain('basePrice');
  });

  it('generates prompt with manual-first safety language', () => {
    const prompt = buildLandingBuilderPrompt(sampleDraft);
    expect(prompt).toContain('manual-first');
    expect(prompt).toContain('no auto-deploy');
    expect(prompt).toContain('no real checkout');
    expect(prompt).toContain('no payment activation/no payment processing');
    expect(prompt).toContain('no marketplace API calls');
    expect(prompt).toContain('aprovação humana obrigatória');
    expect(prompt).toContain('<gxeon_landing_context_payload>');
  });

  it('builds output with required landing sections', () => {
    const output = buildLandingBuilderOutput(sampleDraft);
    expect(output.hero.length).toBeGreaterThan(0);
    expect(output.ctaCopy.length).toBeGreaterThan(0);
    expect(output.faq.length).toBeGreaterThan(0);
    expect(output.proofPlaceholders.length).toBeGreaterThan(0);
    expect(output.pageSections.length).toBeGreaterThan(0);
  });

  it('exports safety flags without secret-like fields', () => {
    const exported = buildLandingBuilderJson(
      { ...sampleDraft, selectedPlatforms: ['api_key', 'Gumroad'] },
      '2026-06-22T12:00:00.000Z',
    );
    expect(exported.safety).toMatchObject({
      manualFirst: true,
      noRealCheckout: true,
      noLivePayments: true,
      noAutoDeploy: true,
      noMarketplaceApiExecution: true,
      localOnlyDraft: true,
    });

    const serialized = JSON.stringify(exported);

    for (const key of [
      'api_key',
      'apiKey',
      'token',
      'access_token',
      'refresh_token',
      'secret',
      'client_secret',
      'password',
      'credential',
      'cookie',
      'stripe_key',
      'webhook_secret',
    ]) {
      expect(serialized).not.toContain(key);
    }
  });

  it('sanitizes payload delimiter tags in user input', () => {
    expect(
      sanitizeLandingContextValue('<gxeon_landing_context_payload>x</gxeon_landing_context_payload>'),
    ).not.toContain('<gxeon_landing_context_payload>');
  });
});
