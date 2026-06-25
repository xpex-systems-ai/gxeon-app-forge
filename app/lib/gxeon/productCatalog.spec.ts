import { describe, expect, it } from 'vitest';
import {
  PRODUCT_CATALOG_ASSET_STORAGE_KEY,
  PRODUCT_CATALOG_STORAGE_KEY,
  buildProductCatalogJson,
  buildProductCatalogMarkdown,
  createProductCatalogAsset,
  createProductCatalogItem,
} from './productCatalog';

describe('product catalog', () => {
  it('keeps expected localStorage keys', () => {
    expect(PRODUCT_CATALOG_STORAGE_KEY).toBe('gxeon.productCatalog.items.v1');
    expect(PRODUCT_CATALOG_ASSET_STORAGE_KEY).toBe('gxeon.productCatalog.assets.v1');
  });

  it('generates fresh product ids when no id is provided', () => {
    const first = createProductCatalogItem({ productName: 'Produto A' });
    const second = createProductCatalogItem({ productName: 'Produto B' });

    expect(first.id).not.toBe(second.id);
    expect(first.productName).toBe('Produto A');
    expect(second.productName).toBe('Produto B');
  });

  it('generates fresh asset ids when no id is provided', () => {
    const first = createProductCatalogAsset({ productId: 'prod_1', title: 'Asset A' });
    const second = createProductCatalogAsset({ productId: 'prod_1', title: 'Asset B' });

    expect(first.id).not.toBe(second.id);
    expect(first.title).toBe('Asset A');
    expect(second.title).toBe('Asset B');
  });

  it('builds markdown and safety export without external actions', () => {
    const item = createProductCatalogItem({ productName: 'Catálogo Seguro', offer: 'Oferta manual' });
    const asset = createProductCatalogAsset({ productId: item.id, title: 'Landing manual', type: 'landing' });
    const markdown = buildProductCatalogMarkdown([item], [asset]);
    const exported = buildProductCatalogJson([item], [asset]);

    expect(markdown).toContain('Catálogo Seguro');
    expect(markdown).toContain('Landing manual');
    expect(exported.safety).toMatchObject({
      localOnly: true,
      noUploads: true,
      noLivePayments: true,
      noWebhookExecution: true,
    });
  });

  it('filters secret-like fields and values during normalization', () => {
    const item = createProductCatalogItem({
      productName: `Produto ${'sk-' + 'abcdefghijklmnop'}`,
      notes: 'ok',
      apiKey: 'secret',
    } as Partial<ReturnType<typeof createProductCatalogItem>> & { apiKey: string });

    expect(JSON.stringify(item)).not.toContain('apiKey');
    expect(item.productName).toBe('[filtered]');
  });
});
