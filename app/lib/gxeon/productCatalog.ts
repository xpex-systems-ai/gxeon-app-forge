export const PRODUCT_CATALOG_STORAGE_KEY = 'gxeon.productCatalog.items.v1';
export const PRODUCT_CATALOG_ASSET_STORAGE_KEY = 'gxeon.productCatalog.assets.v1';
export const PRODUCT_CATALOG_ITEMS_STORAGE_KEY = PRODUCT_CATALOG_STORAGE_KEY;
export const PRODUCT_CATALOG_ASSETS_STORAGE_KEY = PRODUCT_CATALOG_ASSET_STORAGE_KEY;

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
export type ProductCatalogStatus = (typeof PRODUCT_CATALOG_STATUSES)[number];

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
export type ProductCatalogAssetType = (typeof PRODUCT_CATALOG_ASSET_TYPES)[number];

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
export type ProductCatalogChannel = (typeof PRODUCT_CATALOG_CHANNELS)[number];
export type ProductCatalogAssetStatus = 'draft' | 'reviewed' | 'approved' | 'archived';

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
  type?: ProductCatalogAssetType;
  channel: ProductCatalogChannel;
  title: string;
  sourceModule: string;
  summary: string;
  approvalNotes: string;
  contentPreview: string;
  tags: string[];
  status: ProductCatalogAssetStatus;
  localOnly: boolean;
  humanApprovalRequired: boolean;
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
  items: ProductCatalogItem[];
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

const SECRET_KEY_RE =
  /(secret|token|api[_-]?key|apikey|password|passwd|authorization|credential|private[_-]?key|access[_-]?key|refresh[_-]?token|webhook[_-]?(url|secret|token)|checkout[_-]?url)/i;
const SECRET_VALUE_RE =
  /(sk-[a-z0-9]{12,}|ghp_[a-z0-9_]{20,}|xox[baprs]-[a-z0-9-]{10,}|bearer\s+[^\s]+(?:\s+[^\s]+)?|https?:\/\/[^\s]+webhook[^\s]*)/i;
