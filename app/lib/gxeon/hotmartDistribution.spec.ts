import { describe, expect, it } from 'vitest';

import {
  createHotmartDistributionDraft,
  normalizeHotmartDistributionDraft,
  stringifyHotmartDistributionJson,
} from './hotmartDistribution';

describe('Hotmart Distribution OS', () => {
  it('sanitizes JSON exports with allowlisted draft fields and safety flags', () => {
    const json = stringifyHotmartDistributionJson({
      productName: 'Curso Local',
      targetAudience: 'Creators independentes',
      offer: 'Mentoria local',
      hotmart_token: 'token_supersecreto12345',
      client_secret: 'secret_supersecreto12345',
      randomEnumerable: 'não exportar',
    });

    expect(json).toContain('Curso Local');
    expect(json).toContain('Creators independentes');
    expect(json).toContain('"localOnly": true');
    expect(json).toContain('"manualFirst": true');
    expect(json).toContain('"noHotmartApi": true');
    expect(json).toContain('"noAutoPublish": true');
    expect(json).toContain('"noCheckout": true');
    expect(json).toContain('"noPayments": true');
    expect(json).toContain('"noWebhooks": true');
    expect(json).toContain('"noTokens": true');
    expect(json).toContain('"noSecrets": true');
    expect(json).toContain('"noDatabase": true');
    expect(json).not.toContain('hotmart_token');
    expect(json).not.toContain('client_secret');
    expect(json).not.toContain('token_supersecreto12345');
    expect(json).not.toContain('secret_supersecreto12345');
    expect(json).not.toContain('randomEnumerable');
  });

  it('preserves Product Catalog audience when only audience exists', () => {
    const draft = normalizeHotmartDistributionDraft({ productName: 'Produto', audience: 'Professores online' });

    expect(draft.targetAudience).toBe('Professores online');
  });

  it('prioritizes targetAudience over audience', () => {
    const draft = normalizeHotmartDistributionDraft({
      productName: 'Produto',
      targetAudience: 'Consultores premium',
      audience: 'Audiência genérica',
    });

    expect(draft.targetAudience).toBe('Consultores premium');
  });

  it('does not mutate the original Product Catalog input object', () => {
    const source = {
      productName: 'Produto Imutável',
      targetAudience: 'Gestores',
      hotmart_token: 'token_supersecreto12345',
    };
    const snapshot = { ...source };

    createHotmartDistributionDraft(source);

    expect(source).toEqual(snapshot);
  });
});
