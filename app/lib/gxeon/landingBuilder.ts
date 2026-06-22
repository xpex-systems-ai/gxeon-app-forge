export const LANDING_BUILDER_STORAGE_KEY = 'gxeon.landingBuilder.draft.v1';
export const PRODUCT_BUILDER_DRAFT_STORAGE_KEY = 'gxeon.productBuilder.draft.v1';
export const MARKETPLACE_PACK_DRAFT_STORAGE_KEY = 'gxeon.marketplacePack.draft.v1';
export const CHECKOUT_BLUEPRINT_DRAFT_STORAGE_KEY = 'gxeon.checkoutBlueprint.draft.v1';

export const LANDING_GOALS = ['waitlist', 'validation', 'sales_page', 'lead_capture', 'presale', 'internal'] as const;
export const PAGE_STYLES = ['premium', 'direct', 'institutional', 'minimal', 'bold', 'technical'] as const;
export const CTA_MODES = [
  'manual_contact',
  'waitlist',
  'request_access',
  'checkout_later',
  'download_preview',
] as const;
export type LandingGoal = (typeof LANDING_GOALS)[number];
export type PageStyle = (typeof PAGE_STYLES)[number];
export type CtaMode = (typeof CTA_MODES)[number];

export interface LandingBuilderDraft {
  sourceProductIdea: string;
  sourceNiche: string;
  sourceAudience: string;
  sourceProblem: string;
  sourceOffer: string;
  sourcePromise: string;
  basePrice: string;
  deliveryFormat: string;
  selectedPlatforms: string[];
  landingGoal: LandingGoal;
  pageStyle: PageStyle;
  ctaMode: CtaMode;
  proofNotes: string;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
}
export interface LandingBuilderOutput {
  hero: string[];
  subheadline: string[];
  avatarProblem: string[];
  transformation: string[];
  offerStack: string[];
  deliverables: string[];
  pricingBlock: string[];
  ctaCopy: string[];
  faq: string[];
  proofPlaceholders: string[];
  legalSafetyNotes: string[];
  pageSections: Array<{ section: string; purpose: string; copy: string[] }>;
  tailwindWireframe: string[];
  humanApprovalChecklist: string[];
  riskWarnings: string[];
  nextSteps: string[];
}
export interface LandingBuilderExport {
  draft: LandingBuilderDraft;
  landing: LandingBuilderOutput;
  contextPayload: string;
  prompt: string;
  markdown: string;
  safety: {
    manualFirst: true;
    noGuaranteedIncome: true;
    noRealCheckout: true;
    noLivePayments: true;
    noAutoDeploy: true;
    noMarketplaceApiExecution: true;
    localOnlyDraft: true;
  };
  exportedAt: string;
}
export type LandingBuilderRecommendedField =
  | 'sourceProductIdea'
  | 'sourceAudience'
  | 'sourceOfferOrPromise'
  | 'basePrice'
  | 'ctaMode';
export interface LandingBuilderValidationResult {
  missingRecommendedFields: LandingBuilderRecommendedField[];
  isStrongLandingBuilderReady: boolean;
}

const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';
const OPEN_TAG = '<gxeon_landing_context_payload>';
const CLOSE_TAG = '</gxeon_landing_context_payload>';
const SECRET_KEYS =
  /api_?key|token|access_token|refresh_token|secret|client_secret|password|credential|cookie|stripe_key|webhook_secret/i;
const GOAL_LABELS: Record<LandingGoal, string> = {
  waitlist: 'lista de espera',
  validation: 'validação',
  sales_page: 'página de venda manual',
  lead_capture: 'captura de leads',
  presale: 'pré-venda manual',
  internal: 'uso interno',
};
const CTA_LABELS: Record<CtaMode, string> = {
  manual_contact: 'Falar com operador',
  waitlist: 'Entrar na lista de espera',
  request_access: 'Solicitar acesso',
  checkout_later: 'Revisar oferta antes do checkout',
  download_preview: 'Baixar prévia',
};

