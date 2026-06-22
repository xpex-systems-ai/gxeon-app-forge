export const CHECKOUT_BLUEPRINT_STORAGE_KEY = 'gxeon.checkoutBlueprint.draft.v1';
export const PRODUCT_BUILDER_DRAFT_STORAGE_KEY = 'gxeon.productBuilder.draft.v1';
export const MARKETPLACE_PACK_DRAFT_STORAGE_KEY = 'gxeon.marketplacePack.draft.v1';

export const CHECKOUT_GOALS = ['validation', 'presale', 'launch', 'evergreen', 'beta', 'internal'] as const;
export const PRICING_MODELS = [
  'one_time',
  'subscription',
  'installment',
  'freemium',
  'consultation',
  'hybrid',
] as const;
export const CHECKOUT_PLATFORMS = [
  'hotmart',
  'kiwify',
  'eduzz',
  'braip',
  'perfect_pay',
  'monetizze',
  'stripe',
  'mercado_pago',
  'shopify',
  'woocommerce',
  'clickbank',
  'gumroad',
  'lemon_squeezy',
  'generic',
] as const;

export type CheckoutGoal = (typeof CHECKOUT_GOALS)[number];
export type PricingModel = (typeof PRICING_MODELS)[number];
export type CheckoutPlatform = (typeof CHECKOUT_PLATFORMS)[number];

export interface CheckoutBlueprintDraft {
  sourceProductIdea: string;
  sourceNiche: string;
  sourceAudience: string;
  sourceProblem: string;
  sourceOffer: string;
  sourcePromise: string;
  basePrice: string;
  deliveryFormat: string;
  selectedPlatforms: CheckoutPlatform[];
  marketplaceCategory: string;
  tone: string;
  checkoutGoal: CheckoutGoal;
  pricingModel: PricingModel;
  guaranteePolicy: string;
  supportModel: string;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
}
export interface CheckoutBlueprintOutput {
  pricingHypothesis: string[];
  plans: Array<{ name: string; price: string; positioning: string; includes: string[] }>;
  orderBumps: string[];
  upsells: string[];
  downsells: string[];
  checkoutPageCopy: string[];
  thankYouPage: string[];
  guaranteeAndRefund: string[];
  supportAndDelivery: string[];
  platformNotes: Record<string, string[]>;
  humanApprovalChecklist: string[];
  riskWarnings: string[];
  nextSteps: string[];
}
export interface CheckoutBlueprintExport {
  draft: CheckoutBlueprintDraft;
  blueprint: CheckoutBlueprintOutput;
  contextPayload: string;
  prompt: string;
  markdown: string;
  safety: {
    manualFirst: true;
    noGuaranteedIncome: true;
    noRealCheckout: true;
    noLivePayments: true;
    noGatewayApiExecution: true;
    noMarketplaceApiExecution: true;
    localOnlyDraft: true;
  };
  exportedAt: string;
}
export type CheckoutBlueprintRecommendedField =
  | 'sourceProductIdea'
  | 'sourceAudience'
  | 'sourceOfferOrPromise'
  | 'basePrice'
  | 'pricingModel';
export interface CheckoutBlueprintValidationResult {
  missingRecommendedFields: CheckoutBlueprintRecommendedField[];
  isStrongCheckoutBlueprintReady: boolean;
}

const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';
const OPEN_TAG = '<gxeon_checkout_context_payload>';
const CLOSE_TAG = '</gxeon_checkout_context_payload>';
export const CHECKOUT_PLATFORM_LABELS: Record<CheckoutPlatform, string> = {
  hotmart: 'Hotmart',
  kiwify: 'Kiwify',
  eduzz: 'Eduzz',
  braip: 'Braip',
  perfect_pay: 'Perfect Pay',
  monetizze: 'Monetizze',
  stripe: 'Stripe',
  mercado_pago: 'Mercado Pago',
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  clickbank: 'ClickBank',
  gumroad: 'Gumroad',
  lemon_squeezy: 'Lemon Squeezy',
  generic: 'Generic',
};

const GOAL_LABELS: Record<CheckoutGoal, string> = {
  validation: 'validação',
  presale: 'pré-venda',
  launch: 'lançamento',
  evergreen: 'evergreen',
  beta: 'beta',
  internal: 'uso interno',
};
const PRICING_LABELS: Record<PricingModel, string> = {
  one_time: 'pagamento único',
  subscription: 'assinatura',
  installment: 'parcelamento manual',
  freemium: 'freemium',
  consultation: 'consulta/diagnóstico',
  hybrid: 'híbrido',
};

