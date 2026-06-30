export const HOTMART_DISTRIBUTION_STORAGE_KEY = 'gxeon.hotmartDistribution.draft.v1';

export interface HotmartDistributionDraft {
  productName: string;
  slug: string;
  niche: string;
  targetAudience: string;
  promise: string;
  offer: string;
  deliveryFormat: string;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotmartDistributionOutput {
  ideaGeneration: string[];
  productDraft: string[];
  affiliateKit: string[];
  assetPack: string[];
  complianceValidation: string[];
  launchQueue: string[];
  manualPublishPlaybook: string[];
}

export interface HotmartDistributionExport {
  draft: HotmartDistributionDraft;
  distribution: HotmartDistributionOutput;
  contextPayload: string;
  prompt: string;
  markdown: string;
  safety: {
    localOnly: true;
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

type HotmartDistributionInput = Partial<HotmartDistributionDraft> & Partial<Record<string, unknown>>;

const FALLBACK_SLUG = 'hotmart-local-draft';
const MAX_TEXT_LENGTH = 500;
const MAX_TIMESTAMP_LENGTH = 40;
const ISO_LIKE_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const SECRET_PATTERN =
  /(?:api[_-]?key|access[_-]?token|auth[_-]?token|bearer|client[_-]?secret|hotmart[_-]?token|secret|senha|password|private[_-]?key|refresh[_-]?token)[\w.-]*/i;
const AUDIENCE_ALIASES = [
  'targetAudience',
  'audience',
  'publicoAlvo',
  'public',
  'targetPublic',
  'clienteIdeal',
  'avatar',
] as const;

function nowIso() {
  return new Date().toISOString();
}

function isSecretLike(value: unknown) {
  return typeof value === 'string' && SECRET_PATTERN.test(value);
}

function cleanText(value: unknown, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > maxLength || isSecretLike(trimmed)) {
    return '';
  }

  return trimmed;
}

function sanitizeTimestamp(value: unknown, now: string) {
  const cleaned = cleanText(value, MAX_TIMESTAMP_LENGTH);

  if (!cleaned || !ISO_LIKE_TIMESTAMP.test(cleaned) || Number.isNaN(Date.parse(cleaned))) {
    return now;
  }

  return cleaned;
}

function resolveAudience(input: HotmartDistributionInput) {
  for (const alias of AUDIENCE_ALIASES) {
    const candidate = cleanText(input[alias]);

    if (candidate) {
      return candidate;
    }
  }

  return '';
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function resolveSlug(input: HotmartDistributionInput) {
  const safeExplicitSlug = cleanText(input.slug, 120);

  if (safeExplicitSlug) {
    const slug = slugify(safeExplicitSlug);

    if (slug) {
      return slug;
    }
  }

  const safeProductName = cleanText(input.productName, 120);

  return slugify(safeProductName) || FALLBACK_SLUG;
}

export function createEmptyHotmartDistributionDraft(now = nowIso()): HotmartDistributionDraft {
  return {
    productName: '',
    slug: FALLBACK_SLUG,
    niche: '',
    targetAudience: '',
    promise: '',
    offer: '',
    deliveryFormat: '',
    approvalNotes: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeHotmartDistributionDraft(
  input: HotmartDistributionInput = {},
  now = nowIso(),
): HotmartDistributionDraft {
  const productName = cleanText(input.productName, 120);

  return {
    productName,
    slug: resolveSlug(input),
    niche: cleanText(input.niche),
    targetAudience: resolveAudience(input),
    promise: cleanText(input.promise),
    offer: cleanText(input.offer),
    deliveryFormat: cleanText(input.deliveryFormat),
    approvalNotes: cleanText(input.approvalNotes),
    createdAt: sanitizeTimestamp(input.createdAt, now),
    updatedAt: sanitizeTimestamp(input.updatedAt, now),
  };
}

export function buildHotmartDistributionOutput(input: HotmartDistributionInput): HotmartDistributionOutput {
  const draft = normalizeHotmartDistributionDraft(input, input.updatedAt as string | undefined);
  const product = draft.productName || 'Produto digital Hotmart local';
  const audience = draft.targetAudience || 'avatar aprovado manualmente';
  const promise = draft.promise || 'promessa validada sem garantia de renda';

  return {
    ideaGeneration: [`Mapear dores de ${audience}.`, `Validar ângulos para ${product}.`],
    productDraft: [`Criar rascunho local de ${product}.`, `Organizar entrega: ${draft.deliveryFormat || 'a definir'}.`],
    affiliateKit: ['Separar bullets de divulgação manual.', 'Criar textos revisados por humano para afiliados.'],
    assetPack: ['Checklist de capa, mockups e imagens.', 'Arquivos locais sem envio externo automático.'],
    complianceValidation: [
      'Revisar promessas, preço, garantias e termos.',
      `Confirmar que "${promise}" não promete renda garantida.`,
    ],
    launchQueue: ['Fila local de tarefas de lançamento.', 'Aprovação humana antes de qualquer publicação manual.'],
    manualPublishPlaybook: [
      'Entrar manualmente na Hotmart.',
      'Copiar campos aprovados.',
      'Revisar tudo antes de publicar.',
    ],
  };
}

export function buildHotmartDistributionPrompt(input: HotmartDistributionInput) {
  const draft = normalizeHotmartDistributionDraft(input, input.updatedAt as string | undefined);
  return `Hotmart Distribution OS local/manual-first para ${draft.productName || draft.slug}. Público: ${draft.targetAudience}. Sem Hotmart API, checkout, pagamentos, webhooks, tokens, segredos ou banco de dados.`;
}

export function buildHotmartDistributionMarkdown(input: HotmartDistributionInput) {
  const draft = normalizeHotmartDistributionDraft(input, input.updatedAt as string | undefined);
  const output = buildHotmartDistributionOutput(draft as HotmartDistributionInput);

  return [
    `# Hotmart Distribution OS: ${draft.productName || draft.slug}`,
    '',
    `- Slug: ${draft.slug}`,
    `- Público: ${draft.targetAudience}`,
    `- Created at: ${draft.createdAt}`,
    `- Updated at: ${draft.updatedAt}`,
    '',
    '## Manual publish playbook',
    ...output.manualPublishPlaybook.map((item) => `- ${item}`),
  ].join('\n');
}

export function buildHotmartDistributionContextPayload(input: HotmartDistributionInput) {
  const draft = normalizeHotmartDistributionDraft(input, input.updatedAt as string | undefined);
  return JSON.stringify({
    productName: draft.productName,
    slug: draft.slug,
    targetAudience: draft.targetAudience,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
  });
}

export function buildHotmartDistributionJson(
  input: HotmartDistributionInput,
  now = nowIso(),
): HotmartDistributionExport {
  const draft = normalizeHotmartDistributionDraft(input, now);

  return {
    draft,
    distribution: buildHotmartDistributionOutput(draft as HotmartDistributionInput),
    contextPayload: buildHotmartDistributionContextPayload(draft as HotmartDistributionInput),
    prompt: buildHotmartDistributionPrompt(draft as HotmartDistributionInput),
    markdown: buildHotmartDistributionMarkdown(draft as HotmartDistributionInput),
    safety: {
      localOnly: true,
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

export function stringifyHotmartDistributionJson(input: HotmartDistributionInput, now = nowIso()) {
  return JSON.stringify(buildHotmartDistributionJson(input, now), null, 2);
}
