import { describe, expect, it } from 'vitest';
import { createProductCatalogItem, type ProductCatalogItem } from './productCatalog';
import { importProductCatalogItemToHotmart } from './hotmartDistribution';

describe('Hotmart Distribution local import', () => {
  it('preserves Product Catalog audience when targetAudience is absent', () => {
    const catalogItem = createProductCatalogItem({
      productName: 'Curso IA Local',
      audience: 'corretores iniciantes de bairro',
      problem: 'captação manual inconsistente',
      promise: 'organizar prospecção com templates revisáveis',
      basePrice: 'R$ 197',
    });
    const original = structuredClone(catalogItem);

    const imported = importProductCatalogItemToHotmart(catalogItem);

    expect(imported.draft.targetAudience).toBe('corretores iniciantes de bairro');
    expect(imported.draft).toMatchObject({
      productName: 'Curso IA Local',
      problem: 'captação manual inconsistente',
      promise: 'organizar prospecção com templates revisáveis',
      desiredPrice: 'R$ 197',
      source: 'catalog',
    });
    expect(imported.assetPack.salesPageCopy).toContain('corretores iniciantes de bairro');
    expect(imported.assetPack.listing.longDescription).toContain('corretores iniciantes de bairro');
    expect(catalogItem).toEqual(original);
  });

  it('keeps targetAudience priority over audience and does not mutate the catalog object', () => {
    const catalogItem = {
      ...createProductCatalogItem({
        productName: 'Mentoria Local',
        audience: 'público secundário do catálogo',
        problem: 'briefings dispersos',
        promise: 'padronizar operação local',
        basePrice: 'R$ 497',
      }),
      targetAudience: 'gestores de tráfego para experts locais',
    } satisfies ProductCatalogItem & { targetAudience: string };
    const original = structuredClone(catalogItem);

    const imported = importProductCatalogItemToHotmart(catalogItem);

    expect(imported.draft.targetAudience).toBe('gestores de tráfego para experts locais');
    expect(imported.assetPack.salesPageCopy).toContain('gestores de tráfego para experts locais');
    expect(imported.assetPack.listing.longDescription).toContain('gestores de tráfego para experts locais');
    expect(catalogItem).toEqual(original);
  });
});
