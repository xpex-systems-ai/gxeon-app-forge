export const PRODUCT_CATALOG_ITEMS_STORAGE_KEY = 'gxeon.productCatalog.items.v1';
export const PRODUCT_CATALOG_ASSETS_STORAGE_KEY = 'gxeon.productCatalog.assets.v1';

export const PRODUCT_CATALOG_STATUSES = [
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
] as const;
export const PRODUCT_CATALOG_ASSET_TYPES = [
  'product_blueprint',
  'marketplace_pack',
  'checkout_blueprint',
  'landing_blueprint',
  'content_pack',
  'integration_dry_run',
  'approval_record',
  'beta_pipeline_record',
  'revenue_record',
  'prompt',
  'markdown',
  'json',
  'image_prompt',
  'video_prompt',
  'audio_prompt',
  'other',
] as const;
export const PRODUCT_CATALOG_CHANNELS = [
  'internal',
  'manual_whatsapp',
  'manual_email',
  'manual_instagram',
  'manual_linkedin',
  'manual_youtube',
  'manual_marketplace',
  'manual_landing',
  'hotmart_future',
  'kiwify_future',
  'clickbank_future',
  'gumroad_future',
  'shopify_future',
  'generic_future',
] as const;

export type ProductCatalogStatus = (typeof PRODUCT_CATALOG_STATUSES)[number];
export type ProductCatalogAssetType = (typeof PRODUCT_CATALOG_ASSET_TYPES)[number];
export type ProductCatalogChannel = (typeof PRODUCT_CATALOG_CHANNELS)[number];

export interface ProductCatalogItem {
  id: string;
  productName: string;
  slug: string;
  niche: string;
  audience: string;
  problem: string;
  offer: string;
  promise: string;
  basePrice: string;
  status: ProductCatalogStatus;
  tags: string[];
  channels: ProductCatalogChannel[];
  sourceModules: string[];
  assetIds: string[];
  approvalStatus: string;
  betaPipelineStatus: string;
  revenueStatus: string;
  riskNotes: string;
  proofNotes: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
}
export interface ProductCatalogAsset {
  id: string;
  productId: string;
  assetType: ProductCatalogAssetType;
  title: string;
  sourceModule: string;
  summary: string;
  contentPreview: string;
  tags: string[];
  status: ProductCatalogStatus;
  localOnly: true;
  humanApprovalRequired: true;
  createdAt: string;
  updatedAt: string;
}
export interface ProductCatalogSummary {
  totalProducts: number;
  totalAssets: number;
  approvedProducts: number;
  betaReadyProducts: number;
  manualDistributionReadyProducts: number;
  needsReviewProducts: number;
  archivedProducts: number;
}
export interface ProductCatalogExport {
  products: ProductCatalogItem[];
  assets: ProductCatalogAsset[];
  summary: ProductCatalogSummary;
  markdown: string;
  safety: {
    localOnly: true;
    noUploads: true;
    noExternalApiCalls: true;
    noDatabase: true;
    noPayments: true;
    noCheckoutLinks: true;
    noAutoPublishing: true;
    noMarketplaceConnection: true;
    noSecretsStored: true;
    humanApprovalRequired: true;
  };
  exportedAt: string;
}

const SECRET_RE =
  /(secret|token|api[_-]?key|password|passwd|authorization|bearer|credential|private[_-]?key|access[_-]?key|refresh[_-]?token)/i;
const CONTROL_RE = /[\u0000-\u001f\u007f]/g;
const MAX_PREVIEW = 1200;
const nowIso = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

export function sanitizeCatalogText(value: unknown, max = 240): string {
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const cleaned = text.replace(CONTROL_RE, ' ').replace(/[|;]/g, ',').replace(/\s+/g, ' ').trim();

  return SECRET_RE.test(cleaned) ? '' : cleaned.slice(0, max);
}

export function stripSecretLikeData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripSecretLikeData).filter((item) => item !== '' && item !== undefined);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([k, v]) => !SECRET_RE.test(k) && !SECRET_RE.test(String(v)))
        .map(([k, v]) => [k, stripSecretLikeData(v)]),
    );
  }

  return typeof value === 'string' && SECRET_RE.test(value) ? '' : value;
}

export function safeProductCatalogSlug(value: unknown): string {
  return (
    sanitizeCatalogText(value, 120)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'produto-catalogo'
  ).slice(0, 80);
}

const list = (v: unknown) =>
  (Array.isArray(v) ? v : String(v ?? '').split(',')).map((x) => sanitizeCatalogText(x, 80)).filter(Boolean);
