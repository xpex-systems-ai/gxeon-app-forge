import { describe, expect, it } from 'vitest';
import {
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

  it('filters secret-like fields and values from previews', () => {
    const preview = serializeCatalogPreview({ title: 'ok', apiKey: 'abc', nested: { value: 'bearer token hidden' } });
    expect(preview).toContain('ok');
    expect(preview.toLowerCase()).not.toContain('apikey');
    expect(preview.toLowerCase()).not.toContain('bearer');
  });
});
