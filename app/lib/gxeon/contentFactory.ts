export const CONTENT_FACTORY_STORAGE_KEY = 'gxeon.contentFactory.draft.v1';
export const PRODUCT_BUILDER_DRAFT_STORAGE_KEY = 'gxeon.productBuilder.draft.v1';
export const MARKETPLACE_PACK_DRAFT_STORAGE_KEY = 'gxeon.marketplacePack.draft.v1';
export const CHECKOUT_BLUEPRINT_DRAFT_STORAGE_KEY = 'gxeon.checkoutBlueprint.draft.v1';
export const LANDING_BUILDER_STORAGE_KEY = 'gxeon.landingBuilder.draft.v1';
export const LANDING_BUILDER_DRAFT_STORAGE_KEY = LANDING_BUILDER_STORAGE_KEY;

export const LANDING_GOALS = ['waitlist', 'validation', 'sales_page', 'lead_capture', 'presale', 'internal'] as const;
export const CAMPAIGN_GOALS = [
  'awareness',
  'validation',
  'waitlist',
  'launch',
  'presale',
  'nurture',
  'retargeting',
  'internal',
] as const;
export const CAMPAIGN_TONES = [
  'premium',
  'direct',
  'technical',
  'popular',
  'institutional',
  'story',
  'authority',
] as const;
export const CONTENT_CHANNELS = [
  'Instagram',
  'LinkedIn',
  'YouTube Shorts',
  'Email',
  'WhatsApp manual',
  'Ads draft',
  'Launch calendar',
  'landing_page',
  'community',
] as const;
export const POSTING_CADENCES = ['3_days', '7_days', '14_days', '30_days'] as const;
export const CTA_MODES = [
  'manual_contact',
  'waitlist',
  'request_access',
  'checkout_later',
  'download_preview',
] as const;

export type LandingGoal = (typeof LANDING_GOALS)[number];
export type CampaignGoal = (typeof CAMPAIGN_GOALS)[number];
export type CampaignTone = (typeof CAMPAIGN_TONES)[number];
export type PostingCadence = (typeof POSTING_CADENCES)[number];
export type CtaMode = (typeof CTA_MODES)[number];