const status = (v: unknown): ProductCatalogStatus =>
  PRODUCT_CATALOG_STATUSES.includes(v as ProductCatalogStatus) ? (v as ProductCatalogStatus) : 'draft';
const assetType = (v: unknown): ProductCatalogAssetType =>
  PRODUCT_CATALOG_ASSET_TYPES.includes(v as ProductCatalogAssetType) ? (v as ProductCatalogAssetType) : 'other';
const channels = (v: unknown): ProductCatalogChannel[] =>
  list(v).filter((x): x is ProductCatalogChannel => PRODUCT_CATALOG_CHANNELS.includes(x as ProductCatalogChannel));

export function normalizeProductCatalogItem(input: Partial<ProductCatalogItem>, now = nowIso()): ProductCatalogItem {
  const name = sanitizeCatalogText(input.productName, 120) || 'Produto sem nome';
  return {
    id: sanitizeCatalogText(input.id, 80) || id('pcp'),
    productName: name,
    slug: safeProductCatalogSlug(input.slug || name),
    niche: sanitizeCatalogText(input.niche),
    audience: sanitizeCatalogText(input.audience),
    problem: sanitizeCatalogText(input.problem),
    offer: sanitizeCatalogText(input.offer),
    promise: sanitizeCatalogText(input.promise),
    basePrice: sanitizeCatalogText(input.basePrice, 80),
    status: status(input.status),
    tags: list(input.tags),
    channels: channels(input.channels),
    sourceModules: list(input.sourceModules),
    assetIds: list(input.assetIds),
    approvalStatus: sanitizeCatalogText(input.approvalStatus) || 'pending_manual_review',
    betaPipelineStatus: sanitizeCatalogText(input.betaPipelineStatus) || 'not_started',
    revenueStatus: sanitizeCatalogText(input.revenueStatus) || 'not_started',
    riskNotes: sanitizeCatalogText(input.riskNotes, 500),
    proofNotes: sanitizeCatalogText(input.proofNotes, 500),
    nextAction: sanitizeCatalogText(input.nextAction) || 'manual review',
    createdAt: sanitizeCatalogText(input.createdAt, 80) || now,
    updatedAt: now,
  };
}
export function normalizeProductCatalogAsset(input: Partial<ProductCatalogAsset>, now = nowIso()): ProductCatalogAsset {
  return {
    id: sanitizeCatalogText(input.id, 80) || id('pca'),
    productId: sanitizeCatalogText(input.productId, 80),
    assetType: assetType(input.assetType),
    title: sanitizeCatalogText(input.title, 140) || 'Asset sem título',
    sourceModule: sanitizeCatalogText(input.sourceModule, 120),
    summary: sanitizeCatalogText(input.summary, 400),
    contentPreview: sanitizeCatalogText(input.contentPreview, MAX_PREVIEW),
    tags: list(input.tags),
    status: status(input.status),
    localOnly: true,
    humanApprovalRequired: true,
    createdAt: sanitizeCatalogText(input.createdAt, 80) || now,
    updatedAt: now,
  };
}
export function summarizeProductCatalog(
  products: ProductCatalogItem[],
  assets: ProductCatalogAsset[],
): ProductCatalogSummary {
  return {
    totalProducts: products.length,
    totalAssets: assets.length,
    approvedProducts: products.filter((p) => p.status === 'approved').length,
    betaReadyProducts: products.filter((p) => p.status === 'beta_ready').length,
    manualDistributionReadyProducts: products.filter((p) => p.status === 'manual_distribution_ready').length,
    needsReviewProducts: products.filter((p) => p.status === 'needs_review').length,
    archivedProducts: products.filter((p) => p.status === 'archived').length,
  };
}
export function buildProductCatalogMarkdown(products: ProductCatalogItem[], assets: ProductCatalogAsset[]): string {
  const s = summarizeProductCatalog(products, assets);
  return [
    `# Product Catalog Export`,
    `Produtos: ${s.totalProducts}`,
    `Assets: ${s.totalAssets}`,
    ...products.map((p) => `- ${p.productName} (${p.status}) — próximo: ${p.nextAction}`),
  ].join('\n');
}
export function buildProductCatalogExport(
  products: ProductCatalogItem[],
  assets: ProductCatalogAsset[],
  now = nowIso(),
): ProductCatalogExport {
  return {
    products,
    assets,
    summary: summarizeProductCatalog(products, assets),
    markdown: buildProductCatalogMarkdown(products, assets),
    safety: {
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
    },
    exportedAt: now,
  };
}
export function serializeCatalogPreview(value: unknown): string {
  return sanitizeCatalogText(JSON.stringify(stripSecretLikeData(value), null, 2), MAX_PREVIEW);
}
