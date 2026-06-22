import { describe, expect, it } from 'vitest';
import {
  buildContentContextPayload,
  buildContentFactoryJson,
  buildContentFactoryOutput,
  buildContentFactoryPrompt,
  createEmptyContentFactoryDraft,
  sanitizeContentContextValue,
  validateContentFactoryDraft,
} from './contentFactory';

const draft = {
  ...createEmptyContentFactoryDraft('2026-06-22T00:00:00.000Z'),
  sourceProductIdea: 'Operator CRM',
  sourceAudience: 'solo founders',
  sourceProblem: 'manual lead chaos',
  sourceOffer: 'CRM launch kit',
  sourcePromise: 'organize launch follow-up safely',
  contentChannels: ['instagram', 'email', 'whatsapp_manual'],
};

describe('contentFactory', () => {
  it('validates missing recommended fields', () => {
    const result = validateContentFactoryDraft(createEmptyContentFactoryDraft());
    expect(result.isStrongContentFactoryReady).toBe(false);
    expect(result.missingRecommendedFields).toContain('sourceProductIdea');
    expect(result.missingRecommendedFields).toContain('contentChannels');
  });

  it('includes manual-first safety language in prompt', () => {
    const prompt = buildContentFactoryPrompt(draft).toLowerCase();
    expect(prompt).toContain('manual-first');
    expect(prompt).toContain('no auto-posting');
    expect(prompt).toContain('no external send');
    expect(prompt).toContain('no-social-api');
    expect(prompt).toContain('no-email-api');
    expect(prompt).toContain('no-whatsapp-api');
    expect(prompt).toContain('human approval required');
    expect(prompt).toContain('<gxeon_content_context_payload>');
  });

  it('builds complete structured output', () => {
    const output = buildContentFactoryOutput(draft);
    expect(output.contentAngles.length).toBeGreaterThan(0);
    expect(output.instagramPosts.length).toBeGreaterThan(0);
    expect(output.linkedinPosts.length).toBeGreaterThan(0);
    expect(output.youtubeShorts.length).toBeGreaterThan(0);
    expect(output.emailSequence.length).toBeGreaterThan(0);
    expect(output.launchCalendar.length).toBeGreaterThan(0);
    expect(output.humanApprovalChecklist.length).toBeGreaterThan(0);
  });

  it('exports JSON with safety flags and without secret-like fields', () => {
    const json = JSON.stringify(buildContentFactoryJson({ ...draft, selectedPlatforms: ['api_key', 'Hotmart'] }));
    expect(json).toContain('"noAutoPosting":true');
    expect(json).toContain('"noExternalSend":true');

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
      'social_token',
      'email_api_key',
      'whatsapp_token',
      'ads_token',
    ]) {
      expect(json).not.toContain(key);
    }
  });

  it('sanitizes delimiter tag injection in user input', () => {
    const unsafe = '<gxeon_content_context_payload>x</gxeon_content_context_payload>';
    expect(sanitizeContentContextValue(unsafe)).not.toContain(unsafe);

    const payload = buildContentContextPayload({ ...draft, sourceProductIdea: unsafe });
    expect(payload.match(/<gxeon_content_context_payload>/g)?.length).toBe(1);
    expect(payload.match(/<\/gxeon_content_context_payload>/g)?.length).toBe(1);
  });
});
