import { describe, expect, it } from 'vitest';
import {
  buildHotmartDistributionJson,
  createEmptyHotmartDistributionDraft,
  normalizeHotmartDistributionDraft,
  stringifyHotmartDistributionJson,
} from './hotmartDistribution';

describe('Hotmart Distribution OS safety helpers', () => {
  const now = '2026-06-30T00:00:00.000Z';

  it('rejects secret-like slug values before slugification and falls back to safe product name', () => {
    const json = stringifyHotmartDistributionJson(
      { productName: 'Curso Seguro de IA', slug: 'client_secret_supersecreto12345' },
      now,
    );

    expect(json).not.toContain('client_secret_supersecreto12345');
    expect(json).not.toContain('client-secret-supersecreto12345');
    expect(JSON.parse(json).draft.slug).toBe('curso-seguro-de-ia');
  });

  it('uses hotmart-local-draft when slug and productName are secret-like or empty', () => {
    expect(
      normalizeHotmartDistributionDraft(
        { slug: 'hotmart_token_supersecreto12345', productName: 'client_secret_supersecreto12345' },
        now,
      ).slug,
    ).toBe('hotmart-local-draft');
    expect(normalizeHotmartDistributionDraft({ slug: '', productName: '' }, now).slug).toBe('hotmart-local-draft');
  });

  it('strips hotmart_token and client_secret extra enumerable fields from exports', () => {
    const json = stringifyHotmartDistributionJson(
      {
        productName: 'Curso Seguro',
        hotmart_token: 'hotmart_token_supersecreto12345',
        client_secret: 'client_secret_supersecreto12345',
      },
      now,
    );

    expect(json).not.toContain('hotmart_token_supersecreto12345');
    expect(json).not.toContain('client_secret_supersecreto12345');
    expect(Object.keys(JSON.parse(json).draft)).not.toContain('hotmart_token');
    expect(Object.keys(JSON.parse(json).draft)).not.toContain('client_secret');
  });

  it('preserves audience aliases and prioritizes targetAudience over audience', () => {
    expect(normalizeHotmartDistributionDraft({ audience: 'Afiliados iniciantes' }, now).targetAudience).toBe(
      'Afiliados iniciantes',
    );
    expect(normalizeHotmartDistributionDraft({ publicoAlvo: 'Produtores digitais' }, now).targetAudience).toBe(
      'Produtores digitais',
    );
    expect(
      normalizeHotmartDistributionDraft({ audience: 'Audiência genérica', targetAudience: 'Clientes premium' }, now)
        .targetAudience,
    ).toBe('Clientes premium');
  });

  it('does not mutate original input objects', () => {
    const input = { audience: 'Afiliados', slug: 'Meu Produto', createdAt: '2026-06-01T00:00:00.000Z' };
    const copy = { ...input };

    normalizeHotmartDistributionDraft(input, now);

    expect(input).toEqual(copy);
  });

  it('sanitizes secret-like createdAt before JSON, context, prompt and Markdown export', () => {
    const exported = buildHotmartDistributionJson(
      {
        ...createEmptyHotmartDistributionDraft(now),
        productName: 'Curso Seguro',
        createdAt: 'client_secret_supersecreto12345',
      },
      now,
    );
    const json = JSON.stringify(exported);

    expect(json).not.toContain('client_secret_supersecreto12345');
    expect(exported.draft.createdAt).toBe(now);
    expect(exported.contextPayload).not.toContain('client_secret_supersecreto12345');
    expect(exported.prompt).not.toContain('client_secret_supersecreto12345');
    expect(exported.markdown).not.toContain('client_secret_supersecreto12345');
  });

  it('sanitizes secret-like updatedAt before JSON, context, prompt and Markdown export', () => {
    const exported = buildHotmartDistributionJson(
      {
        ...createEmptyHotmartDistributionDraft(now),
        productName: 'Curso Seguro',
        updatedAt: 'hotmart_token_supersecreto12345',
      },
      now,
    );
    const json = JSON.stringify(exported);

    expect(json).not.toContain('hotmart_token_supersecreto12345');
    expect(exported.draft.updatedAt).toBe(now);
    expect(exported.contextPayload).not.toContain('hotmart_token_supersecreto12345');
    expect(exported.prompt).not.toContain('hotmart_token_supersecreto12345');
    expect(exported.markdown).not.toContain('hotmart_token_supersecreto12345');
  });

  it('sanitizes empty invalid and oversized timestamps to now', () => {
    const oversized = `${'2'.repeat(41)}`;

    expect(normalizeHotmartDistributionDraft({ createdAt: '', updatedAt: 'not-a-date' }, now).createdAt).toBe(now);
    expect(normalizeHotmartDistributionDraft({ createdAt: oversized, updatedAt: oversized }, now).updatedAt).toBe(now);
  });
});
