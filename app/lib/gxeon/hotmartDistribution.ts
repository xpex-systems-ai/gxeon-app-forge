export const HOTMART_DISTRIBUTION_STORAGE_KEY = 'gxeon.hotmartDistribution.draft.v1';

export interface HotmartDistributionInput {
  productName?: unknown;
  slug?: unknown;
  targetAudience?: unknown;
  audience?: unknown;
  publicoAlvo?: unknown;
  public?: unknown;
  targetPublic?: unknown;
  clienteIdeal?: unknown;
  avatar?: unknown;
  offer?: unknown;
  price?: unknown;
  deliveryFormat?: unknown;
  operatorNotes?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface HotmartDistributionDraft {
  productName: string;
  slug: string;
  targetAudience: string;
  offer: string;
  price: string;
  deliveryFormat: string;
  operatorNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotmartDistributionExport {
  draft: HotmartDistributionDraft;
  contextPayload: string;
  prompt: string;
  markdown: string;
  safety: {
    localOnlyDraft: true;
    manualFirst: true;
    humanApprovalRequired: true;
    noHotmartApi: true;
    noAutoPublishing: true;
    noCheckoutCreation: true;
    noPaymentProcessing: true;
    noWebhooks: true;
    noTokens: true;
    noSecrets: true;
    noDatabase: true;
    noExternalSend: true;
  };
  exportedAt: string;
}

const FALLBACK_SLUG = 'hotmart-local-draft';
const nowIso = () => new Date().toISOString();
const SECRET_VALUE_PATTERN =
  /(?:api[_-]?key|access[_-]?token|refresh[_-]?token|hotmart[_-]?token|client[_-]?secret|secret|password|credential|bearer|token)[\w-]*|[A-Za-z0-9+/]{24,}={0,2}/i;

export function isSecretLikeHotmartValue(value: unknown) {
  return typeof value === 'string' && SECRET_VALUE_PATTERN.test(value.trim());
}

export function safeHotmartText(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (!trimmed || isSecretLikeHotmartValue(trimmed)) {
    return '';
  }

  return trimmed
    .replaceAll('<gxeon_hotmart_distribution_context_payload>', '[removed_hotmart_distribution_context_open_tag]')
    .replaceAll('</gxeon_hotmart_distribution_context_payload>', '[removed_hotmart_distribution_context_close_tag]')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .slice(0, 1200);
}

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

function firstSafeAudience(input: HotmartDistributionInput) {
  return (
    safeHotmartText(input.targetAudience) ||
    safeHotmartText(input.audience) ||
    safeHotmartText(input.publicoAlvo) ||
    safeHotmartText(input.public) ||
    safeHotmartText(input.targetPublic) ||
    safeHotmartText(input.clienteIdeal) ||
    safeHotmartText(input.avatar)
  );
}

export function normalizeHotmartDistributionDraft(
  input: HotmartDistributionInput = {},
  now = nowIso(),
): HotmartDistributionDraft {
  const productName = safeHotmartText(input.productName);
  const safeSlugCandidate = isSecretLikeHotmartValue(input.slug) ? '' : safeHotmartText(input.slug);
  const slug = slugify(safeSlugCandidate) || slugify(productName) || FALLBACK_SLUG;

  return {
    productName,
    slug,
    targetAudience: firstSafeAudience(input),
    offer: safeHotmartText(input.offer),
    price: safeHotmartText(input.price),
    deliveryFormat: safeHotmartText(input.deliveryFormat),
    operatorNotes: safeHotmartText(input.operatorNotes),
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : now,
    updatedAt: now,
  };
}

export function buildHotmartDistributionPrompt(draft: HotmartDistributionDraft) {
  const contextPayload = JSON.stringify(draft, null, 2);

  return `HOTMART DISTRIBUTION OS — LOCAL DRAFT ONLY\n\nManual-first planning pack. No Hotmart API, no autopublish, no checkout, no payments, no webhooks, no tokens, no secrets, no database. Human approval required before any external action.\n\n<gxeon_hotmart_distribution_context_payload>\n${contextPayload}\n</gxeon_hotmart_distribution_context_payload>`;
}

export function buildHotmartDistributionMarkdown(draft: HotmartDistributionDraft) {
  return `# Hotmart Distribution OS Draft\n\n- Product: ${draft.productName || 'Local draft'}\n- Slug: ${draft.slug}\n- Audience: ${draft.targetAudience || 'Manual review required'}\n- Offer: ${draft.offer || 'Manual review required'}\n\nSafety: local-only, manual-first, human approval required, no Hotmart API, no autopublish, no checkout, no payments, no webhooks, no tokens, no secrets, no database.`;
}

export function buildHotmartDistributionJson(
  input: HotmartDistributionInput = {},
  now = nowIso(),
): HotmartDistributionExport {
  const draft = normalizeHotmartDistributionDraft(input, now);

  return {
    draft,
    contextPayload: JSON.stringify(draft, null, 2),
    prompt: buildHotmartDistributionPrompt(draft),
    markdown: buildHotmartDistributionMarkdown(draft),
    safety: {
      localOnlyDraft: true,
      manualFirst: true,
      humanApprovalRequired: true,
      noHotmartApi: true,
      noAutoPublishing: true,
      noCheckoutCreation: true,
      noPaymentProcessing: true,
      noWebhooks: true,
      noTokens: true,
      noSecrets: true,
      noDatabase: true,
      noExternalSend: true,
    },
    exportedAt: now,
  };
}

export function stringifyHotmartDistributionJson(input: HotmartDistributionInput = {}, now = nowIso()) {
  return JSON.stringify(buildHotmartDistributionJson(input, now), null, 2);
}
