import { describe, expect, it } from 'vitest';
import {
import { createProductCatalogAsset, createProductCatalogItem } from './productCatalog';

describe('productCatalog helpers', () => {
  it('creates different product ids when no id is supplied', () => {
    const first = createProductCatalogItem({ productName: 'Produto A' }, '2026-06-25T00:00:00.000Z');
    const second = createProductCatalogItem({ productName: 'Produto B' }, '2026-06-25T00:00:00.000Z');

    expect(first.id).not.toEqual(second.id);
import {
  PRODUCT_CATALOG_ASSET_STORAGE_KEY,
  PRODUCT_CATALOG_STORAGE_KEY,
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

  it('creates different asset ids when no id is supplied', () => {
    const first = createProductCatalogAsset({ productId: 'product-1', title: 'Asset A' }, '2026-06-25T00:00:00.000Z');
    const second = createProductCatalogAsset({ productId: 'product-1', title: 'Asset B' }, '2026-06-25T00:00:00.000Z');

    expect(first.id).not.toEqual(second.id);
  it('generates fresh asset ids when no id is provided', () => {
    const first = createProductCatalogAsset({ productId: 'prod_1', title: 'Asset A' });
    const second = createProductCatalogAsset({ productId: 'prod_1', title: 'Asset B' });

    expect(first.id).not.toBe(second.id);
    expect(first.title).toBe('Asset A');
    expect(second.title).toBe('Asset B');
  });

  it('keeps fallback names available at normalization level', () => {
    expect(createProductCatalogItem({}, '2026-06-25T00:00:00.000Z').productName).toBe('Produto local sem nome');
    expect(createProductCatalogAsset({}, '2026-06-25T00:00:00.000Z').title).toBe('Asset local sem título');
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
  buildProductCatalogExport,
  normalizeProductCatalogAsset,
  normalizeProductCatalogItem,
  PRODUCT_CATALOG_ASSET_TYPES,
  PRODUCT_CATALOG_CHANNELS,
  PRODUCT_CATALOG_STATUSES,
  serializeCatalogPreview,
  summarizeProductCatalog,
} from './productCatalog';

describe('product catalog helpers', () => {
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
      {
        productName: ' Curso | Seguro ',
        problem: 'dor',
        promise: 'resultado',
        basePrice: '99',
        tags: 'a,b' as unknown as string[],
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
      localOnly: true,
      humanApprovalRequired: true,
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
      localOnly: true,
      humanApprovalRequired: true,
    });
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
  });
  it('generates markdown', () => {
    expect(buildProductCatalogMarkdown([createProductCatalogItem({ productName: 'Alpha' })], [])).toContain('Alpha');
  });
  it('excludes secret-like keys', () => {
    expect(stripSecretLikeFields({ apiKey: 'x', nested: { token: 'y', ok: 'z' } })).toEqual({ nested: { ok: 'z' } });

  it('filters secret-like fields and values from previews', () => {
    const preview = serializeCatalogPreview({ title: 'ok', apiKey: 'abc', nested: { value: 'bearer token hidden' } });
    expect(preview).toContain('ok');
    expect(preview.toLowerCase()).not.toContain('apikey');
    expect(preview.toLowerCase()).not.toContain('bearer');
  });
});
