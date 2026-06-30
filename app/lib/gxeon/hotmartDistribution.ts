const SECRET_LIKE_KEY_PATTERN =
  /(api[_-]?key|auth|bearer|client[_-]?secret|credential|jwt|oauth|password|private[_-]?key|secret|token|webhook)/i;
const SECRET_LIKE_VALUE_PATTERN =
  /(api[_-]?key|bearer\s+[a-z0-9._-]+|client[_-]?secret|eyj[a-z0-9._-]+|oauth|password|private[_-]?key|secret|token|webhook)/i;

const SAFETY_CONTRACT = [
  'Local-only and manual-first handoff.',
  'Human approval required before any operator action.',
  'No Hotmart API, no publishing, no autopublish, no checkout, no payment, no webhooks, no tokens, no secrets, no database and no external send.',
] as const;

export interface HotmartDistributionInput {
  productName?: unknown;
  slug?: unknown;
  targetAudience?: unknown;
  audience?: unknown;
  niche?: unknown;
  promise?: unknown;
  productDraft?: unknown;
  affiliateKit?: unknown;
  assetPack?: unknown;
  complianceNotes?: unknown;
  launchQueue?: unknown;
  manualPublishChecklist?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NormalizedHotmartDistributionKit {
  productName: string;
  slug: string;
  targetAudience: string;
  niche: string;
  promise: string;
  productDraft: unknown;
  affiliateKit: unknown;
  assetPack: unknown;
  complianceNotes: unknown;
  launchQueue: unknown[];
  manualPublishChecklist: unknown[];
  createdAt: string;
  updatedAt: string;
}

function cleanString(value: unknown, fallback = 'Não informado'): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized || SECRET_LIKE_VALUE_PATTERN.test(normalized)) {
    return fallback;
  }

  return normalized;
}

function cleanSlug(value: unknown): string {
  const cleaned = cleanString(value, 'hotmart-distribution-kit')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return cleaned || 'hotmart-distribution-kit';
}

function cleanDate(value: unknown): string {
  if (typeof value !== 'string') {
    return 'Não informado';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Não informado';
  }

  return parsed.toISOString();
}

function cleanStructured(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cleanStructured(item)).filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !SECRET_LIKE_KEY_PATTERN.test(key))
        .map(([key, entry]) => [key, cleanStructured(entry)])
        .filter(([, entry]) => entry !== undefined),
    );
  }

  if (typeof value === 'string') {
    const cleaned = cleanString(value, '');
    return cleaned || undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return undefined;
}

function cleanArray(value: unknown): unknown[] {
  const cleaned = cleanStructured(value);
  return Array.isArray(cleaned) ? cleaned : [];
}

function stringifySection(value: unknown): string {
  if (Array.isArray(value) && value.length === 0) {
    return '- Não informado';
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  if (typeof value === 'string') {
    return value;
  }

  return '- Não informado';
}

export function normalizeHotmartDistributionKit(input: HotmartDistributionInput): NormalizedHotmartDistributionKit {
  return {
    productName: cleanString(input.productName),
    slug: cleanSlug(input.slug),
    targetAudience: cleanString(input.targetAudience ?? input.audience),
    niche: cleanString(input.niche),
    promise: cleanString(input.promise),
    productDraft: cleanStructured(input.productDraft) ?? {},
    affiliateKit: cleanStructured(input.affiliateKit) ?? {},
    assetPack: cleanStructured(input.assetPack) ?? {},
    complianceNotes: cleanStructured(input.complianceNotes) ?? [],
    launchQueue: cleanArray(input.launchQueue),
    manualPublishChecklist: cleanArray(input.manualPublishChecklist),
    createdAt: cleanDate(input.createdAt),
    updatedAt: cleanDate(input.updatedAt),
  };
}

export function buildHotmartDistributionPrompt(input: HotmartDistributionInput): string {
  const kit = normalizeHotmartDistributionKit(input);

  return [
    '# Hotmart Distribution OS — prompt manual de handoff',
    '',
    SAFETY_CONTRACT.join('\n'),
    '',
    `Produto: ${kit.productName}`,
    `Slug: ${kit.slug}`,
    `Público-alvo: ${kit.targetAudience}`,
    `Nicho: ${kit.niche}`,
    `Promessa: ${kit.promise}`,
    '',
    '## Product Draft',
    stringifySection(kit.productDraft),
    '',
    '## Affiliate Kit',
    stringifySection(kit.affiliateKit),
    '',
    '## Asset Pack',
    stringifySection(kit.assetPack),
    '',
    '## Compliance Notes',
    stringifySection(kit.complianceNotes),
    '',
    '## Launch Queue',
    stringifySection(kit.launchQueue),
    '',
    '## Manual Publish Checklist',
    stringifySection(kit.manualPublishChecklist),
  ].join('\n');
}

export function buildHotmartDistributionMarkdown(input: HotmartDistributionInput): string {
  const kit = normalizeHotmartDistributionKit(input);

  return [
    '# Hotmart Distribution OS — export Markdown',
    '',
    SAFETY_CONTRACT.join('\n'),
    '',
    '## Resumo',
    `- Product name: ${kit.productName}`,
    `- Slug: ${kit.slug}`,
    `- Target audience: ${kit.targetAudience}`,
    `- Niche: ${kit.niche}`,
    `- Promise: ${kit.promise}`,
    `- Created at: ${kit.createdAt}`,
    `- Updated at: ${kit.updatedAt}`,
    '',
    '## Product Draft',
    stringifySection(kit.productDraft),
    '',
    '## Affiliate Kit',
    stringifySection(kit.affiliateKit),
    '',
    '## Asset Pack',
    stringifySection(kit.assetPack),
    '',
    '## Compliance Notes',
    stringifySection(kit.complianceNotes),
    '',
    '## Launch Queue',
    stringifySection(kit.launchQueue),
    '',
    '## Manual Publish Checklist',
    stringifySection(kit.manualPublishChecklist),
  ].join('\n');
}