function nowIso() {
  return new Date().toISOString();
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function ensureGoal(value: unknown): CheckoutGoal {
  return CHECKOUT_GOALS.includes(value as CheckoutGoal) ? (value as CheckoutGoal) : 'validation';
}

function ensurePricing(value: unknown): PricingModel {
  return PRICING_MODELS.includes(value as PricingModel) ? (value as PricingModel) : 'one_time';
}

function cleanPlatforms(values: unknown): CheckoutPlatform[] {
  const input = Array.isArray(values) ? values : clean(values).split(',');
  return Array.from(
    new Set(input.filter((item): item is CheckoutPlatform => CHECKOUT_PLATFORMS.includes(item as CheckoutPlatform))),
  );
}

export function sanitizeCheckoutContextValue(value: unknown): string {
  return clean(value)
    .replaceAll(OPEN_TAG, '[gxeon_checkout_context_payload]')
    .replaceAll(CLOSE_TAG, '[/gxeon_checkout_context_payload]')
    .replace(/[<>]/g, (m) => (m === '<' ? '‹' : '›'));
}
export function createEmptyCheckoutBlueprintDraft(now = nowIso()): CheckoutBlueprintDraft {
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
    marketplaceCategory: '',
    tone: 'direct',
    checkoutGoal: 'validation',
    pricingModel: 'one_time',
    guaranteePolicy: '',
    supportModel: '',
    approvalNotes: '',
    createdAt: now,
    updatedAt: now,
  };
}
export function normalizeCheckoutBlueprintDraft(
  input: Partial<CheckoutBlueprintDraft>,
  now = nowIso(),
): CheckoutBlueprintDraft {
  return {
    sourceProductIdea: clean(input.sourceProductIdea),
    sourceNiche: clean(input.sourceNiche),
    sourceAudience: clean(input.sourceAudience),
    sourceProblem: clean(input.sourceProblem),
    sourceOffer: clean(input.sourceOffer),
    sourcePromise: clean(input.sourcePromise),
    basePrice: clean(input.basePrice),
    deliveryFormat: clean(input.deliveryFormat),
    selectedPlatforms: cleanPlatforms(input.selectedPlatforms),
    marketplaceCategory: clean(input.marketplaceCategory),
    tone: clean(input.tone) || 'direct',
    checkoutGoal: ensureGoal(input.checkoutGoal),
    pricingModel: ensurePricing(input.pricingModel),
    guaranteePolicy: clean(input.guaranteePolicy),
    supportModel: clean(input.supportModel),
    approvalNotes: clean(input.approvalNotes),
    createdAt: clean(input.createdAt) || now,
    updatedAt: now,
  };
}
export function validateCheckoutBlueprintDraft(
  input: Partial<CheckoutBlueprintDraft>,
): CheckoutBlueprintValidationResult {
  const missing: CheckoutBlueprintRecommendedField[] = [];

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

  if (!ensurePricing(input.pricingModel)) {
    missing.push('pricingModel');
  }

  return { missingRecommendedFields: missing, isStrongCheckoutBlueprintReady: missing.length === 0 };
}
export function buildCheckoutContextPayload(draftInput: Partial<CheckoutBlueprintDraft>): string {
  const d = normalizeCheckoutBlueprintDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const payload = {
    product: sanitizeCheckoutContextValue(d.sourceProductIdea),
    audience: sanitizeCheckoutContextValue(d.sourceAudience),
    problem: sanitizeCheckoutContextValue(d.sourceProblem),
    offer: sanitizeCheckoutContextValue(d.sourceOffer),
    promise: sanitizeCheckoutContextValue(d.sourcePromise),
    price: sanitizeCheckoutContextValue(d.basePrice),
    platforms: d.selectedPlatforms.map((p) => CHECKOUT_PLATFORM_LABELS[p]),
    deliveryFormat: sanitizeCheckoutContextValue(d.deliveryFormat),
    marketplaceCategory: sanitizeCheckoutContextValue(d.marketplaceCategory),
    tone: sanitizeCheckoutContextValue(d.tone),
    checkoutGoal: d.checkoutGoal,
    pricingModel: d.pricingModel,
  };

  return `${OPEN_TAG}${JSON.stringify(payload, null, 2)}${CLOSE_TAG}`;
}

