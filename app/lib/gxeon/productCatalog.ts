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
] as const;

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
    humanApprovalRequired: true;
  };
  exportedAt: string;
}

const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';
const SECRET_FIELD_PATTERN = /(secret|token|api[_-]?key|password|credential|authorization)/i;
const SECRET_VALUE_PATTERN =
  /(sk-[a-z0-9]{12,}|ghp_[a-z0-9_]{20,}|xox[baprs]-[a-z0-9-]{10,}|bearer\s+[a-z0-9._-]{12,})/i;

function nowIso() {
  return new Date().toISOString();
}

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
}
