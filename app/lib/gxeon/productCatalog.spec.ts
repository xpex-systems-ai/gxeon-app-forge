import { describe, expect, it } from 'vitest';
import {
  PRODUCT_CATALOG_ASSET_STORAGE_KEY,
  PRODUCT_CATALOG_ASSET_TYPES,
  PRODUCT_CATALOG_CHANNELS,
  PRODUCT_CATALOG_STATUSES,
  PRODUCT_CATALOG_STORAGE_KEY,
  buildProductCatalogExport,
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

  it('normalizes items and sanitizes delimiters/control characters', () => {
    const item = normalizeProductCatalogItem(
      { productName: '  Meu|Produto\n<script> ', channels: ['manual_email'], tags: 'a,b' as never },
      '2026-01-01T00:00:00.000Z',
    );

    expect(item.productName).toBe('Meu Produto script');
    expect(item.channels).toEqual(['manual_email']);
    expect(item.tags).toEqual(['a', 'b']);
    expect(item.localOnly).toBe(true);
    expect(item.humanApprovalRequired).toBe(true);
  });

  it('normalizes full item and asset schema with fresh ids', () => {
    const product = normalizeProductCatalogItem(
      {
        productName: ' Curso | Seguro ',
        problem: 'dor',
        promise: 'resultado',
        basePrice: '99',
        tags: 'a,b' as never,
        sourceModules: ['ProductBuilderMVP'],
        approvalStatus: 'pending',
        betaPipelineStatus: 'beta',
        revenueStatus: 'ledger',
        riskNotes: 'risco',
        proofNotes: 'prova',
        nextAction: 'manual review',
      },
      '2026-01-01T00:00:00.000Z',
    );
    const asset = normalizeProductCatalogAsset({
      productId: product.id,
      assetType: 'content_pack',
      sourceModule: 'ContentFactoryMVP',
      title: 'Asset',
      contentPreview: 'preview',
    });

    expect(product.id).toMatch(/^pcp_/);
    expect(asset.id).toMatch(/^pca_/);
    expect(product.slug).toBe('curso-seguro');
    expect(product).toMatchObject({
      problem: 'dor',
      promise: 'resultado',
      basePrice: '99',
      approvalStatus: 'pending',
      betaPipelineStatus: 'beta',
      revenueStatus: 'ledger',
      riskNotes: 'risco',
      proofNotes: 'prova',
      nextAction: 'manual review',
    });
    expect(asset).toMatchObject({
      assetType: 'content_pack',
      sourceModule: 'ContentFactoryMVP',
      contentPreview: 'preview',
    });
  });

  it('generates fresh ids and fallback names', () => {
    const first = createProductCatalogItem({ productName: 'Produto A' }, '2026-06-25T00:00:00.000Z');
    const second = createProductCatalogItem({ productName: 'Produto B' }, '2026-06-25T00:00:00.000Z');
    const firstAsset = createProductCatalogAsset({ productId: 'prod_1', title: 'Asset A' });
    const secondAsset = createProductCatalogAsset({ productId: 'prod_1', title: 'Asset B' });

    expect(first.id).not.toEqual(second.id);
    expect(firstAsset.id).not.toEqual(secondAsset.id);
    expect(createProductCatalogItem({}, '2026-06-25T00:00:00.000Z').productName).toBe('Produto local sem nome');
    expect(createProductCatalogAsset({}, '2026-06-25T00:00:00.000Z').title).toBe('Asset local sem título');
  });

  it('generates safe slugs', () => {
    expect(generateProductCatalogSlug('  Café Produto!!!  ')).toBe('cafe-produto');
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
      noLivePayments: true,
      noCheckoutLinks: true,
      noWebhookExecution: true,
      noAutoPublishing: true,
      noMarketplaceConnection: true,
      noSecretsStored: true,
      humanApprovalRequired: true,
    });
  });

  it('builds markdown and JSON safety export without external actions', () => {
    const item = createProductCatalogItem({ productName: 'Catálogo Seguro', offer: 'Oferta manual' });
    const asset = createProductCatalogAsset({ productId: item.id, title: 'Landing manual', type: 'landing_blueprint' });
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

  it('filters secret-like fields and values from objects and previews', () => {
    const item = createProductCatalogItem({
      productName: `Produto ${'s' + 'k-' + 'abcdefghijklmnop'}`,
      notes: 'ok',
      apiKey: 'hidden',
    });
    const stripped = stripSecretLikeFields({ apiKey: 'x', nested: { password: 'y', ok: 'z' } });
    const preview = serializeCatalogPreview({ title: 'ok', apiKey: 'abc', nested: { value: 'bearer hidden' } });

    expect(JSON.stringify(item)).not.toContain('apiKey');
    expect(item.productName).toBe('[filtered]');
    expect(stripped).toEqual({ nested: { ok: 'z' } });
    expect(preview).toContain('ok');
    expect(preview.toLowerCase()).not.toContain('apikey');
    expect(preview.toLowerCase()).not.toContain('bearer');
  });
});