function nowIso() {
  return new Date().toISOString();
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function ensure<T extends readonly string[]>(values: T, value: unknown, fallback: T[number]): T[number] {
  return values.includes(value as T[number]) ? (value as T[number]) : fallback;
}

function cleanList(values: unknown): string[] {
  const input = Array.isArray(values) ? values : clean(values).split(',');
  return Array.from(new Set(input.map((v) => clean(v)).filter((v) => v && !SECRET_KEYS.test(v))));
}

export function sanitizeLandingContextValue(value: unknown): string {
  return clean(value)
    .replaceAll(OPEN_TAG, '[gxeon_landing_context_payload]')
    .replaceAll(CLOSE_TAG, '[/gxeon_landing_context_payload]')
    .replace(/[<>]/g, (m) => (m === '<' ? '‹' : '›'));
}
export function createEmptyLandingBuilderDraft(now = nowIso()): LandingBuilderDraft {
  return {
    sourceProductIdea: '',
    sourceNiche: '',
    sourceAudience: '',
    sourceProblem: '',
    sourceOffer: '',
    sourcePromise: '',
    basePrice: '',
    deliveryFormat: '',
    selectedPlatforms: [],
    landingGoal: 'validation',
    pageStyle: 'premium',
    ctaMode: 'manual_contact',
    proofNotes: '',
    approvalNotes: '',
    createdAt: now,
    updatedAt: now,
  };
}
export function normalizeLandingBuilderDraft(input: Partial<LandingBuilderDraft>, now = nowIso()): LandingBuilderDraft {
  return {
    sourceProductIdea: clean(input.sourceProductIdea),
    sourceNiche: clean(input.sourceNiche),
    sourceAudience: clean(input.sourceAudience),
    sourceProblem: clean(input.sourceProblem),
    sourceOffer: clean(input.sourceOffer),
    sourcePromise: clean(input.sourcePromise),
    basePrice: clean(input.basePrice),
    deliveryFormat: clean(input.deliveryFormat),
    selectedPlatforms: cleanList(input.selectedPlatforms),
    landingGoal: ensure(LANDING_GOALS, input.landingGoal, 'validation'),
    pageStyle: ensure(PAGE_STYLES, input.pageStyle, 'premium'),
    ctaMode: ensure(CTA_MODES, input.ctaMode, 'manual_contact'),
    proofNotes: clean(input.proofNotes),
    approvalNotes: clean(input.approvalNotes),
    createdAt: clean(input.createdAt) || now,
    updatedAt: now,
  };
}
export function validateLandingBuilderDraft(input: Partial<LandingBuilderDraft>): LandingBuilderValidationResult {
  const missing: LandingBuilderRecommendedField[] = [];

  if (!clean(input.sourceProductIdea)) {
    missing.push('sourceProductIdea');
  }

  if (!clean(input.sourceAudience)) {
    missing.push('sourceAudience');
  }

  if (!clean(input.sourceOffer) && !clean(input.sourcePromise)) {
    missing.push('sourceOfferOrPromise');
  }

  if (!clean(input.basePrice)) {
    missing.push('basePrice');
  }

  if (!clean(input.ctaMode)) {
    missing.push('ctaMode');
  }

  return { missingRecommendedFields: missing, isStrongLandingBuilderReady: missing.length === 0 };
}
export function buildLandingContextPayload(draftInput: Partial<LandingBuilderDraft>): string {
  const d = normalizeLandingBuilderDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const safe: Record<string, unknown> = {
    productIdea: d.sourceProductIdea,
    niche: d.sourceNiche,
    audience: d.sourceAudience,
    problem: d.sourceProblem,
    offer: d.sourceOffer,
    promise: d.sourcePromise,
    basePrice: d.basePrice,
    deliveryFormat: d.deliveryFormat,
    selectedPlatforms: d.selectedPlatforms,
    landingGoal: d.landingGoal,
    pageStyle: d.pageStyle,
    ctaMode: d.ctaMode,
    proofNotes: d.proofNotes,
    approvalNotes: d.approvalNotes,
    safety: {
      manualFirst: true,
      noAutoDeploy: true,
      noRealCheckout: true,
      noPaymentActivation: true,
      noMarketplaceApiCalls: true,
    },
  };
  const json = JSON.stringify(safe, (key, value) =>
    SECRET_KEYS.test(key) ? undefined : typeof value === 'string' ? sanitizeLandingContextValue(value) : value,
  );

  return `${OPEN_TAG}${json}${CLOSE_TAG}`;
}
export function buildLandingBuilderOutput(draftInput: Partial<LandingBuilderDraft>): LandingBuilderOutput {
  const d = normalizeLandingBuilderDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const product = d.sourceProductIdea || 'oferta digital GXEON';
  const audience = d.sourceAudience || 'operadores e fundadores digitais';
  const problem = d.sourceProblem || 'falta de clareza para validar e vender sem automações perigosas';
  const promise = d.sourcePromise || 'sair com uma estrutura revisável e pronta para aprovação humana';
  const offer = d.sourceOffer || product;
  const cta = CTA_LABELS[d.ctaMode];

  return {
    hero: [
      `${product}: ${promise}`,
      `Uma landing ${d.pageStyle} para ${GOAL_LABELS[d.landingGoal]} sem publicar nada automaticamente.`,
    ],
    subheadline: [
      `Para ${audience} que precisam resolver ${problem}.`,
      'Blueprint local para revisão humana antes de qualquer publicação, cobrança ou integração.',
    ],
    avatarProblem: [
      `Avatar: ${audience}.`,
      `Problema central: ${problem}.`,
      'Custo da inação: continuar improvisando copy, prova e CTA sem critérios de segurança.',
    ],
    transformation: [
      `Antes: contexto disperso. Depois: narrativa pública organizada para ${GOAL_LABELS[d.landingGoal]}.`,
      `Promessa revisável: ${promise}.`,
    ],
    offerStack: [
      `Oferta principal: ${offer}.`,
      `Formato de entrega: ${d.deliveryFormat || 'a definir manualmente'}.`,
      `Canais planejados: ${d.selectedPlatforms.join(', ') || 'selecionar canais manualmente'}.`,
    ],
    deliverables: [
      'Hero e subheadline',
      'Seção avatar/problema',
      'Oferta, entregáveis e preço',
      'FAQ, prova placeholder e notas legais',
      'CTA manual e próxima etapa',
    ],
    pricingBlock: [
      `Preço-base informado: ${d.basePrice || 'não definido'}.`,
      'Não criar link de checkout; preço é hipótese para validação humana.',
    ],
    ctaCopy: [
      cta,
      `${cta} — revisão manual antes de qualquer pagamento.`,
      'Falar com operador GXEON para validar próximos passos.',
    ],
    faq: [
      'Isso está publicado? Não, é somente blueprint local.',
      'Existe checkout real? Não, nenhum link ou gateway foi ativado.',
      'Há garantia de renda? Não, resultados dependem de execução e validação.',
      'Posso editar antes de usar? Sim, aprovação humana é obrigatória.',
    ],
    proofPlaceholders: [
      d.proofNotes || 'Inserir depoimentos, métricas ou prints somente após verificação.',
      'Adicionar estudo de caso aprovado manualmente.',
      'Usar placeholders até existir prova real autorizada.',
    ],
    legalSafetyNotes: [
      'Não prometer renda, lucro ou resultado garantido.',
      'Não afirmar integrações, deploy ou checkout live.',
      'Incluir termos, privacidade e política de reembolso revisados por humano.',
    ],
    pageSections: [
      { section: 'Hero', purpose: 'Capturar atenção com promessa segura', copy: [`${product}`, promise] },
      { section: 'Problema', purpose: 'Mostrar entendimento do avatar', copy: [problem] },
      { section: 'Oferta', purpose: 'Explicar stack e entregáveis', copy: [offer] },
      {
        section: 'Prova',
        purpose: 'Reservar espaço sem fabricar credibilidade',
        copy: [d.proofNotes || 'Prova real pendente'],
      },
      { section: 'FAQ + CTA', purpose: 'Reduzir objeções e pedir ação manual', copy: [cta] },
    ],
    tailwindWireframe: [
      'Wrapper bg-[#05060a] text-white',
      'Hero rounded-3xl border border-[#d9a441]/30 bg-black/50',
      'Grid responsivo md:grid-cols-2 para problema/oferta',
      'CTA button bg-[#d9a441] text-black sem href de checkout real',
    ],
    humanApprovalChecklist: [
      'Revisar promessa e remover claims agressivos.',
      'Validar preço, oferta, prova e FAQ.',
      'Aprovar legal/safety antes de publicar manualmente.',
      'Confirmar que nenhum checkout real foi inserido.',
    ],
    riskWarnings: [
      'Risco de claim financeiro indevido se copy for editada sem revisão.',
      'Risco de confusão se placeholders forem apresentados como prova real.',
      'Risco operacional se alguém publicar sem checklist humano.',
    ],
    nextSteps: [
      'Revisar blueprint com operador.',
      'Gerar versão visual em ambiente local ou staging aprovado.',
      'Preparar APPFORGE-006 Content Factory MVP após aprovação.',
    ],
  };
}
export function buildLandingBuilderPrompt(draftInput: Partial<LandingBuilderDraft>): string {
  const payload = buildLandingContextPayload(draftInput);
  return `Você é o Landing Builder MVP da GXEON App Forge. Gere uma landing page blueprint manual-first, com aprovação humana obrigatória. Regras: no auto-deploy, no real checkout, no payment activation/no payment processing, no marketplace API calls, no guaranteed income claims, no live integrations, no auto-publish. Use este payload visível e sanitizado:\n${payload}\nRetorne hero, subheadline, avatar/problema, transformação, oferta, entregáveis, prova placeholder, FAQ, CTA manual-safe, notas legais, thank-you/next-step CTA e wireframe Tailwind.`;
}
export function buildLandingBuilderMarkdown(draftInput: Partial<LandingBuilderDraft>): string {
  const d = normalizeLandingBuilderDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const o = buildLandingBuilderOutput(d);
  const block = (title: string, lines: string[]) => `## ${title}\n${lines.map((l) => `- ${l}`).join('\n')}`;

  return [
    `# Landing Builder MVP — ${d.sourceProductIdea || 'Rascunho'}`,
    block('Hero', o.hero),
    block('Subheadline', o.subheadline),
    block('Avatar e problema', o.avatarProblem),
    block('Transformação', o.transformation),
    block('Oferta', o.offerStack),
    block('Entregáveis', o.deliverables),
    block('Preço', o.pricingBlock),
    block('CTA', o.ctaCopy),
    block('FAQ', o.faq),
    block('Prova placeholder', o.proofPlaceholders),
    block('Legal e safety', o.legalSafetyNotes),
    block('Checklist humano', o.humanApprovalChecklist),
    block('Riscos', o.riskWarnings),
    block('Próximos passos', o.nextSteps),
  ].join('\n\n');
}
export function buildLandingBuilderJson(
  draftInput: Partial<LandingBuilderDraft>,
  exportedAt = nowIso(),
): LandingBuilderExport {
  const draft = normalizeLandingBuilderDraft(draftInput, draftInput.updatedAt || exportedAt);
  return {
    draft,
    landing: buildLandingBuilderOutput(draft),
    contextPayload: buildLandingContextPayload(draft),
    prompt: buildLandingBuilderPrompt(draft),
    markdown: buildLandingBuilderMarkdown(draft),
    safety: {
      manualFirst: true,
      noGuaranteedIncome: true,
      noRealCheckout: true,
      noLivePayments: true,
      noAutoDeploy: true,
      noMarketplaceApiExecution: true,
      localOnlyDraft: true,
    },
    exportedAt,
  };
}
export function stringifyLandingBuilderJson(draftInput: Partial<LandingBuilderDraft>): string {
  return JSON.stringify(buildLandingBuilderJson(draftInput), null, 2);
}
