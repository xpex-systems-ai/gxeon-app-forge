import { describe, expect, it } from 'vitest';
import {
  buildProductCatalogJson,
  buildProductCatalogMarkdown,
  createProductCatalogAsset,
  createProductCatalogItem,
  generateProductCatalogSlug,
  normalizeProductCatalogAsset,
  normalizeProductCatalogItem,
  stripSecretLikeFields,
  summarizeProductCatalog,
} from './productCatalog';

describe('product catalog helper', () => {
  it('normalizes items and sanitizes delimiters/control characters', () => {
    const item = normalizeProductCatalogItem(
      { productName: '  Meu|Produto\n<script> ', channels: ['manual_email'], tags: 'a,b' as any },
      '2026-01-01T00:00:00.000Z',
    );
    expect(item.productName).toBe('Meu Produto script');
    expect(item.channels).toEqual(['manual_email']);
    expect(item.tags).toEqual(['a', 'b']);
  });
  it('normalizes assets as local-only requiring human approval', () => {
    const asset = normalizeProductCatalogAsset(
      { title: 'Asset', contentPreview: 'x'.repeat(1200), status: 'approved' },
      '2026-01-01T00:00:00.000Z',
    );
    expect(asset.localOnly).toBe(true);
    expect(asset.humanApprovalRequired).toBe(true);
    expect(asset.contentPreview.length).toBeLessThanOrEqual(900);
  });
  it('generates safe slugs', () => {
    expect(generateProductCatalogSlug('  Café Produto!!!  ')).toBe('cafe-produto');
  });
  it('counts summary statuses', () => {
    const items = [
      createProductCatalogItem({ status: 'approved' }),
      createProductCatalogItem({ status: 'beta_ready' }),
      createProductCatalogItem({ status: 'needs_review' }),
    ];
    expect(summarizeProductCatalog(items, [createProductCatalogAsset()])).toMatchObject({
      totalProducts: 3,
      totalAssets: 1,
      approvedProducts: 1,
      betaReadyProducts: 1,
      needsReviewProducts: 1,
    });
  });
  it('exports JSON safety flags', () => {
    expect(buildProductCatalogJson([], []).safety).toMatchObject({
      localOnly: true,
      noUploads: true,
      noExternalApiCalls: true,
      noDatabase: true,
      noPayments: true,
      noCheckoutLinks: true,
      noAutoPublishing: true,
      noMarketplaceConnection: true,
      noSecretsStored: true,
      humanApprovalRequired: true,
    });
  });
  it('generates markdown', () => {
    expect(buildProductCatalogMarkdown([createProductCatalogItem({ productName: 'Alpha' })], [])).toContain('Alpha');
  });
  it('excludes secret-like keys', () => {
    expect(stripSecretLikeFields({ apiKey: 'x', nested: { token: 'y', ok: 'z' } })).toEqual({ nested: { ok: 'z' } });
  });
});
