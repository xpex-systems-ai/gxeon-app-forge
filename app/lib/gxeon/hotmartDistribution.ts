const FALLBACK_DATE = '2026-06-30T00:00:00.000Z';
const SAFE_TIMESTAMP_LIMIT = 80;
const SECRET_RE =
  /(api[_-]?key|access[_-]?token|auth[_-]?token|bearer|client[_-]?secret|hotmart[_-]?token|secret|senha|password|private[_-]?key|refresh[_-]?token)/i;

export interface HotmartDistributionDraft {
  [key: string]: string | string[];
  productName: string;
  slug: string;
  targetAudience: string;
  niche: string;
  promise: string;
  productDraft: string;
  affiliateKit: string;
  assetPack: string;
  complianceNotes: string;
  launchQueue: string[];
  manualPublishChecklist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HotmartDistributionValidation {
  missingRecommendedFields: string[];
  isReadyForManualReview: boolean;
  blockedExternalActions: string[];
}

type DraftInput = Partial<HotmartDistributionDraft> & Record<string, unknown>;

const ALIASES = [
  'targetAudience',
  'audience',
  'publicoAlvo',
  'public',
  'targetPublic',
  'clienteIdeal',
  'avatar',
] as const;

function clean(value: unknown, max = 1600) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.replace(/\s+/g, ' ').trim();

  if (!trimmed || SECRET_RE.test(trimmed)) {
    return '';
  }

  return trimmed.slice(0, max);
}

function isSecretLike(value: unknown) {
  return typeof value === 'string' && SECRET_RE.test(value);
}

function cleanList(value: unknown, fallback: string[]) {
  const list = Array.isArray(value) ? value : [];
  const cleaned = list.map((item) => clean(item, 280)).filter(Boolean);

  return cleaned.length ? cleaned : fallback;
}

function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function safeSlug(inputSlug: unknown, productName: string) {
  const candidate = typeof inputSlug === 'string' ? inputSlug.trim() : '';

  if (candidate && !isSecretLike(candidate)) {
    const slug = toSlug(candidate);

    if (slug && !isSecretLike(slug)) {
      return slug;
    }
  }

  const productSlug = toSlug(productName);

  return productSlug && !isSecretLike(productSlug) ? productSlug : 'hotmart-local-draft';
}

function safeTimestamp(value: unknown, now: string) {
  const candidate = clean(value, SAFE_TIMESTAMP_LIMIT);

  if (!candidate || candidate.length > SAFE_TIMESTAMP_LIMIT) {
    return now;
  }

  const time = Date.parse(candidate);

  return Number.isFinite(time) ? new Date(time).toISOString() : now;
}

function resolveAudience(input: DraftInput) {
  for (const key of ALIASES) {
    const value = clean(input[key], 400);

    if (value) {
      return value;
    }
  }

  return '';
}

export function createEmptyHotmartDistributionDraft(now = new Date().toISOString()): HotmartDistributionDraft {
  return {
    productName: '',
    slug: 'hotmart-local-draft',
    targetAudience: '',
    niche: '',
    promise: '',
    productDraft: '',
    affiliateKit: '',
    assetPack: '',
    complianceNotes: '',
    launchQueue: ['Revisar oferta manualmente', 'Preparar ativos locais', 'Aprovação humana antes de publicar'],
    manualPublishChecklist: ['Sem API Hotmart', 'Sem checkout real', 'Sem autopublicação', 'Sem envio externo'],
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeHotmartDistributionDraft(
  input: DraftInput = {},
  now = new Date().toISOString(),
): HotmartDistributionDraft {
  const safeNow =
    !isSecretLike(now) && Number.isFinite(Date.parse(now)) ? new Date(Date.parse(now)).toISOString() : FALLBACK_DATE;
  const productName = clean(input.productName, 240);

  return {
    productName,
    slug: safeSlug(input.slug, productName),
    targetAudience: resolveAudience(input),
    niche: clean(input.niche, 240),
    promise: clean(input.promise, 500),
    productDraft: clean(input.productDraft, 1600),
    affiliateKit: clean(input.affiliateKit, 1600),
    assetPack: clean(input.assetPack, 1600),
    complianceNotes: clean(input.complianceNotes, 1200),
    launchQueue: cleanList(input.launchQueue, ['Revisar oferta manualmente', 'Preparar ativos locais']),
    manualPublishChecklist: cleanList(input.manualPublishChecklist, [
      'Aprovação humana obrigatória',
      'Publicação manual',
    ]),
    createdAt: safeTimestamp(input.createdAt, safeNow),
    updatedAt: safeTimestamp(input.updatedAt, safeNow),
  };
}

export function validateHotmartDistributionDraft(input: DraftInput): HotmartDistributionValidation {
  const draft = normalizeHotmartDistributionDraft(input);
  const required: (keyof Pick<HotmartDistributionDraft, 'productName' | 'targetAudience' | 'promise'>)[] = [
    'productName',
    'targetAudience',
    'promise',
  ];
  const missingRecommendedFields = required.filter((field) => !draft[field]);

  return {
    missingRecommendedFields,
    isReadyForManualReview: missingRecommendedFields.length === 0,
    blockedExternalActions: ['hotmart_api', 'auto_publish', 'checkout_creation', 'payment_processing', 'webhooks'],
  };
}

export function buildHotmartDistributionContextPayload(input: DraftInput) {
  const draft = normalizeHotmartDistributionDraft(input);
  return { module: 'Hotmart Distribution OS', mode: 'LOCAL_ONLY_MANUAL_FIRST', draft };
}

export function buildHotmartDistributionPrompt(input: DraftInput) {
  const d = normalizeHotmartDistributionDraft(input);
  return `Hotmart Distribution OS — manual-first/local-only\nProduto: ${d.productName || 'Não informado'}\nSlug seguro: ${d.slug}\nPúblico: ${d.targetAudience || 'Não informado'}\nNicho: ${d.niche || 'Não informado'}\nPromessa: ${d.promise || 'Não informado'}\nCriado em: ${d.createdAt}\nAtualizado em: ${d.updatedAt}\n\nMonte plano de distribuição manual com produto, kit de afiliados, asset pack, validação de compliance e fila de lançamento. Não chame API Hotmart, não publique, não crie checkout, não processe pagamento, não use webhooks, tokens, banco de dados ou envio externo. Exija aprovação humana.`;
}

export function buildHotmartDistributionMarkdown(input: DraftInput) {
  const d = normalizeHotmartDistributionDraft(input);
  return `# Hotmart Distribution OS\n\n- **Produto:** ${d.productName || 'Não informado'}\n- **Slug:** ${d.slug}\n- **Público:** ${d.targetAudience || 'Não informado'}\n- **Criado em:** ${d.createdAt}\n- **Atualizado em:** ${d.updatedAt}\n\n## Produto\n${d.productDraft || 'Rascunho local pendente.'}\n\n## Kit de afiliados\n${d.affiliateKit || 'Kit manual pendente.'}\n\n## Asset pack\n${d.assetPack || 'Assets locais pendentes.'}\n\n## Compliance\n${d.complianceNotes || 'Revisão humana obrigatória.'}\n\n## Launch queue\n${d.launchQueue.map((item) => `- ${item}`).join('\n')}\n\n## Publicação manual\n${d.manualPublishChecklist.map((item) => `- ${item}`).join('\n')}\n`;
}

export function stringifyHotmartDistributionJson(input: DraftInput) {
  return JSON.stringify(normalizeHotmartDistributionDraft(input), null, 2);
}
