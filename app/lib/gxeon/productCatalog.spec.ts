import { describe, expect, it } from 'vitest';
import { createProductCatalogAsset, createProductCatalogItem } from './productCatalog';

describe('productCatalog helpers', () => {
  it('creates different product ids when no id is supplied', () => {
    const first = createProductCatalogItem({ productName: 'Produto A' }, '2026-06-25T00:00:00.000Z');
    const second = createProductCatalogItem({ productName: 'Produto B' }, '2026-06-25T00:00:00.000Z');

    expect(first.id).not.toEqual(second.id);
    expect(first.productName).toBe('Produto A');
    expect(second.productName).toBe('Produto B');
  });

  it('creates different asset ids when no id is supplied', () => {
    const first = createProductCatalogAsset({ productId: 'product-1', title: 'Asset A' }, '2026-06-25T00:00:00.000Z');
    const second = createProductCatalogAsset({ productId: 'product-1', title: 'Asset B' }, '2026-06-25T00:00:00.000Z');

    expect(first.id).not.toEqual(second.id);
    expect(first.title).toBe('Asset A');
    expect(second.title).toBe('Asset B');
  });

  it('keeps fallback names available at normalization level', () => {
    expect(createProductCatalogItem({}, '2026-06-25T00:00:00.000Z').productName).toBe('Produto local sem nome');
    expect(createProductCatalogAsset({}, '2026-06-25T00:00:00.000Z').title).toBe('Asset local sem título');
  });
});