export interface ContentFactoryDraft {
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
  campaignGoal: CampaignGoal;
  campaignTone: CampaignTone;
  contentChannels: string[];
  postingCadence: PostingCadence;
  ctaMode: CtaMode;
  proofNotes: string;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFactoryOutput {
  positioning: string[];
  contentAngles: string[];
  instagramPosts: Array<{ title: string; caption: string; cta: string }>;
  linkedinPosts: Array<{ title: string; body: string; cta: string }>;
  youtubeShorts: Array<{ hook: string; script: string; cta: string }>;
  emailSequence: Array<{ subject: string; body: string; cta: string }>;
  whatsappManualFollowups: Array<{ label: string; message: string }>;
  adAngleDrafts: Array<{ angle: string; headline: string; body: string; safetyNote: string }>;
  launchCalendar: Array<{ day: string; task: string; channel: string; status: string }>;
  assetChecklist: string[];
  humanApprovalChecklist: string[];
  riskWarnings: string[];
  nextSteps: string[];
}

export interface ContentFactoryExport {
  draft: ContentFactoryDraft;
  content: ContentFactoryOutput;
  contextPayload: string;
  prompt: string;
  markdown: string;
  safety: {
    manualFirst: true;
    noGuaranteedIncome: true;
    noAutoPosting: true;
    noExternalSend: true;
    noSocialApiExecution: true;
    noEmailApiExecution: true;
    noWhatsAppApiExecution: true;
    localOnlyDraft: true;
  };
  exportedAt: string;
}

export type ContentFactoryRecommendedField =
  | 'sourceProductIdea'
  | 'sourceAudience'
  | 'sourceOfferOrPromise'
  | 'contentChannels'
  | 'ctaMode';
export interface ContentFactoryValidationResult {
  missingRecommendedFields: ContentFactoryRecommendedField[];
  isStrongContentFactoryReady: boolean;
}

const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';
const OPEN_TAG = '<gxeon_content_context_payload>';
const CLOSE_TAG = '</gxeon_content_context_payload>';
const SECRET_KEYS =
  /api_?key|apikey|token|access_token|refresh_token|secret|client_secret|password|credential|cookie|stripe_key|webhook_secret|social_token|email_api_key|whatsapp_token|ads_token/i;
const CTA_LABELS: Record<CtaMode, string> = {
  manual_contact: 'fale com um operador',
  waitlist: 'entre na lista de espera',
  request_access: 'solicite acesso',
  checkout_later: 'revise a oferta antes do checkout',
  download_preview: 'baixe a prévia',
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

export function sanitizeContentContextValue(value: unknown): string {
  return clean(value)
    .replaceAll(OPEN_TAG, '[gxeon_content_context_payload]')
    .replaceAll(CLOSE_TAG, '[/gxeon_content_context_payload]')
    .replace(/[<>]/g, (m) => (m === '<' ? '‹' : '›'));
}

export function createEmptyContentFactoryDraft(now = nowIso()): ContentFactoryDraft {
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
    campaignGoal: 'validation',
    campaignTone: 'direct',
    contentChannels: [],
    postingCadence: '7_days',
    ctaMode: 'manual_contact',
    proofNotes: '',
    approvalNotes: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeContentFactoryDraft(input: Partial<ContentFactoryDraft>, now = nowIso()): ContentFactoryDraft {
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
    campaignGoal: ensure(CAMPAIGN_GOALS, input.campaignGoal, 'validation'),
    campaignTone: ensure(CAMPAIGN_TONES, input.campaignTone, 'direct'),
    contentChannels: cleanList(input.contentChannels),
    postingCadence: ensure(POSTING_CADENCES, input.postingCadence, '7_days'),
    ctaMode: ensure(CTA_MODES, input.ctaMode, 'manual_contact'),
    proofNotes: clean(input.proofNotes),
    approvalNotes: clean(input.approvalNotes),
    createdAt: clean(input.createdAt) || now,
    updatedAt: now,
  };
}

export function validateContentFactoryDraft(input: Partial<ContentFactoryDraft>): ContentFactoryValidationResult {
  const missing: ContentFactoryRecommendedField[] = [];

  if (!clean(input.sourceProductIdea)) {
    missing.push('sourceProductIdea');
  }

  if (!clean(input.sourceAudience)) {
    missing.push('sourceAudience');
  }

  if (!clean(input.sourceOffer) && !clean(input.sourcePromise)) {
    missing.push('sourceOfferOrPromise');
  }

  if (!cleanList(input.contentChannels).length) {
    missing.push('contentChannels');
  }

  if (!clean(input.ctaMode)) {
    missing.push('ctaMode');
  }

  return { missingRecommendedFields: missing, isStrongContentFactoryReady: missing.length === 0 };
}

export function buildContentContextPayload(draftInput: Partial<ContentFactoryDraft>): string {
  const d = normalizeContentFactoryDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const safe = {
    product: d.sourceProductIdea,
    niche: d.sourceNiche,
    audience: d.sourceAudience,
    problem: d.sourceProblem,
    offer: d.sourceOffer,
    promise: d.sourcePromise,
    price: d.basePrice,
    deliveryFormat: d.deliveryFormat,
    platforms: d.selectedPlatforms,
    landingGoal: d.landingGoal,
    campaignGoal: d.campaignGoal,
    campaignTone: d.campaignTone,
    ctaMode: d.ctaMode,
    contentChannels: d.contentChannels,
    postingCadence: d.postingCadence,
    proofNotes: d.proofNotes,
    approvalNotes: d.approvalNotes,
    safety: {
      manualFirst: true,
      noAutoPosting: true,
      noExternalSend: true,
      noSocialApiCalls: true,
      noEmailApiCalls: true,
      noWhatsAppApiCalls: true,
      noAdsApiCalls: true,
    },
  };
  const json = JSON.stringify(safe, (key, value) =>
    SECRET_KEYS.test(key) ? undefined : typeof value === 'string' ? sanitizeContentContextValue(value) : value,
  );

  return `${OPEN_TAG}${json}${CLOSE_TAG}`;
}

export function buildContentFactoryOutput(draftInput: Partial<ContentFactoryDraft>): ContentFactoryOutput {
  const d = normalizeContentFactoryDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const product = d.sourceProductIdea || 'produto digital GXEON';
  const audience = d.sourceAudience || 'público a validar manualmente';
  const problem = d.sourceProblem || 'problema principal ainda em validação';
  const offer = d.sourceOffer || product;
  const promise = d.sourcePromise || 'organizar a execução com aprovação humana, sem prometer resultados garantidos';
  const cta = CTA_LABELS[d.ctaMode];
  const proof = d.proofNotes || 'PLACEHOLDER DE PROVA: adicionar evidência real somente após verificação.';

  return {
    positioning: [
      `${product} para ${audience}.`,
      `Problema: ${problem}.`,
      `Promessa segura: ${promise}.`,
      `Oferta: ${offer}; preço-base: ${d.basePrice || 'a validar'}.`,
    ],
    contentAngles: [
      'Dor principal sem sensacionalismo',
      'Bastidores da construção manual-first',
      'Comparativo antes/depois sem garantia',
      'Objeções e respostas',
      'Prova verificada ou placeholder explícito',
      'Convite para validação humana',
    ],
    instagramPosts: [
      {
        title: 'Dor principal',
        caption: `${audience}: se ${problem} está travando sua execução, este rascunho organiza a próxima conversa. ${proof}`,
        cta,
      },
      {
        title: 'Bastidores',
        caption: `Estamos estruturando ${product} com oferta, CTA e revisão humana antes de qualquer publicação.`,
        cta,
      },
    ],
    linkedinPosts: [
      {
        title: `Por que ${product} existe`,
        body: `Para ${audience}, o custo de improvisar é alto. A proposta é transformar ${problem} em um plano revisável, manual-first e sem automações de envio.`,
        cta,
      },
      {
        title: 'Blueprint de lançamento seguro',
        body: `Oferta: ${offer}. Promessa: ${promise}. Próximo passo: revisão humana de claims, prova e CTA.`,
        cta,
      },
    ],
    youtubeShorts: [
      {
        hook: `Você ainda está tentando vender ${product} sem uma narrativa?`,
        script: `Cena 1: mostre o problema (${problem}). Cena 2: apresente a oferta (${offer}). Cena 3: explique que tudo passa por aprovação humana antes de publicar ou enviar.`,
        cta,
      },
      {
        hook: '3 pontos para revisar antes do lançamento',
        script:
          'Cheque promessa, prova e CTA. Remova qualquer garantia de renda, cura, resultado legal ou investimento. Use canais manuais primeiro.',
        cta,
      },
    ],
    emailSequence: [
      {
        subject: `Convite para revisar ${product}`,
        body: `Olá, estamos validando ${offer} para ${audience}. Este email é um rascunho para envio manual, sem automação em massa.`,
        cta,
      },
      {
        subject: 'O problema que estamos resolvendo',
        body: `O foco é ${problem}. A promessa revisável é: ${promise}.`,
        cta,
      },
      {
        subject: 'Próxima etapa manual',
        body: 'Se fizer sentido, responda manualmente para revisar a prévia ou solicitar acesso.',
        cta,
      },
    ],
    whatsappManualFollowups: [
      {
        label: 'Primeiro contato manual',
        message: `Oi! Estou validando ${product} para ${audience}. Posso te enviar uma prévia para revisão manual?`,
      },
      {
        label: 'Follow-up sem spam',
        message: `Passando só para confirmar se você quer revisar ${offer}. Sem envio automático; responda quando fizer sentido.`,
      },
    ],
    adAngleDrafts: [
      {
        angle: 'Dor + clareza',
        headline: `Organize ${problem}`,
        body: `Rascunho de anúncio para revisão humana. Posicione ${product} sem promessa garantida.`,
        safetyNote: 'Revisar claims, segmentação, prova, política da plataforma e CTA antes de usar manualmente.',
      },
      {
        angle: 'Validação',
        headline: `Prévia de ${product}`,
        body: 'Convite para solicitar acesso ou entrar em waitlist; sem falsa escassez ou depoimentos inventados.',
        safetyNote: 'Não criar campanha automaticamente; usar somente após aprovação humana e revisão legal.',
      },
    ],
    launchCalendar: ['D-7', 'D-5', 'D-3', 'D-1', 'D0'].map((day, i) => ({
      day,
      task: [
        'Revisar claims e ativos',
        'Post educacional',
        'Email manual de validação',
        'Checklist final',
        'Publicação manual aprovada',
      ][i],
      channel: d.contentChannels[i % Math.max(d.contentChannels.length, 1)] || 'manual',
      status: 'rascunho local — não agendado',
    })),
    assetChecklist: [
      'Criativos quadrados e verticais',
      'Landing/copy revisada',
      'Lista manual de contatos autorizados',
      'Provas verificadas ou placeholders marcados',
      'Termos e políticas revisados',
    ],
    humanApprovalChecklist: [
      'Revisar claims de renda, saúde, jurídico e financeiro.',
      'Validar prova e remover placeholders antes do uso público.',
      'Aprovar CTA, oferta, preço e segmentação.',
      'Confirmar regras de cada plataforma.',
      'Confirmar que nenhum envio/post/ads será automatizado neste MVP.',
    ],
    riskWarnings: [
      'Não usar como spam ou disparo em massa.',
      'Não fabricar depoimentos, prints, endossos ou escassez.',
      'Não prometer renda, cura, resultado legal ou retorno financeiro.',
      'Não afirmar publicação, agendamento, impulsionamento ou integração live.',
    ],
    nextSteps: [
      'Gerar prompt e revisar no Composer sem auto-envio.',
      'Ajustar copy com operador humano.',
      'Exportar JSON/Markdown para documentação.',
      'Preparar Integration Readiness sem ativar distribuição real.',
    ],
  };
}

export function buildContentFactoryPrompt(draftInput: Partial<ContentFactoryDraft>): string {
  return `Você é o Content Factory MVP da GXEON App Forge. Gere um content pack manual-first com aprovação humana obrigatória. Regras obrigatórias: no auto-posting, no external send, no social API calls/no-social-api, no email API calls/no-email-api, no WhatsApp API calls/no-whatsapp-api, no ads API calls, no guaranteed income claims, no medical/legal/financial promises, human approval required. Use este payload visível e sanitizado:\n${buildContentContextPayload(draftInput)}\nRetorne positioning, content angles, Instagram posts, LinkedIn posts, YouTube Shorts, email sequence manual, WhatsApp manual follow-up, ad angle drafts com safetyNote, launch calendar, asset checklist, human approval checklist, risks e next steps.`;
}

function block(title: string, lines: string[]) {
  return `## ${title}\n${lines.map((l) => `- ${l}`).join('\n')}`;
}

function objBlock(title: string, rows: unknown[]) {
  return `## ${title}\n\`\`\`json\n${JSON.stringify(rows, null, 2)}\n\`\`\``;
}

export function buildContentFactoryMarkdown(draftInput: Partial<ContentFactoryDraft>): string {
  const d = normalizeContentFactoryDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const o = buildContentFactoryOutput(d);

  return [
    `# Content Factory MVP — ${d.sourceProductIdea || 'Rascunho'}`,
    block('Positioning', o.positioning),
    block('Content Angles', o.contentAngles),
    objBlock('Instagram posts', o.instagramPosts),
    objBlock('LinkedIn posts', o.linkedinPosts),
    objBlock('YouTube Shorts', o.youtubeShorts),
    objBlock('Email sequence', o.emailSequence),
    objBlock('WhatsApp manual follow-ups', o.whatsappManualFollowups),
    objBlock('Ad angle drafts', o.adAngleDrafts),
    objBlock('Launch calendar', o.launchCalendar),
    block('Asset checklist', o.assetChecklist),
    block('Human approval checklist', o.humanApprovalChecklist),
    block('Risk warnings', o.riskWarnings),
    block('Next steps', o.nextSteps),
  ].join('\n\n');
}
export function buildContentFactoryJson(
  draftInput: Partial<ContentFactoryDraft>,
  exportedAt = nowIso(),
): ContentFactoryExport {
  const draft = normalizeContentFactoryDraft(draftInput, draftInput.updatedAt || exportedAt);
  return {
    draft,
    content: buildContentFactoryOutput(draft),
    contextPayload: buildContentContextPayload(draft),
    prompt: buildContentFactoryPrompt(draft),
    markdown: buildContentFactoryMarkdown(draft),
    safety: {
      manualFirst: true,
      noGuaranteedIncome: true,
      noAutoPosting: true,
      noExternalSend: true,
      noSocialApiExecution: true,
      noEmailApiExecution: true,
      noWhatsAppApiExecution: true,
      localOnlyDraft: true,
    },
    exportedAt,
  };
}
export function stringifyContentFactoryJson(draftInput: Partial<ContentFactoryDraft>): string {
  return JSON.stringify(buildContentFactoryJson(draftInput), null, 2);
}
