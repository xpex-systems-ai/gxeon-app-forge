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
  localOnly: true;
  humanApprovalRequired: true;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCatalogAsset {
  id: string;
  productId: string;
  assetType: ProductCatalogAssetType;
  type: ProductCatalogAssetType;
  title: string;
  sourceModule: string;
  channel: ProductCatalogChannel;
  summary: string;
  contentPreview: string;
  tags: string[];
  status: ProductCatalogAssetStatus;
  approvalNotes: string;
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
    noLivePayments: true;
    noCheckoutLinks: true;
    noWebhookExecution: true;
    noAutoPublishing: true;
    noMarketplaceConnection: true;
    noSecretsStored: true;
    humanApprovalRequired: true;
  };
}

type ProductCatalogItemDraft = Partial<Omit<ProductCatalogItem, 'localOnly' | 'humanApprovalRequired'>> & {
  price?: unknown;
  apiKey?: unknown;
  notes?: unknown;
};
type ProductCatalogAssetDraft = Partial<Omit<ProductCatalogAsset, 'localOnly' | 'humanApprovalRequired'>> & {
  apiKey?: unknown;
  notes?: unknown;
};

const SECRET_KEY_PATTERNS = ['token', 'secret', 'password', 'apiKey', 'apikey', 'authorization', 'checkoutUrl'];
const SECRET_VALUE_PATTERNS = [
  /s[k]-[a-z0-9_-]{12,}/i,
  /bearer\s+[a-z0-9._-]+/i,
  /github[_]pat_/i,
  /g[h]p_[a-z0-9_]+/i,
];

function createLocalId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

function cleanText(value: unknown, fallback = '') {
  const text = typeof value === 'string' ? value : '';
  const cleaned = text
    .replace(/[|<>]/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return fallback;
  }

  return SECRET_VALUE_PATTERNS.some((pattern) => pattern.test(cleaned)) ? '[filtered]' : cleaned;
}

function cleanLongText(value: unknown, fallback = '', maxLength = 900) {
  return cleanText(value, fallback).slice(0, maxLength);
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => cleanText(item))
      .filter(Boolean);
  }

  return [];
}

function asStatus(value: unknown): ProductCatalogStatus {
  return PRODUCT_CATALOG_STATUSES.includes(value as ProductCatalogStatus) ? (value as ProductCatalogStatus) : 'draft';
}

function asAssetType(value: unknown): ProductCatalogAssetType {
  if (value === 'landing') {
    return 'landing_blueprint';
  }

  if (value === 'marketplace') {
    return 'marketplace_pack';
  }

  if (value === 'checkout') {
    return 'checkout_blueprint';
  }

  if (value === 'content') {
    return 'content_pack';
  }

  if (value === 'integration') {
    return 'integration_dry_run';
  }

  return PRODUCT_CATALOG_ASSET_TYPES.includes(value as ProductCatalogAssetType)
    ? (value as ProductCatalogAssetType)
    : 'other';
}

function asChannel(value: unknown): ProductCatalogChannel {
  if (value === 'manual') {
    return 'internal';
  }

  if (value === 'email') {
    return 'manual_email';
  }

  if (value === 'whatsapp') {
    return 'manual_whatsapp';
  }

  return PRODUCT_CATALOG_CHANNELS.includes(value as ProductCatalogChannel)
    ? (value as ProductCatalogChannel)
    : 'internal';
}

function asChannels(value: unknown): ProductCatalogChannel[] {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  const channels = values.map((item) => asChannel(item)).filter(Boolean);

  return channels.length ? Array.from(new Set(channels)) : ['internal'];
}

export function generateProductCatalogSlug(value: string) {
  return (
    cleanText(value, 'produto-local')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'produto-local'
  );
}

export function stripSecretLikeFields<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => stripSecretLikeFields(item)) as T;
  }

  if (!input || typeof input !== 'object') {
    return typeof input === 'string' && SECRET_VALUE_PATTERNS.some((pattern) => pattern.test(input))
      ? ('[filtered]' as T)
      : input;
  }

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>)
      .filter(([key]) => !SECRET_KEY_PATTERNS.some((pattern) => key.toLowerCase().includes(pattern.toLowerCase())))
      .map(([key, value]) => [key, stripSecretLikeFields(value)]),
  ) as T;
}