const CONTROL_RE = /[\u0000-\u001f\u007f|`<>]/g;
const MAX_PREVIEW = 900;

const nowIso = () => new Date().toISOString();
const createId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

export function sanitizeProductCatalogValue(value: unknown, max = 240): string {
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const cleaned = text.replace(CONTROL_RE, ' ').replace(/\s+/g, ' ').trim();

  return SECRET_VALUE_RE.test(cleaned) ? '' : cleaned.slice(0, max);
}

export function sanitizeCatalogText(value: unknown, max = 240): string {
  return sanitizeProductCatalogValue(value, max);
}

export function generateProductCatalogSlug(value: unknown): string {
  return (
    sanitizeProductCatalogValue(value, 120)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'produto-local'
  ).slice(0, 80);
}

export const safeProductCatalogSlug = generateProductCatalogSlug;

function oneOf<T extends readonly string[]>(values: T, value: unknown, fallback: T[number]): T[number] {
  return values.includes(value as string) ? (value as T[number]) : fallback;
}

function list(value: unknown, max = 12): string[] {
  const raw = Array.isArray(value) ? value : sanitizeProductCatalogValue(value, 500).split(',');
  return raw
    .map((item) => sanitizeProductCatalogValue(item, 80))
    .filter(Boolean)
    .slice(0, max);
}

function firstCatalogValue(record: Record<string, unknown>, keys: readonly string[], max = 240): string {
  for (const key of keys) {
    const value = sanitizeProductCatalogValue(record[key], max);

    if (value) {
      return value;
    }
  }

  return '';
}

function channels(value: unknown): ProductCatalogChannel[] {
  const safe = list(value).filter((item): item is ProductCatalogChannel =>
    PRODUCT_CATALOG_CHANNELS.includes(item as ProductCatalogChannel),
  );
  return safe.length ? safe : ['internal'];
}

export function stripSecretLikeFields<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(stripSecretLikeFields) as T;
  }

  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>)
        .filter(
          ([key, value]) => !SECRET_KEY_RE.test(key) && !(typeof value === 'string' && SECRET_VALUE_RE.test(value)),
        )
        .map(([key, value]) => [sanitizeProductCatalogValue(key, 80), stripSecretLikeFields(value)]),
    ) as T;
  }

  return input;
}

export const stripSecretLikeData = stripSecretLikeFields as (value: unknown) => unknown;

export function normalizeProductCatalogItem(
  input: Partial<ProductCatalogItem> = {},
  now = nowIso(),
): ProductCatalogItem {
  const safe = stripSecretLikeFields(input);
  const name = sanitizeProductCatalogValue(safe.productName, 120) || 'Produto local sem nome';
  const createdAt = sanitizeProductCatalogValue(safe.createdAt, 80) || now;

  return {
    id: sanitizeProductCatalogValue(safe.id, 80) || createId('pcp'),
    productName: name,
    slug: generateProductCatalogSlug(safe.slug || name),
    niche: sanitizeProductCatalogValue(safe.niche),
    audience: sanitizeProductCatalogValue(safe.audience),
    problem: sanitizeProductCatalogValue(safe.problem),
    offer: sanitizeProductCatalogValue(safe.offer),
    promise: sanitizeProductCatalogValue(safe.promise),
    basePrice: sanitizeProductCatalogValue(safe.basePrice, 80),
    status: oneOf(PRODUCT_CATALOG_STATUSES, safe.status, 'draft'),
    tags: list(safe.tags),
    channels: channels(safe.channels),
    sourceModules: list(safe.sourceModules),
    assetIds: list(safe.assetIds),
    approvalStatus: sanitizeProductCatalogValue(safe.approvalStatus) || 'pending_manual_review',
    betaPipelineStatus: sanitizeProductCatalogValue(safe.betaPipelineStatus) || 'not_started',
    revenueStatus: sanitizeProductCatalogValue(safe.revenueStatus) || 'not_started',
    riskNotes: sanitizeProductCatalogValue(safe.riskNotes, 500),
    proofNotes: sanitizeProductCatalogValue(safe.proofNotes, 500),
    nextAction: sanitizeProductCatalogValue(safe.nextAction) || 'manual review',
    createdAt,
    updatedAt: now,
  };
}

export function createProductCatalogItem(input: Partial<ProductCatalogItem> = {}, now = nowIso()): ProductCatalogItem {
  return normalizeProductCatalogItem(input, now);
}

export function normalizeProductCatalogAsset(
  input: Partial<ProductCatalogAsset> = {},
  now = nowIso(),
): ProductCatalogAsset {
  const safe = stripSecretLikeFields(input);
  const title = sanitizeProductCatalogValue(safe.title, 140) || 'Asset local sem título';
  const createdAt = sanitizeProductCatalogValue(safe.createdAt, 80) || now;
  const assetType = oneOf(PRODUCT_CATALOG_ASSET_TYPES, safe.assetType || safe.type, 'other');

  return {
    id: sanitizeProductCatalogValue(safe.id, 80) || createId('pca'),
    productId: sanitizeProductCatalogValue(safe.productId, 80),
    assetType,
    type: assetType,
    channel: oneOf(PRODUCT_CATALOG_CHANNELS, safe.channel, 'internal'),
    title,
    sourceModule: sanitizeProductCatalogValue(safe.sourceModule, 120),
    summary: sanitizeProductCatalogValue(safe.summary, 400),
    approvalNotes: sanitizeProductCatalogValue(safe.approvalNotes, 400),
    contentPreview: sanitizeProductCatalogValue(safe.contentPreview, MAX_PREVIEW),
    tags: list(safe.tags),
    status: oneOf(['draft', 'reviewed', 'approved', 'archived'] as const, safe.status, 'draft'),
    localOnly: true,
    humanApprovalRequired: true,
    createdAt,
    updatedAt: now,
  };
}

export function createProductCatalogAsset(
  input: Partial<ProductCatalogAsset> = {},
  now = nowIso(),
): ProductCatalogAsset {
  return normalizeProductCatalogAsset(input, now);
}

export function summarizeProductCatalog(
  products: ProductCatalogItem[] = [],
  assets: ProductCatalogAsset[] = [],
): ProductCatalogSummary {
  return {
    totalProducts: products.length,
    totalAssets: assets.length,
    approvedProducts: products.filter((product) => product.status === 'approved').length,
    betaReadyProducts: products.filter((product) => product.status === 'beta_ready').length,
    manualDistributionReadyProducts: products.filter((product) => product.status === 'manual_distribution_ready')
      .length,
    needsReviewProducts: products.filter((product) => product.status === 'needs_review').length,
    archivedProducts: products.filter((product) => product.status === 'archived').length,
  };
}

export function buildProductCatalogMarkdown(
  products: ProductCatalogItem[] = [],
  assets: ProductCatalogAsset[] = [],
): string {
  const summary = summarizeProductCatalog(products, assets);
  return [
    '# Product Catalog Export',
    `Produtos: ${summary.totalProducts}`,
    `Assets: ${summary.totalAssets}`,
    '- Safety: local-only, manual-first, no uploads, APIs, database, payments, checkout links, webhooks or auto-publishing.',
    '',
    ...products.map((product) => `- ${product.productName} (${product.status}) — próximo: ${product.nextAction}`),
    ...assets.map((asset) => `- Asset: ${asset.title} [${asset.assetType}]`),
  ].join('\n');
}

export function buildProductCatalogExport(
  products: ProductCatalogItem[] = [],
  assets: ProductCatalogAsset[] = [],
  exportedAt = nowIso(),
): ProductCatalogExport {
  const normalizedProducts = products.map((product) =>
    normalizeProductCatalogItem(product, product.updatedAt || exportedAt),
  );
  const normalizedAssets = assets.map((asset) => normalizeProductCatalogAsset(asset, asset.updatedAt || exportedAt));

  return {
    products: normalizedProducts,
    items: normalizedProducts,
    assets: normalizedAssets,
    summary: summarizeProductCatalog(normalizedProducts, normalizedAssets),
    markdown: buildProductCatalogMarkdown(normalizedProducts, normalizedAssets),
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
    exportedAt,
  };
}

export const buildProductCatalogJson = buildProductCatalogExport;

export function stringifyProductCatalogJson(
  products: ProductCatalogItem[] = [],
  assets: ProductCatalogAsset[] = [],
): string {
  return JSON.stringify(buildProductCatalogExport(products, assets), null, 2);
}

export function serializeCatalogPreview(value: unknown): string {
  return sanitizeProductCatalogValue(JSON.stringify(stripSecretLikeFields(value), null, 2), MAX_PREVIEW);
}

export function buildProductCatalogLocalImportDraft(raw: Record<string, unknown>, now = nowIso()) {
  const safe = stripSecretLikeFields(raw);
  const productName = firstCatalogValue(
    safe,
    ['productName', 'productTitle', 'sourceProductIdea', 'idea', 'name', 'title', 'offerName'],
    120,
  );
  const product = createProductCatalogItem(
    {
      productName,
      niche: firstCatalogValue(safe, ['niche', 'sourceNiche', 'category'], 240),
      audience: firstCatalogValue(safe, ['audience', 'targetAudience', 'sourceAudience', 'avatar'], 240),
      problem: firstCatalogValue(safe, ['problem', 'painPoint', 'sourceProblem'], 240),
      offer: firstCatalogValue(safe, ['offer', 'sourceOffer', 'offerName'], 240),
      promise: firstCatalogValue(safe, ['promise', 'outcome', 'transformation'], 240),
      basePrice: firstCatalogValue(safe, ['basePrice', 'desiredPrice', 'price', 'suggestedPrice'], 80),
      status: 'draft',
      tags: list(safe.tags),
      sourceModules: ['ProductCatalogLocalImport'],
      approvalStatus: 'pending_manual_review',
      betaPipelineStatus: 'not_started',
      revenueStatus: 'not_started',
      nextAction: 'manual review',
    },
    now,
  );
  const asset = createProductCatalogAsset(
    {
      productId: product.id,
      assetType: 'product_blueprint',
      channel: 'internal',
      title: `${product.productName} — import local`,
      sourceModule: 'ProductCatalogLocalImport',
      summary: 'Import local manual-first; nenhuma ação externa executada.',
      approvalNotes: 'Revisão humana obrigatória antes de qualquer uso externo.',
      contentPreview: serializeCatalogPreview(raw),
      tags: list(safe.tags),
      status: 'draft',
    },
    now,
  );

  return { product, asset };
}
