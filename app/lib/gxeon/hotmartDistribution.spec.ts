import { describe, expect, it } from 'vitest';
import { importProductCatalogItemToHotmart } from './hotmartDistribution';

describe('Hotmart Distribution Product Catalog import', () => {
  it('preserves audience when targetAudience is absent and keeps the catalog object unchanged', () => {
    const catalogItem = {
      id: 'pcp_001',
      productName: 'Curso IA para Consultores',
      audience: 'consultores independentes B2B',
      problem: 'prospecção inconsistente',
      promise: 'organizar um funil local com IA',
      basePrice: 'R$ 497',
    };
    const before = structuredClone(catalogItem);

    const imported = importProductCatalogItemToHotmart(catalogItem);

    expect(imported.draft.targetAudience).toBe('consultores independentes B2B');
    expect(imported.draft.source).toBe('catalog');
    expect(imported.assetPack.salesPageCopy.join(' ')).toContain('consultores independentes B2B');
    expect(catalogItem).toEqual(before);
  });

  it('uses targetAudience before audience when both fields exist', () => {
    const imported = importProductCatalogItemToHotmart({
      productName: 'Mentoria Local de Dados',
      targetAudience: 'gestores de operações',
      audience: 'analistas generalistas',
      problem: 'relatórios manuais',
      promise: 'criar rotinas de decisão assistidas',
      desiredPrice: 'R$ 997',
    });

    expect(imported.draft.targetAudience).toBe('gestores de operações');
    expect(imported.assetPack.listing.longDescription).toContain('gestores de operações');
  });
});