export function normalizeProductCatalogItem(
  input: ProductCatalogItemDraft = {},
  now = new Date().toISOString(),
): ProductCatalogItem {
  const safe = stripSecretLikeFields(input) as ProductCatalogItemDraft;
  const productName = cleanText(safe.productName, 'Produto local sem nome');

  return {
    id: cleanText(safe.id, '') || createLocalId('pcp'),
    productName,
    slug: cleanText(safe.slug, '') || generateProductCatalogSlug(productName),
    niche: cleanText(safe.niche),
    audience: cleanText(safe.audience),
    problem: cleanLongText(safe.problem),
    offer: cleanLongText(safe.offer),
    promise: cleanLongText(safe.promise),
    basePrice: cleanText(safe.basePrice ?? safe.price),
    status: asStatus(safe.status),
    tags: asStringList(safe.tags),
    channels: asChannels(safe.channels),
    sourceModules: asStringList(safe.sourceModules),
    assetIds: asStringList(safe.assetIds),
    approvalStatus: cleanText(safe.approvalStatus, 'pending_manual_review'),
    betaPipelineStatus: cleanText(safe.betaPipelineStatus, 'not_started'),
    revenueStatus: cleanText(safe.revenueStatus, 'not_tracked'),
    riskNotes: cleanLongText(safe.riskNotes),
    proofNotes: cleanLongText(safe.proofNotes),
    nextAction: cleanText(safe.nextAction, 'manual_review'),
    localOnly: true,
    humanApprovalRequired: true,
    createdAt: cleanText(safe.createdAt, now),
    updatedAt: cleanText(safe.updatedAt, now),
  };
}

export function createProductCatalogItem(input: ProductCatalogItemDraft = {}, now = new Date().toISOString()) {
  return normalizeProductCatalogItem(input, now);
}

export function normalizeProductCatalogAsset(
  input: ProductCatalogAssetDraft = {},
  now = new Date().toISOString(),
): ProductCatalogAsset {
  const safe = stripSecretLikeFields(input) as ProductCatalogAssetDraft;
  const assetType = asAssetType(safe.assetType ?? safe.type);

  return {
    id: cleanText(safe.id, '') || createLocalId('pca'),
    productId: cleanText(safe.productId),
    assetType,
    type: assetType,
    title: cleanText(safe.title, 'Asset local sem título'),
    sourceModule: cleanText(safe.sourceModule, 'manual'),
    channel: asChannel(safe.channel),
    summary: cleanLongText(safe.summary),
    contentPreview: cleanLongText(safe.contentPreview),
    tags: asStringList(safe.tags),
    status:
      safe.status === 'reviewed' || safe.status === 'approved' || safe.status === 'archived' ? safe.status : 'draft',
    approvalNotes: cleanLongText(safe.approvalNotes),
    localOnly: true,
    humanApprovalRequired: true,
    createdAt: cleanText(safe.createdAt, now),
    updatedAt: cleanText(safe.updatedAt, now),
  };
}

export function createProductCatalogAsset(input: ProductCatalogAssetDraft = {}, now = new Date().toISOString()) {
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

export function buildProductCatalogMarkdown(products: ProductCatalogItem[] = [], assets: ProductCatalogAsset[] = []) {
  const lines = ['# GXEON Product Catalog — Local Export', '', '## Products'];

  for (const product of products) {
    lines.push(
      `- ${product.productName} (${product.status})`,
      `  - Slug: ${product.slug}`,
      `  - Offer: ${product.offer || 'manual review required'}`,
      `  - Channels: ${product.channels.join(', ')}`,
      `  - Next action: ${product.nextAction}`,
    );
  }

  lines.push('', '## Assets');

  for (const asset of assets) {
    lines.push(`- ${asset.title} (${asset.assetType})`, `  - Product: ${asset.productId || 'unassigned'}`);
  }

  lines.push('', '## Safety', '- localOnly: true', '- noUploads: true', '- noPayments: true');

  return lines.join('\n');
}

export function buildProductCatalogExport(
  products: ProductCatalogItem[] = [],
  assets: ProductCatalogAsset[] = [],
): ProductCatalogExport {
  return {
    products,
    items: products,
    assets,
    summary: summarizeProductCatalog(products, assets),
    markdown: buildProductCatalogMarkdown(products, assets),
    safety: {
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
    },
  };
}

export function buildProductCatalogJson(products: ProductCatalogItem[] = [], assets: ProductCatalogAsset[] = []) {
  return buildProductCatalogExport(products, assets);
}

export function stringifyProductCatalogJson(products: ProductCatalogItem[] = [], assets: ProductCatalogAsset[] = []) {
  return JSON.stringify(buildProductCatalogExport(products, assets), null, 2);
}

export function serializeCatalogPreview(input: unknown) {
  return JSON.stringify(stripSecretLikeFields(input), null, 2).slice(0, 900);
}
