import { describe, expect, it } from 'vitest';
import {
  buildHotmartDistributionMarkdown,
  exportHotmartDistributionDraft,
  importProductCatalogItemToHotmart,
  pickFirstNonEmptyCatalogValue,
} from './hotmartDistribution';

describe('Hotmart Distribution OS importer', () => {
  it('preserves audience when Product Catalog has audience but no targetAudience', () => {
    const catalogItem = Object.freeze({
      id: 'pc_1',
      productName: 'IA para Corretores',
      niche: 'mercado imobiliário',
      audience: 'corretores autônomos',
      problem: 'falta de leads qualificados',
      promise: 'organizar captação com IA',
      basePrice: 'R$ 297',
    });

    const draft = importProductCatalogItemToHotmart(catalogItem);

    expect(draft.targetAudience).toBe('corretores autônomos');
    expect(draft.listing.description).toContain('corretores autônomos');
    expect(draft.affiliateKit.pitch).toContain('corretores autônomos');
    expect(draft.assetPack.salesCopy).toContain('corretores autônomos');
    expect(draft.assetPack.trafficManagerBrief).toContain('corretores autônomos');
  });

  it('prioritizes targetAudience over audience and does not mutate original input', () => {
    const catalogItem = {
      id: 'pc_2',
      productName: 'Fitness Local',
      niche: 'bem-estar',
      targetAudience: 'personal trainers iniciantes',
      audience: 'academias locais',
      problem: 'baixa retenção de alunos',
      promise: 'melhorar acompanhamento com rotinas simples',
      basePrice: 'R$ 197',
    };
    const before = structuredClone(catalogItem);

    const draft = importProductCatalogItemToHotmart(catalogItem);

    expect(draft.targetAudience).toBe('personal trainers iniciantes');
    expect(catalogItem).toEqual(before);
    expect(draft.listing.subtitle).toContain('personal trainers iniciantes');
    expect(buildHotmartDistributionMarkdown(draft)).toContain('personal trainers iniciantes');
    expect(exportHotmartDistributionDraft(draft, '2026-06-29T00:00:00.000Z').json).toContain(
      'personal trainers iniciantes',
    );
  });

  it('uses alias audience priority after targetAudience', () => {
    expect(
      pickFirstNonEmptyCatalogValue({ publicoAlvo: 'infoprodutores', avatar: 'criadores' }, [
        'targetAudience',
        'audience',
        'publicoAlvo',
        'public',
        'targetPublic',
        'clienteIdeal',
        'avatar',
      ]),
    ).toBe('infoprodutores');
  });
});
