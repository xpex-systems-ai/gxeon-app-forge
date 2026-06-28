import { describe, expect, it } from 'vitest';
import {
  PRODUCT_CATALOG_ASSET_STORAGE_KEY,
  PRODUCT_CATALOG_ASSET_TYPES,
  PRODUCT_CATALOG_CHANNELS,
  PRODUCT_CATALOG_STATUSES,
  PRODUCT_CATALOG_STORAGE_KEY,
  buildProductCatalogExport,
  buildProductCatalogLocalImportDraft,
  buildProductCatalogJson,
  buildProductCatalogMarkdown,
  createProductCatalogAsset,
  createProductCatalogItem,
  generateProductCatalogSlug,
  normalizeProductCatalogAsset,
  normalizeProductCatalogItem,
  serializeCatalogPreview,
  stripSecretLikeFields,
  summarizeProductCatalog,
} from './productCatalog';

describe('product catalog helpers', () => {
  it('keeps expected localStorage keys', () => {
    expect(PRODUCT_CATALOG_STORAGE_KEY).toBe('gxeon.productCatalog.items.v1');
    expect(PRODUCT_CATALOG_ASSET_STORAGE_KEY).toBe('gxeon.productCatalog.assets.v1');
  });

  it('restores full APPFORGE-013 enums', () => {
    expect(PRODUCT_CATALOG_STATUSES).toEqual([
      'idea',
      'draft',
      'packaged',
      'landing_ready',
      'content_ready',
      'integration_dry_run_ready',
      'needs_review',
      'approved',
      'beta_ready',
      'manual_distribution_ready',
      'paused',
      'archived',
    ]);
    expect(PRODUCT_CATALOG_ASSET_TYPES).toContain('integration_dry_run');
    expect(PRODUCT_CATALOG_ASSET_TYPES).toContain('revenue_record');
    expect(PRODUCT_CATALOG_CHANNELS).toContain('manual_whatsapp');
    expect(PRODUCT_CATALOG_CHANNELS).toContain('shopify_future');
  });

  it('normalizes full item and asset schema with fresh ids', () => {
    const product = normalizeProductCatalogItem(
      { productName: ' Curso | Seguro ', tags: 'a,b' as unknown as string[], sourceModules: ['ProductBuilderMVP'] },
      '2026-01-01T00:00:00.000Z',
    );
    const asset = normalizeProductCatalogAsset({ productId: product.id, assetType: 'content_pack', title: 'Asset' });
    expect(product.id).toMatch(/^pcp_/);
    expect(asset.id).toMatch(/^pca_/);
    expect(product.slug).toBe('curso-seguro');
    expect(product.tags).toEqual(['a', 'b']);
    expect(asset).toMatchObject({ assetType: 'content_pack', localOnly: true, humanApprovalRequired: true });
  });

  it('generates fresh ids when no id is provided', () => {
    expect(createProductCatalogItem({ productName: 'A' }).id).not.toBe(
      createProductCatalogItem({ productName: 'B' }).id,
    );
    expect(createProductCatalogAsset({ title: 'A' }).id).not.toBe(createProductCatalogAsset({ title: 'B' }).id);
  });

  it('keeps fallback names available at normalization level', () => {
    expect(createProductCatalogItem({}, '2026-06-25T00:00:00.000Z').productName).toBe('Produto local sem nome');
    expect(createProductCatalogAsset({}, '2026-06-25T00:00:00.000Z').title).toBe('Asset local sem título');
  });

  it('counts summary statuses and exports safety flags', () => {
    const products = ['approved', 'beta_ready', 'manual_distribution_ready', 'needs_review', 'archived'].map((status) =>
      normalizeProductCatalogItem({ productName: status, status: status as never }),
    );
    const assets = [normalizeProductCatalogAsset({ productId: products[0].id, title: 'A' })];
    expect(summarizeProductCatalog(products, assets)).toMatchObject({
      totalProducts: 5,
      totalAssets: 1,
      approvedProducts: 1,
      betaReadyProducts: 1,
      manualDistributionReadyProducts: 1,
      needsReviewProducts: 1,
      archivedProducts: 1,
    });
    expect(buildProductCatalogExport(products, assets).safety).toEqual({
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
    expect(buildProductCatalogJson(products, assets).items).toHaveLength(5);
  });

  it('generates markdown and safe slugs', () => {
    expect(generateProductCatalogSlug('  Café Produto!!!  ')).toBe('cafe-produto');
    expect(buildProductCatalogMarkdown([createProductCatalogItem({ productName: 'Alpha' })], [])).toContain('Alpha');
  });

  it('excludes secret-like keys and values from records and previews', () => {
    expect(stripSecretLikeFields({ apiKey: 'x', nested: { token: 'y', ok: 'z' } })).toEqual({ nested: { ok: 'z' } });

    const preview = serializeCatalogPreview({
      title: 'ok',
      apiKey: 'abc',
      password: 'hidden',
      authorization: `Bearer ${'sk'}-${'123456789abc'}`,
      cookie: 'session=secret',
      nested: { token: `${'ghp'}_${'abcdefghijklmnopqrstuvwxyz'}`, private_key: 'pem', value: 'safe' },
    });
    expect(preview).toContain('ok');
    expect(preview).toContain('safe');
    expect(preview.length).toBeLessThanOrEqual(900);
    expect(preview.toLowerCase()).not.toContain('apikey');
    expect(preview.toLowerCase()).not.toContain('password');
    expect(preview.toLowerCase()).not.toContain('authorization');
    expect(preview.toLowerCase()).not.toContain('private_key');
    expect(preview.toLowerCase()).not.toContain('bearer');
    expect(preview.toLowerCase()).not.toContain('ghp_');
  });

  it('builds local import drafts from Product Builder idea fields with sanitized previews', () => {
    const imported = buildProductCatalogLocalImportDraft(
      { idea: 'Curso IA para corretores', niche: 'Imóveis', apiKey: `${'sk'}-${'123456789abc'}` },
      'ProductBuilderMVP',
    );

    expect(imported).not.toBeNull();
    expect(imported!.product.productName).toBe('Curso IA para corretores');
    expect(imported!.product.niche).toBe('Imóveis');

    const productBuilderPreview = String(imported!.asset.contentPreview);
    expect(productBuilderPreview).toContain('Curso IA para corretores');
    expect(productBuilderPreview.toLowerCase()).not.toContain('apikey');
    expect(productBuilderPreview.toLowerCase()).not.toContain('sk-');
  });

  it('builds local import drafts from sourceProductIdea module fields', () => {
    const imported = buildProductCatalogLocalImportDraft(
      {
        sourceProductIdea: 'Kit de landing pages',
        sourceAudience: 'Founders',
        token: `${'ghp'}_${'abcdefghijklmnopqrstuvwxyz'}`,
      },
      'LandingBuilderMVP',
    );

    expect(imported).not.toBeNull();
    expect(imported!.product.productName).toBe('Kit de landing pages');
    expect(imported!.product.audience).toBe('Founders');
    expect(imported!.asset.title).toBe('Kit de landing pages');

    const sourceProductIdeaPreview = String(imported!.asset.contentPreview);
    expect(sourceProductIdeaPreview.toLowerCase()).not.toContain('token');
    expect(sourceProductIdeaPreview.toLowerCase()).not.toContain('ghp_');
  });
});