function platformNotes(platforms: CheckoutPlatform[]): Record<string, string[]> {
  const selected = platforms.length ? platforms : ['generic' as CheckoutPlatform];
  return Object.fromEntries(
    selected.map((p) => [
      CHECKOUT_PLATFORM_LABELS[p],
      [
        `Preparar configuração apenas manual; não gerar link real nem ativar pagamento em ${CHECKOUT_PLATFORM_LABELS[p]}.`,
        'Conferir preço, moeda, impostos, termos, suporte e política de reembolso antes de qualquer ativação humana.',
        'Não usar API, OAuth, tokens, webhooks ou publicação automática nesta versão.',
      ],
    ]),
  );
}

export function buildCheckoutBlueprintOutput(draftInput: CheckoutBlueprintDraft): CheckoutBlueprintOutput {
  const d = normalizeCheckoutBlueprintDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const product = d.sourceProductIdea || 'Produto digital';
  const price = d.basePrice || 'preço a validar manualmente';
  const offer = d.sourceOffer || d.sourcePromise || 'oferta a lapidar';

  return {
    pricingHypothesis: [
      `Hipótese principal: ${price} para ${offer}, validada por conversa manual antes de checkout real.`,
      `Modelo sugerido: ${PRICING_LABELS[d.pricingModel]} em fase de ${GOAL_LABELS[d.checkoutGoal]}.`,
      'Testar percepção de valor com 5-10 leads antes de configurar pagamentos reais.',
    ],
    plans: [
      {
        name: 'Essencial',
        price,
        positioning: 'Entrada segura para validar demanda.',
        includes: [d.deliveryFormat || 'Entrega principal', 'Checklist de implementação', 'Suporte básico manual'],
      },
      {
        name: 'Pro',
        price: `${price} + bônus`,
        positioning: 'Mais valor percebido sem prometer renda.',
        includes: ['Entrega principal', 'Templates extras', 'Sessão/grupo de onboarding manual'],
      },
      {
        name: 'Premium',
        price: 'Definir após validação',
        positioning: 'Alto toque para clientes que precisam de acompanhamento.',
        includes: ['Tudo do Pro', 'Revisão individual', 'Plano de ação pós-compra'],
      },
    ],
    orderBumps: [
      `Checklist rápido para aplicar ${product}.`,
      'Template complementar de implementação.',
      'Mini-aula de primeiros passos sem promessa financeira.',
    ],
    upsells: [
      'Sessão estratégica manual pós-compra.',
      'Pacote avançado de templates e exemplos.',
      'Acompanhamento em grupo por período definido.',
    ],
    downsells: [
      'Versão starter com menos bônus.',
      'Plano de pagamento manualmente aprovado.',
      'Oferta de entrada com entrega assíncrona.',
    ],
    checkoutPageCopy: [
      `Headline: adquira ${product} com entrega clara e revisão humana.`,
      `Subheadline: solução para ${d.sourceAudience || 'público validado'} sem prometer renda ou resultado garantido.`,
      'CTA manual sugerido: Solicitar acesso / Confirmar interesse — sem link real neste MVP.',
    ],
    thankYouPage: [
      'Confirmação do pedido após aprovação manual.',
      'Resumo do que foi comprado e prazo de entrega.',
      'Próximo passo de onboarding e canal de suporte.',
      'Aviso de que suporte não substitui aconselhamento legal/financeiro.',
    ],
    guaranteeAndRefund: [
      d.guaranteePolicy || 'Definir política de garantia/reembolso com jurídico antes de publicar.',
      'Evitar garantias de renda, lucro ou resultado específico.',
      'Informar prazos, condições e canal de solicitação.',
    ],
    supportAndDelivery: [
      d.supportModel || 'Definir suporte por e-mail/comunidade com SLA manual.',
      `Formato: ${d.deliveryFormat || 'a confirmar'}.`,
      'Enviar acesso somente após aprovação humana e confirmação operacional.',
    ],
    platformNotes: platformNotes(d.selectedPlatforms),
    humanApprovalChecklist: [
      'Aprovar preço, moeda e impostos.',
      'Aprovar garantia/reembolso com jurídico.',
      'Aprovar bump, upsell, downsell e copy.',
      'Confirmar que nenhum checkout real foi criado por este MVP.',
      'Aprovar manualmente qualquer configuração de pagamento futura.',
    ],
    riskWarnings: [
      'Não criar link de checkout real nesta etapa.',
      'Não ativar pagamento, gateway, OAuth, webhook ou API de marketplace.',
      'Não fazer promessa de renda garantida.',
      'Revisar LGPD/termos/tributos antes da venda real.',
    ],
    nextSteps: [
      'Validar oferta por conversa manual.',
      'Revisar blueprint com decisor humano.',
      'Preparar Landing Builder APPFORGE-005.',
      'Somente depois, configurar checkout real em missão específica aprovada.',
    ],
  };
}
export function buildCheckoutBlueprintPrompt(draftInput: CheckoutBlueprintDraft): string {
  const d = normalizeCheckoutBlueprintDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  return `Você é Estrategista de precificação, CRO, arquitetura de checkout manual, pós-compra e compliance comercial.\n\nRegras obrigatórias: manual-first; no real checkout; no payment activation; no gateway API calls; no marketplace API calls; no guaranteed income claims; no auto-publishing. Exigir aprovação humana antes de preço, checkout, garantia, upsell ou configuração de pagamento.\n\n${buildCheckoutContextPayload(d)}\n\nGere um Checkout Blueprint com hipótese de preço, planos, order bumps, upsells, downsells, copy de checkout, thank-you page, garantia/reembolso, suporte/entrega, notas por plataforma, checklist de aprovação humana, riscos e próximos passos.`;
}
export function buildCheckoutBlueprintMarkdown(draftInput: CheckoutBlueprintDraft): string {
  const d = normalizeCheckoutBlueprintDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const b = buildCheckoutBlueprintOutput(d);
  const list = (items: string[]) => items.map((i) => `- ${i}`).join('\n');
  const plans = b.plans.map((p) => `### ${p.name} — ${p.price}\n${p.positioning}\n${list(p.includes)}`).join('\n\n');

  return `# Checkout Blueprint MVP\n\n> Manual-first: sem checkout real, sem pagamentos ao vivo, sem gateways, sem APIs de marketplace e sem promessas de renda.\n\n## Contexto\n- Produto: ${d.sourceProductIdea || 'A validar'}\n- Público: ${d.sourceAudience || 'A validar'}\n- Preço-base: ${d.basePrice || 'A validar'}\n\n## Hipóteses de preço\n${list(b.pricingHypothesis)}\n\n## Planos\n${plans}\n\n## Order bumps\n${list(b.orderBumps)}\n\n## Upsells\n${list(b.upsells)}\n\n## Downsells\n${list(b.downsells)}\n\n## Copy de checkout manual\n${list(b.checkoutPageCopy)}\n\n## Thank-you page\n${list(b.thankYouPage)}\n\n## Garantia e reembolso\n${list(b.guaranteeAndRefund)}\n\n## Suporte e entrega\n${list(b.supportAndDelivery)}\n\n## Aprovação humana\n${list(b.humanApprovalChecklist)}\n\n## Riscos\n${list(b.riskWarnings)}\n\n## Próximos passos\n${list(b.nextSteps)}\n\n## Prompt\n\n${buildCheckoutBlueprintPrompt(d)}\n`;
}
export function buildCheckoutBlueprintJson(
  draftInput: CheckoutBlueprintDraft,
  exportedAt = nowIso(),
): CheckoutBlueprintExport {
  const draft = normalizeCheckoutBlueprintDraft(draftInput, draftInput.updatedAt || exportedAt);
  return {
    draft,
    blueprint: buildCheckoutBlueprintOutput(draft),
    contextPayload: buildCheckoutContextPayload(draft),
    prompt: buildCheckoutBlueprintPrompt(draft),
    markdown: buildCheckoutBlueprintMarkdown(draft),
    safety: {
      manualFirst: true,
      noGuaranteedIncome: true,
      noRealCheckout: true,
      noLivePayments: true,
      noGatewayApiExecution: true,
      noMarketplaceApiExecution: true,
      localOnlyDraft: true,
    },
    exportedAt,
  };
}
export function stringifyCheckoutBlueprintJson(draftInput: CheckoutBlueprintDraft): string {
  return JSON.stringify(buildCheckoutBlueprintJson(draftInput), null, 2);
}
