export const PRODUCT_CATALOG_STORAGE_KEY = 'gxeon.productCatalog.items.v1';
export const PRODUCT_CATALOG_ASSET_STORAGE_KEY = 'gxeon.productCatalog.assets.v1';

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
  title: string;
  sourceModule: string;
  summary: string;
  contentPreview: string;
  tags: string[];
  status: ProductCatalogAssetStatus;
  localOnly: boolean;
  humanApprovalRequired: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface ProductCatalogExport {
  items: ProductCatalogItem[];
  assets: ProductCatalogAsset[];
  summary: ReturnType<typeof summarizeProductCatalog>;
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

const SECRET_KEY =
  /(api[_-]?key|secret|token|password|credential|cookie|authorization|payment|card|cvv|private[_-]?key)/i;
const MAX_PREVIEW = 900;

function nowIso() {
  return new Date().toISOString();
}

export function sanitizeProductCatalogValue(value: unknown, max = 240): string {
  return typeof value === 'string'
    ? value
        .replace(/[\u0000-\u001f\u007f|`<>]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, max)
    : '';
}

function safeId(prefix: string, seed: string, now: string) {
  return `${prefix}_${generateProductCatalogSlug(seed || 'item')}_${now.replace(/[^0-9]/g, '').slice(0, 14)}`;
}

export function generateProductCatalogSlug(value: unknown): string {
  const slug = sanitizeProductCatalogValue(value, 120)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return slug || 'produto-local';
}

function oneOf<T extends readonly string[]>(list: T, value: unknown, fallback: T[number]): T[number] {
  return list.includes(value as string) ? (value as T[number]) : fallback;
}

function list(value: unknown, max = 12): string[] {
  const raw = Array.isArray(value) ? value : sanitizeProductCatalogValue(value, 500).split(',');
  return raw
    .map((v) => sanitizeProductCatalogValue(v, 80))
    .filter(Boolean)
    .slice(0, max);
}

function channels(value: unknown): ProductCatalogChannel[] {
  const safe = list(value).filter((v) =>
    (PRODUCT_CATALOG_CHANNELS as readonly string[]).includes(v),
  ) as ProductCatalogChannel[];
  return safe.length ? safe : ['internal'];
}

export function stripSecretLikeFields<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(stripSecretLikeFields) as T;
  }

  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>)
        .filter(([k]) => !SECRET_KEY.test(k))
        .map(([k, v]) => [sanitizeProductCatalogValue(k, 80), stripSecretLikeFields(v)]),
    ) as T;
  }

  return input;
}
export function createProductCatalogItem(input: Partial<ProductCatalogItem> = {}, now = nowIso()) {
  return normalizeProductCatalogItem(input, now);
}
export function normalizeProductCatalogItem(
  input: Partial<ProductCatalogItem> = {},
  now = nowIso(),
): ProductCatalogItem {
  const safe = stripSecretLikeFields(input);
  const name = sanitizeProductCatalogValue(safe.productName, 120) || 'Produto local sem nome';
  const createdAt = sanitizeProductCatalogValue(safe.createdAt) || now;

  return {
    id: sanitizeProductCatalogValue(safe.id, 120) || safeId('pc', name, createdAt),
    productName: name,
    slug: generateProductCatalogSlug(safe.slug || name),
    niche: sanitizeProductCatalogValue(safe.niche),
    audience: sanitizeProductCatalogValue(safe.audience),
    problem: sanitizeProductCatalogValue(safe.problem),
    offer: sanitizeProductCatalogValue(safe.offer),
    promise: sanitizeProductCatalogValue(safe.promise),
    basePrice: sanitizeProductCatalogValue(safe.basePrice),
    status: oneOf(PRODUCT_CATALOG_STATUSES, safe.status, 'draft'),
    tags: list(safe.tags),
    channels: channels(safe.channels),
    sourceModules: list(safe.sourceModules),
    assetIds: list(safe.assetIds),
    approvalStatus: sanitizeProductCatalogValue(safe.approvalStatus),
    betaPipelineStatus: sanitizeProductCatalogValue(safe.betaPipelineStatus),
    revenueStatus: sanitizeProductCatalogValue(safe.revenueStatus),
    riskNotes: sanitizeProductCatalogValue(safe.riskNotes, 400),
    proofNotes: sanitizeProductCatalogValue(safe.proofNotes, 400),
    nextAction: sanitizeProductCatalogValue(safe.nextAction, 240),
    createdAt,
    updatedAt: now,
  };
}
export function createProductCatalogAsset(input: Partial<ProductCatalogAsset> = {}, now = nowIso()) {
  return normalizeProductCatalogAsset(input, now);
}
export function normalizeProductCatalogAsset(
  input: Partial<ProductCatalogAsset> = {},
  now = nowIso(),
): ProductCatalogAsset {
  const safe = stripSecretLikeFields(input);
  const title = sanitizeProductCatalogValue(safe.title, 120) || 'Asset local sem título';
  const createdAt = sanitizeProductCatalogValue(safe.createdAt) || now;

  return {
    id: sanitizeProductCatalogValue(safe.id, 120) || safeId('pa', title, createdAt),
    productId: sanitizeProductCatalogValue(safe.productId, 120),
    assetType: oneOf(PRODUCT_CATALOG_ASSET_TYPES, safe.assetType, 'other'),
    title,
    sourceModule: sanitizeProductCatalogValue(safe.sourceModule, 120),
    summary: sanitizeProductCatalogValue(safe.summary, 360),
    contentPreview: sanitizeProductCatalogValue(safe.contentPreview, MAX_PREVIEW),
    tags: list(safe.tags),
    status: oneOf(['draft', 'reviewed', 'approved', 'archived'] as const, safe.status, 'draft'),
    localOnly: true,
    humanApprovalRequired: true,
    createdAt,
    updatedAt: now,
  };
}
export function summarizeProductCatalog(items: ProductCatalogItem[] = [], assets: ProductCatalogAsset[] = []) {
  return {
    totalProducts: items.length,
    totalAssets: assets.length,
    approvedProducts: items.filter((i) => i.status === 'approved').length,
    betaReadyProducts: items.filter((i) => i.status === 'beta_ready').length,
    manualDistributionReadyProducts: items.filter((i) => i.status === 'manual_distribution_ready').length,
    needsReviewProducts: items.filter((i) => i.status === 'needs_review').length,
    archivedProducts: items.filter((i) => i.status === 'archived').length,
  };
}
export function buildProductCatalogMarkdown(
  items: ProductCatalogItem[] = [],
  assets: ProductCatalogAsset[] = [],
): string {
  const s = summarizeProductCatalog(items, assets);
  return [
    '# GXEON Product Catalog (local-only)',
    `- Products: ${s.totalProducts}`,
    `- Assets: ${s.totalAssets}`,
    '- Safety: no uploads, APIs, database, payments, checkout links or publishing.',
    '',
    ...items.map(
      (i) =>
        `## ${i.productName}\n- Status: ${i.status}\n- Channels: ${i.channels.join(', ')}\n- Proof: ${i.proofNotes || 'pending'}\n- Next action: ${i.nextAction || 'pending'}`,
    ),
  ].join('\n');
}
export function buildProductCatalogJson(
  items: ProductCatalogItem[] = [],
  assets: ProductCatalogAsset[] = [],
  exportedAt = nowIso(),
): ProductCatalogExport {
  const normalizedItems = items.map((i) => normalizeProductCatalogItem(i, i.updatedAt || exportedAt));
  const normalizedAssets = assets.map((a) => normalizeProductCatalogAsset(a, a.updatedAt || exportedAt));

  return {
    items: normalizedItems,
    assets: normalizedAssets,
    summary: summarizeProductCatalog(normalizedItems, normalizedAssets),
    markdown: buildProductCatalogMarkdown(normalizedItems, normalizedAssets),
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
export function stringifyProductCatalogJson(items: ProductCatalogItem[] = [], assets: ProductCatalogAsset[] = []) {
  return JSON.stringify(buildProductCatalogJson(items, assets), null, 2);
}
