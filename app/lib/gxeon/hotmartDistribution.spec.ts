import { describe, expect, it } from 'vitest';
import {
  buildHotmartDistributionContextPayload,
  buildHotmartDistributionMarkdown,
  buildHotmartDistributionPrompt,
  normalizeHotmartDistributionDraft,
  stringifyHotmartDistributionJson,
  validateHotmartDistributionDraft,
} from './hotmartDistribution';

const now = '2026-06-30T00:00:00.000Z';

describe('Hotmart Distribution OS helpers', () => {
  it('keeps the full manual-first module surface', () => {
    const draft = normalizeHotmartDistributionDraft({ productName: 'Curso IA', targetAudience: 'corretores' }, now);
    expect(draft).toMatchObject({ productDraft: '', affiliateKit: '', assetPack: '', complianceNotes: '' });
    expect(draft.launchQueue.length).toBeGreaterThan(0);
    expect(draft.manualPublishChecklist.length).toBeGreaterThan(0);
  });

  it('rejects secret-like slug candidates before slugification', () => {
    const draft = normalizeHotmartDistributionDraft({ productName: 'Curso Seguro', slug: 'client_secret_123' }, now);
    expect(draft.slug).toBe('curso-seguro');
  });

  it('falls back to hotmart-local-draft when slug and product name are empty or secret-like', () => {
    expect(normalizeHotmartDistributionDraft({ productName: 'hotmart_token_abc', slug: 'api_key_xyz' }, now).slug).toBe(
      'hotmart-local-draft',
    );
  });

  it('strips unknown enumerable fields and secret fields from JSON export', () => {
    const json = stringifyHotmartDistributionJson({
      productName: 'Curso Seguro',
      targetAudience: 'afiliados',
      hotmart_token: 'hotmart_token_secret',
      client_secret: 'client_secret_value',
      unknownField: 'do not export',
    });
    expect(json).toContain('Curso Seguro');
    expect(json).not.toContain('hotmart_token');
    expect(json).not.toContain('client_secret');
    expect(json).not.toContain('unknownField');
  });

  it('sanitizes createdAt and updatedAt everywhere', () => {
    const input = { productName: 'Curso', createdAt: 'api_key_123', updatedAt: 'refresh_token_456' };
    const normalized = normalizeHotmartDistributionDraft(input, now);
    expect(normalized.createdAt).toBe(now);
    expect(normalized.updatedAt).toBe(now);
    expect(stringifyHotmartDistributionJson(input)).not.toContain('api_key_123');
    expect(buildHotmartDistributionContextPayload(input).draft.createdAt).not.toContain('api_key');
    expect(buildHotmartDistributionPrompt(input)).not.toContain('refresh_token_456');
    expect(buildHotmartDistributionMarkdown(input)).not.toContain('api_key_123');
  });

  it('falls back for invalid or oversized timestamps', () => {
    expect(
      normalizeHotmartDistributionDraft({ createdAt: 'not a date', updatedAt: 'x'.repeat(120) }, now),
    ).toMatchObject({
      createdAt: now,
      updatedAt: now,
    });
  });

  it('preserves audience alias priority with targetAudience before audience', () => {
    expect(
      normalizeHotmartDistributionDraft({ targetAudience: 'prioritário', audience: 'secundário' }, now).targetAudience,
    ).toBe('prioritário');
    expect(normalizeHotmartDistributionDraft({ audience: 'único válido' }, now).targetAudience).toBe('único válido');
    expect(normalizeHotmartDistributionDraft({ publicoAlvo: 'pt-br' }, now).targetAudience).toBe('pt-br');
  });

  it('does not mutate the original input object', () => {
    const input = { productName: 'Curso', audience: 'afiliados', launchQueue: ['Manual'] };
    const snapshot = JSON.stringify(input);
    normalizeHotmartDistributionDraft(input, now);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it('keeps Hotmart API, autopublish, checkout, payment and webhook behavior blocked', () => {
    const validation = validateHotmartDistributionDraft({
      productName: 'Curso',
      targetAudience: 'afiliados',
      promise: 'clareza',
    });
    expect(validation.blockedExternalActions).toEqual([
      'hotmart_api',
      'auto_publish',
      'checkout_creation',
      'payment_processing',
      'webhooks',
    ]);

    const prompt = buildHotmartDistributionPrompt({ productName: 'Curso' }).toLowerCase();
    expect(prompt).toContain('não chame api hotmart');
    expect(prompt).toContain('não publique');
    expect(prompt).toContain('não crie checkout');
    expect(prompt).toContain('não processe pagamento');
    expect(prompt).toContain('não use webhooks');
  });
});
