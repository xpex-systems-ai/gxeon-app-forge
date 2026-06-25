export const PRODUCT_CATALOG_STORAGE_KEY = 'gxeon.productCatalog.items.v1';
export const PRODUCT_CATALOG_ASSET_STORAGE_KEY = 'gxeon.productCatalog.assets.v1';

export interface ProductCatalogItem {
  id: string;
  productName: string;
  status: string;
export const PRODUCT_CATALOG_STORAGE_KEY = 'gxeon.productCatalog.items.v1';
export const PRODUCT_CATALOG_ASSET_STORAGE_KEY = 'gxeon.productCatalog.assets.v1';

export const PRODUCT_CATALOG_STATUSES = ['draft', 'ready', 'approved', 'archived'] as const;
export const PRODUCT_CATALOG_ASSET_TYPES = [
  'landing',
  'marketplace',
  'checkout',
  'content',
  'integration',
  'other',
] as const;
export const PRODUCT_CATALOG_CHANNELS = [
  'manual',
  'landing_page',
  'marketplace',
  'email',
  'social',
  'whatsapp',
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

export type ProductCatalogStatus = (typeof PRODUCT_CATALOG_STATUSES)[number];
export type ProductCatalogAssetType = (typeof PRODUCT_CATALOG_ASSET_TYPES)[number];
export type ProductCatalogChannel = (typeof PRODUCT_CATALOG_CHANNELS)[number];

export interface ProductCatalogItem {
  id: string;
  productName: string;
  niche: string;
  audience: string;
  offer: string;
  price: string;
  status: ProductCatalogStatus;
  channels: ProductCatalogChannel[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCatalogAsset {
  id: string;
  productId: string;
  title: string;
  type: ProductCatalogAssetType;
  channel: ProductCatalogChannel;
  summary: string;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCatalogAsset {
  id: string;
  productId: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

type ProductCatalogItemDraft = Partial<Omit<ProductCatalogItem, 'id' | 'createdAt' | 'updatedAt'>> &
  Partial<Pick<ProductCatalogItem, 'id' | 'createdAt' | 'updatedAt'>>;
type ProductCatalogAssetDraft = Partial<Omit<ProductCatalogAsset, 'id' | 'createdAt' | 'updatedAt'>> &
  Partial<Pick<ProductCatalogAsset, 'id' | 'createdAt' | 'updatedAt'>>;

function createLocalId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function createProductCatalogItem(
  input: ProductCatalogItemDraft = {},
  now = new Date().toISOString(),
): ProductCatalogItem {
  return {
    id: input.id || createLocalId('product'),
    productName: input.productName?.trim() || 'Produto local sem nome',
    status: input.status?.trim() || 'draft',
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
export interface ProductCatalogExport {
  items: ProductCatalogItem[];
  assets: ProductCatalogAsset[];
  markdown: string;
  safety: {
    manualFirst: true;
    localOnly: true;
    noUploads: true;
    noLivePayments: true;
    noCheckoutLinks: true;
    noWebhookExecution: true;
    noAutoPublishing: true;
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

const SECRET_KEY =
  /(api[_-]?key|secret|token|password|credential|cookie|authorization|payment|card|cvv|private[_-]?key)/i;
const MAX_PREVIEW = 900;
const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';
const SECRET_FIELD_PATTERN = /(secret|token|api[_-]?key|password|credential|authorization)/i;
const SECRET_VALUE_PATTERN =
  /(sk-[a-z0-9]{12,}|ghp_[a-z0-9_]{20,}|xox[baprs]-[a-z0-9-]{10,}|bearer\s+[a-z0-9._-]{12,})/i;

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
function clean(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : '';
  return SECRET_VALUE_PATTERN.test(text) ? '[filtered]' : text;
}

function id(prefix: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

function ensureStatus(value: unknown): ProductCatalogStatus {
  return PRODUCT_CATALOG_STATUSES.includes(value as ProductCatalogStatus) ? (value as ProductCatalogStatus) : 'draft';
}

function ensureAssetType(value: unknown): ProductCatalogAssetType {
  return PRODUCT_CATALOG_ASSET_TYPES.includes(value as ProductCatalogAssetType)
    ? (value as ProductCatalogAssetType)
    : 'other';
}

function ensureChannel(value: unknown): ProductCatalogChannel {
  return PRODUCT_CATALOG_CHANNELS.includes(value as ProductCatalogChannel)
    ? (value as ProductCatalogChannel)
    : 'manual';
}

function cleanChannels(value: unknown): ProductCatalogChannel[] {
  const input = Array.isArray(value) ? value : clean(value).split(',');
  const channels = input.map(ensureChannel).filter(Boolean);

  return Array.from(new Set(channels.length ? channels : ['manual']));
}

export function sanitizeCatalogRecord<T extends Record<string, unknown>>(record: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([key]) => !SECRET_FIELD_PATTERN.test(key))
      .map(([key, value]) => [key, typeof value === 'string' ? clean(value) : value]),
  ) as Partial<T>;
}

export function createProductCatalogItem(input: Partial<ProductCatalogItem> = {}, now = nowIso()): ProductCatalogItem {
  const safe = sanitizeCatalogRecord(input);
  return {
    id: clean(safe.id) || id('prod'),
    productName: clean(safe.productName) || 'Produto sem nome',
    niche: clean(safe.niche),
    audience: clean(safe.audience),
    offer: clean(safe.offer),
    price: clean(safe.price),
    status: ensureStatus(safe.status),
    channels: cleanChannels(safe.channels),
    notes: clean(safe.notes),
    createdAt: clean(safe.createdAt) || now,
    updatedAt: now,
  };
}

export function createProductCatalogAsset(
  input: ProductCatalogAssetDraft = {},
  now = new Date().toISOString(),
): ProductCatalogAsset {
  return {
    id: input.id || createLocalId('asset'),
    productId: input.productId?.trim() || '',
    title: input.title?.trim() || 'Asset local sem título',
    type: input.type?.trim() || 'copy',
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}
  input: Partial<ProductCatalogAsset> = {},
  now = nowIso(),
): ProductCatalogAsset {
  const safe = sanitizeCatalogRecord(input);
  return {
    id: clean(safe.id) || id('asset'),
    productId: clean(safe.productId),
    title: clean(safe.title) || 'Asset sem título',
    type: ensureAssetType(safe.type),
    channel: ensureChannel(safe.channel),
    summary: clean(safe.summary),
    approvalNotes: clean(safe.approvalNotes),
    createdAt: clean(safe.createdAt) || now,
    updatedAt: now,
  };
}

export function buildProductCatalogMarkdown(items: ProductCatalogItem[], assets: ProductCatalogAsset[]) {
  const lines = ['# Product Catalog', '', '## Produtos'];

  for (const item of items) {
    lines.push(`- **${item.productName}** (${item.status}) — ${item.offer || item.niche || 'sem resumo'}`);
  }

  lines.push('', '## Assets');

  for (const asset of assets) {
    const product = items.find((item) => item.id === asset.productId)?.productName || asset.productId || 'sem produto';
    lines.push(`- **${asset.title}** [${asset.type}/${asset.channel}] — Produto: ${product}`);
  }
  lines.push(
    '',
    '> Safety: local-only, manual-first, no uploads, payments, checkout links, webhooks or auto-publishing.',
  );

  return lines.join('\n');
}

export function buildProductCatalogJson(
  items: ProductCatalogItem[],
  assets: ProductCatalogAsset[],
): ProductCatalogExport {
  return {
    items: items.map((item) => createProductCatalogItem(item, item.updatedAt || FALLBACK_DATE)),
    assets: assets.map((asset) => createProductCatalogAsset(asset, asset.updatedAt || FALLBACK_DATE)),
    markdown: buildProductCatalogMarkdown(items, assets),
    safety: {
      manualFirst: true,
      localOnly: true,
      noUploads: true,
      noLivePayments: true,
      noCheckoutLinks: true,
      noWebhookExecution: true,
      noAutoPublishing: true,
      humanApprovalRequired: true,
    },
    exportedAt: nowIso(),
  };
}

export function stringifyProductCatalogJson(items: ProductCatalogItem[], assets: ProductCatalogAsset[]) {
  return JSON.stringify(buildProductCatalogJson(items, assets), null, 2);
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
    exportedAt,
  };
}
export function stringifyProductCatalogJson(items: ProductCatalogItem[] = [], assets: ProductCatalogAsset[] = []) {
  return JSON.stringify(buildProductCatalogJson(items, assets), null, 2);
    exportedAt: now,
  };
}
export function serializeCatalogPreview(value: unknown): string {
  return sanitizeCatalogText(JSON.stringify(stripSecretLikeData(value), null, 2), MAX_PREVIEW);
}
