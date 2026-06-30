import { describe, expect, it } from 'vitest';
import {
  buildHotmartDistributionJson,
  normalizeHotmartDistributionDraft,
  stringifyHotmartDistributionJson,
} from './hotmartDistribution';

describe('hotmartDistribution', () => {
  it('exports only local-only manual-first safety flags', () => {
    const exported = buildHotmartDistributionJson({ productName: 'Curso IA' }, '2026-06-30T00:00:00.000Z');

    expect(exported.safety.localOnlyDraft).toBe(true);
    expect(exported.safety.manualFirst).toBe(true);
    expect(exported.safety.humanApprovalRequired).toBe(true);
    expect(exported.safety.noHotmartApi).toBe(true);
    expect(exported.safety.noAutoPublishing).toBe(true);
    expect(exported.safety.noCheckoutCreation).toBe(true);
    expect(exported.safety.noPaymentProcessing).toBe(true);
    expect(exported.safety.noWebhooks).toBe(true);
    expect(exported.safety.noTokens).toBe(true);
    expect(exported.safety.noSecrets).toBe(true);
    expect(exported.safety.noDatabase).toBe(true);
  });

  it('strips hotmart_token and client_secret values from exported JSON', () => {
    const json = stringifyHotmartDistributionJson(
      {
        productName: 'Curso seguro',
        offer: 'hotmart_token_supersecreto12345',
        operatorNotes: 'client_secret_supersecreto12345',
      },
      '2026-06-30T00:00:00.000Z',
    );

    expect(json).not.toContain('hotmart_token_supersecreto12345');
    expect(json).not.toContain('client_secret_supersecreto12345');
  });

  it('does not export raw or slugified secret-like slug values', () => {
    const exported = buildHotmartDistributionJson(
      {
        productName: 'Curso Seguro Para Founders',
        slug: 'token_supersecreto12345',
      },
      '2026-06-30T00:00:00.000Z',
    );
    const json = JSON.stringify(exported);

    expect(json).not.toContain('token_supersecreto12345');
    expect(json).not.toContain('token-supersecreto12345');
    expect(exported.draft.slug).toBe('curso-seguro-para-founders');
  });

  it('falls back to the local draft slug when slug and productName are unsafe', () => {
    const exported = buildHotmartDistributionJson(
      {
        productName: 'client_secret_supersecreto12345',
        slug: 'token_supersecreto12345',
      },
      '2026-06-30T00:00:00.000Z',
    );

    expect(exported.draft.slug).toBe('hotmart-local-draft');
  });

  it('preserves audience aliases without mutating the original input', () => {
    const input = {
      productName: 'Curso IA',
      audience: 'Solo founders',
      publicoAlvo: 'Empreendedores',
    };
    const before = { ...input };
    const draft = normalizeHotmartDistributionDraft(input, '2026-06-30T00:00:00.000Z');

    expect(draft.targetAudience).toBe('Solo founders');
    expect(input).toEqual(before);
  });

  it('prioritizes targetAudience over audience', () => {
    const draft = normalizeHotmartDistributionDraft(
      {
        productName: 'Curso IA',
        targetAudience: 'Founders B2B',
        audience: 'Audience genérica',
      },
      '2026-06-30T00:00:00.000Z',
    );

    expect(draft.targetAudience).toBe('Founders B2B');
  });

  it('does not export unknown enumerable fields', () => {
    const json = stringifyHotmartDistributionJson(
      {
        productName: 'Curso IA',
        hotmart_token: 'hotmart_token_supersecreto12345',
        client_secret: 'client_secret_supersecreto12345',
      } as Record<string, unknown>,
      '2026-06-30T00:00:00.000Z',
    );

    expect(json).not.toContain('hotmart_token');
    expect(json).not.toContain('client_secret');
    expect(json).not.toContain('supersecreto12345');
  });
});
