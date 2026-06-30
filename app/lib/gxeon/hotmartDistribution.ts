import { sanitizeProductCatalogValue } from './productCatalog';

export const HOTMART_DISTRIBUTION_STORAGE_KEY = 'gxeon.hotmartDistribution.drafts.v1';

const SECRET_KEY_RE =
  /^(token|secret|password|apiKey|api_key|client_secret|hotmart_token|access_token|refresh_token|credential|authorization|bearer)$/i;
const SECRET_VALUE_RE =
  /(bearer\s+\S+|sk-[a-z0-9]{12,}|ghp_[a-z0-9_]{20,}|secret[_-]?[a-z0-9]{8,}|token[_-]?[a-z0-9]{8,})/i;

const AUDIENCE_ALIASES = [
  'targetAudience',
  'audience',
  'publicoAlvo',
  'public',
  'targetPublic',
  'clienteIdeal',
  'avatar',
] as const;

export interface HotmartDistributionDraft {
  id: string;
  productName: string;
  slug: string;
  niche: string;
  targetAudience: string;
  offer: string;
  promise: string;
  price: string;
  launchQueue: string[];
  affiliateKit: string[];
  assetPack: string[];
  complianceChecklist: string[];
  manualSteps: string[];
  localOnly: true;
  manualFirst: true;
  humanApprovalRequired: true;
  noHotmartApi: true;
  noAutoPublish: true;
  noCheckout: true;
  noPayments: true;
  noWebhooks: true;
  noTokens: true;
  noSecrets: true;
  noDatabase: true;
  createdAt: string;
  updatedAt: string;
}

export interface HotmartDistributionExport {
  draft: HotmartDistributionDraft;
  markdown: string;
  safety: Pick<
    HotmartDistributionDraft,
    | 'localOnly'
    | 'manualFirst'
    | 'noHotmartApi'
    | 'noAutoPublish'
    | 'noCheckout'
    | 'noPayments'
    | 'noWebhooks'
    | 'noTokens'
    | 'noSecrets'
    | 'noDatabase'
  >;
  exportedAt: string;
}

const nowIso = () => new Date().toISOString();
const id = () => `hotmart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
const slug = (value: unknown) =>
  (
    sanitizeProductCatalogValue(value, 120)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'hotmart-local-draft'
  ).slice(0, 80);

function safeText(value: unknown, max = 240): string {
  const text = sanitizeProductCatalogValue(value, max);
  return SECRET_VALUE_RE.test(text) ? '' : text;
}

function safeList(value: unknown, fallback: string[] = []): string[] {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split('\n') : fallback;
  return raw
    .map((item) => safeText(item, 180))
    .filter(Boolean)
    .slice(0, 24);
}

export function pickProductCatalogAudience(source: Record<string, unknown>): string {
  for (const key of AUDIENCE_ALIASES) {
    const value = safeText(source[key]);

    if (value) {
      return value;
    }
  }

  return '';
}

export function normalizeHotmartDistributionDraft(
  input: Partial<HotmartDistributionDraft> & Record<string, unknown> = {},
): HotmartDistributionDraft {
  const productName = safeText(input.productName || input.title || input.name, 120) || 'Produto Hotmart local';
  const createdAt = safeText(input.createdAt, 80) || nowIso();
  const updatedAt = safeText(input.updatedAt, 80) || nowIso();

  return {
    id: safeText(input.id, 80) || id(),
    productName,
    slug: slug(input.slug || productName),
    niche: safeText(input.niche),
    targetAudience: pickProductCatalogAudience(input),
    offer: safeText(input.offer, 500),
    promise: safeText(input.promise, 500),
    price: safeText(input.price || input.basePrice, 80),
    launchQueue: safeList(input.launchQueue, ['Revisar oferta manualmente', 'Preparar cadastro manual futuro']),
    affiliateKit: safeList(input.affiliateKit, ['Resumo do produto', 'Ângulos de divulgação manual']),
    assetPack: safeList(input.assetPack, ['Página de vendas manual-first', 'E-mails e posts de lançamento']),
    complianceChecklist: safeList(input.complianceChecklist, [
      'Validar promessas e provas antes de publicar',
      'Confirmar aprovação humana antes de qualquer ação externa',
    ]),
    manualSteps: safeList(input.manualSteps, [
      'Exportar briefing local',
      'Executar ações externas somente manualmente',
    ]),
    localOnly: true,
    manualFirst: true,
    humanApprovalRequired: true,
    noHotmartApi: true,
    noAutoPublish: true,
    noCheckout: true,
    noPayments: true,
    noWebhooks: true,
    noTokens: true,
    noSecrets: true,
    noDatabase: true,
    createdAt,
    updatedAt,
  };
}

export function createHotmartDistributionDraft(
  input: Partial<HotmartDistributionDraft> & Record<string, unknown> = {},
) {
  return normalizeHotmartDistributionDraft(input);
}

function safety(draft: HotmartDistributionDraft): HotmartDistributionExport['safety'] {
  return {
    localOnly: draft.localOnly,
    manualFirst: draft.manualFirst,
    noHotmartApi: draft.noHotmartApi,
    noAutoPublish: draft.noAutoPublish,
    noCheckout: draft.noCheckout,
    noPayments: draft.noPayments,
    noWebhooks: draft.noWebhooks,
    noTokens: draft.noTokens,
    noSecrets: draft.noSecrets,
    noDatabase: draft.noDatabase,
  };
}

export function buildHotmartDistributionMarkdown(
  input: Partial<HotmartDistributionDraft> & Record<string, unknown>,
): string {
  const draft = normalizeHotmartDistributionDraft(input);

  return [
    '# Hotmart Distribution OS — Local Draft',
    `Produto: ${draft.productName}`,
    `Público-alvo: ${draft.targetAudience}`,
    `Oferta: ${draft.offer}`,
    `Promessa: ${draft.promise}`,
    `Preço: ${draft.price}`,
    '',
    '## Launch Queue',
    ...draft.launchQueue.map((item) => `- ${item}`),
    '',
    '## Affiliate Kit',
    ...draft.affiliateKit.map((item) => `- ${item}`),
    '',
    '## Asset Pack',
    ...draft.assetPack.map((item) => `- ${item}`),
    '',
    '## Safety',
    '- Local-only, manual-first, human approval required.',
    '- No Hotmart API, auto-publish, checkout, payments, webhooks, tokens, secrets or database.',
  ].join('\n');
}

export function buildHotmartDistributionExport(
  input: Partial<HotmartDistributionDraft> & Record<string, unknown>,
  exportedAt = nowIso(),
): HotmartDistributionExport {
  const draft = normalizeHotmartDistributionDraft(input);
  return {
    draft,
    markdown: buildHotmartDistributionMarkdown({ ...draft }),
    safety: safety(draft),
    exportedAt,
  };
}

export function stringifyHotmartDistributionJson(
  input: Partial<HotmartDistributionDraft> & Record<string, unknown>,
): string {
  return JSON.stringify(buildHotmartDistributionExport(input), null, 2);
}

export function stripSecretLikeHotmartExportFields(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([key]) => !SECRET_KEY_RE.test(key)));
}
