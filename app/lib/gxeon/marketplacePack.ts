export const MARKETPLACE_PACK_STORAGE_KEY = 'gxeon.marketplacePack.draft.v1';
export const PRODUCT_BUILDER_DRAFT_STORAGE_KEY = 'gxeon.productBuilder.draft.v1';

export const MARKETPLACE_PLATFORMS = [
  'hotmart',
  'kiwify',
  'eduzz',
  'monetizze',
  'braip',
  'perfect_pay',
  'clickbank',
  'gumroad',
  'lemon_squeezy',
  'mercado_livre',
  'shopee',
  'shopify',
  'woocommerce',
  'generic',
] as const;

export const MARKETPLACE_PACK_TONES = [
  'direct',
  'premium',
  'technical',
  'popular',
  'institutional',
  'persuasive',
] as const;

export type MarketplacePlatform = (typeof MARKETPLACE_PLATFORMS)[number];
export type MarketplacePackTone = (typeof MARKETPLACE_PACK_TONES)[number];

export const MARKETPLACE_PLATFORM_LABELS: Record<MarketplacePlatform, string> = {
  hotmart: 'Hotmart',
  kiwify: 'Kiwify',
  eduzz: 'Eduzz',
  monetizze: 'Monetizze',
  braip: 'Braip',
  perfect_pay: 'Perfect Pay',
  clickbank: 'ClickBank',
  gumroad: 'Gumroad',
  lemon_squeezy: 'Lemon Squeezy',
  mercado_livre: 'Mercado Livre',
  shopee: 'Shopee',
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  generic: 'Generic Marketplace',
};

export const MARKETPLACE_PACK_RECOMMENDED_FIELDS = [
  'sourceProductIdea',
  'sourceNiche',
  'sourceAudience',
  'sourceOfferOrPromise',
  'selectedPlatforms',
] as const;

export type MarketplacePackRecommendedField = (typeof MARKETPLACE_PACK_RECOMMENDED_FIELDS)[number];

export interface MarketplacePackValidationResult {
  missingRecommendedFields: MarketplacePackRecommendedField[];
  isStrongMarketplacePackReady: boolean;
}

export interface MarketplacePackDraft {
  sourceProductIdea: string;
  sourceNiche: string;
  sourceAudience: string;
  sourceProblem: string;
  sourceOffer: string;
  sourcePromise: string;
  sourcePrice: string;
  deliveryFormat: string;
  selectedPlatforms: MarketplacePlatform[];
  mainCategory: string;
  tone: MarketplacePackTone;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplacePackOutput {
  productTitle: string;
  shortDescription: string;
  longDescription: string;
  seoTitle: string;
  seoDescription: string;
  categories: string[];
  tags: string[];
  faq: string[];
  guaranteeNotes: string[];
  assetChecklist: string[];
  affiliateCopy: string[];
  launchPosts: string[];
  platformChecklist: Record<MarketplacePlatform, string[]>;
  humanApprovalChecklist: string[];
  riskWarnings: string[];
  nextSteps: string[];
}

export interface MarketplacePackExport {
  draft: MarketplacePackDraft;
  pack: MarketplacePackOutput;
  prompt: string;
  markdown: string;
  safety: {
    manualFirst: true;
    noGuaranteedIncome: true;
    noAutoPublishing: true;
    noLivePayments: true;
    noMarketplaceApiExecution: true;
    localOnlyDraft: true;
  };
  exportedAt: string;
}

const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';

const TONE_LABELS: Record<MarketplacePackTone, string> = {
  direct: 'direto',
  premium: 'premium',
  technical: 'técnico',
  popular: 'popular',
  institutional: 'institucional',
  persuasive: 'persuasivo',
};

function nowIso() {
  return new Date().toISOString();
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanPlatforms(values: unknown): MarketplacePlatform[] {
  const input = Array.isArray(values) ? values : clean(values).split(',');
  return Array.from(
    new Set(
      input.filter((item): item is MarketplacePlatform => MARKETPLACE_PLATFORMS.includes(item as MarketplacePlatform)),
    ),
  );
}

function ensureTone(value: unknown): MarketplacePackTone {
  return MARKETPLACE_PACK_TONES.includes(value as MarketplacePackTone) ? (value as MarketplacePackTone) : 'direct';
}

export function createEmptyMarketplacePackDraft(now = nowIso()): MarketplacePackDraft {
  return {
    sourceProductIdea: '',
    sourceNiche: '',
    sourceAudience: '',
    sourceProblem: '',
    sourceOffer: '',
    sourcePromise: '',
    sourcePrice: '',
    deliveryFormat: '',
    selectedPlatforms: [],
    mainCategory: '',
    tone: 'direct',
    approvalNotes: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeMarketplacePackDraft(
  input: Partial<MarketplacePackDraft>,
  now = nowIso(),
): MarketplacePackDraft {
  return {
    sourceProductIdea: clean(input.sourceProductIdea),
    sourceNiche: clean(input.sourceNiche),
    sourceAudience: clean(input.sourceAudience),
    sourceProblem: clean(input.sourceProblem),
    sourceOffer: clean(input.sourceOffer),
    sourcePromise: clean(input.sourcePromise),
    sourcePrice: clean(input.sourcePrice),
    deliveryFormat: clean(input.deliveryFormat),
    selectedPlatforms: cleanPlatforms(input.selectedPlatforms),
    mainCategory: clean(input.mainCategory),
    tone: ensureTone(input.tone),
    approvalNotes: clean(input.approvalNotes),
    createdAt: clean(input.createdAt) || now,
    updatedAt: now,
  };
}

export function validateMarketplacePackDraft(input: Partial<MarketplacePackDraft>): MarketplacePackValidationResult {
  const draft = normalizeMarketplacePackDraft(input, input.updatedAt || FALLBACK_DATE);
  const missingRecommendedFields: MarketplacePackRecommendedField[] = [];

  if (!draft.sourceProductIdea) {
    missingRecommendedFields.push('sourceProductIdea');
  }

  if (!draft.sourceNiche) {
    missingRecommendedFields.push('sourceNiche');
  }

  if (!draft.sourceAudience) {
    missingRecommendedFields.push('sourceAudience');
  }

  if (!draft.sourceOffer && !draft.sourcePromise) {
    missingRecommendedFields.push('sourceOfferOrPromise');
  }

  if (!draft.selectedPlatforms.length) {
    missingRecommendedFields.push('selectedPlatforms');
  }

  return { missingRecommendedFields, isStrongMarketplacePackReady: missingRecommendedFields.length === 0 };
}

function checklistForPlatform(platform: MarketplacePlatform): string[] {
  const shared = [
    'Revisar manualmente termos, políticas, categoria e campos obrigatórios antes de qualquer publicação.',
  ];

  if (['hotmart', 'kiwify', 'eduzz', 'monetizze', 'braip', 'perfect_pay'].includes(platform)) {
    return [
      'Conferir campos de produto digital, descrição, suporte, garantia e termos.',
      'Preparar página de vendas e criativos sem ativar checkout real.',
      'Revisar configuração de afiliados manualmente, se aplicável.',
      ...shared,
    ];
  }

  if (['mercado_livre', 'shopee'].includes(platform)) {
    return [
      'Validar se o formato do produto é aceito pela política da plataforma.',
      'Preparar imagens, título dentro do limite e clareza de entrega/envio.',
      'Conferir reputação, suporte, reembolso e regras de produto digital/físico.',
      ...shared,
    ];
  }

  if (['shopify', 'woocommerce'].includes(platform)) {
    return [
      'Preparar página de loja e página do produto com políticas legais.',
      'Revisar checkout, impostos, frete/entrega e emails antes de ativar pagamentos.',
      'Confirmar que nenhum gateway está sendo configurado por este MVP.',
      ...shared,
    ];
  }

  if (['clickbank', 'gumroad', 'lemon_squeezy'].includes(platform)) {
    return [
      'Revisar descrição, suporte, termos, refund policy e compliance.',
      'Preparar assets e preço para revisão manual antes de publicar.',
      'Confirmar que o MVP não cria checkout nem produto real.',
      ...shared,
    ];
  }

  return [
    'Mapear campos obrigatórios do marketplace escolhido.',
    'Revisar copy, imagens, preço, termos e suporte manualmente.',
    ...shared,
  ];
}

export function buildMarketplacePackOutput(draftInput: MarketplacePackDraft): MarketplacePackOutput {
  const draft = normalizeMarketplacePackDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const idea = draft.sourceProductIdea || 'Produto Digital';
  const audience = draft.sourceAudience || 'público a validar';
  const niche = draft.sourceNiche || 'nicho a validar';
  const problem = draft.sourceProblem || 'problema principal ainda não detalhado';
  const offer = draft.sourceOffer || 'oferta inicial a revisar';
  const promise = draft.sourcePromise || 'promessa clara sem garantia de renda';
  const category = draft.mainCategory || niche;
  const platforms: MarketplacePlatform[] = draft.selectedPlatforms.length ? draft.selectedPlatforms : ['generic'];
  const platformChecklist = platforms.reduce(
    (record, platform) => ({ ...record, [platform]: checklistForPlatform(platform) }),
    {} as Record<MarketplacePlatform, string[]>,
  );

  return {
    productTitle: `${idea} — ${category}`,
    shortDescription: `${offer} para ${audience}, com revisão humana e execução manual-first.`,
    longDescription: `${idea} ajuda ${audience} no nicho de ${niche} a lidar com ${problem}. A oferta proposta é ${offer}, sustentada pela promessa: ${promise}. O pack é um rascunho comercial para revisão manual; ele não publica, não cobra, não cria checkout e não chama APIs de marketplace.`,
    seoTitle: `${idea} para ${niche}`.slice(0, 60),
    seoDescription:
      `Pack manual-first para ${audience}: ${offer}. Sem renda garantida, sem pagamentos ou publicação automática.`.slice(
        0,
        155,
      ),
    categories: [category, niche, 'Produto digital manual-first'].filter(Boolean),
    tags: Array.from(
      new Set(
        [idea, niche, audience, category, 'manual-first', 'sem api', 'revisao humana']
          .filter(Boolean)
          .map((item) => item.toLowerCase()),
      ),
    ),
    faq: [
      'O produto já está publicado? Não. Este MVP gera apenas rascunho local para revisão.',
      'Há integração com marketplace? Não. Nenhuma API externa é chamada.',
      'Pagamentos são ativados? Não. Checkout e gateways permanecem fora do escopo.',
      'Existe promessa de renda? Não. Toda promessa deve ser revisada para evitar garantias indevidas.',
    ],
    guaranteeNotes: [
      'Definir política de garantia/reembolso manualmente conforme plataforma e legislação.',
      'Remover qualquer linguagem de lucro certo, renda garantida ou resultado inevitável.',
      'Validar suporte, entrega e prazos antes de publicar.',
    ],
    assetChecklist: [
      'Capa/thumbnail principal',
      'Imagens ou mockups do produto',
      'Descrição curta e longa revisadas',
      'FAQ e termos de suporte',
      'Comprovantes de autorização de uso de marcas/imagens, se houver',
    ],
    affiliateCopy: [
      'Promova a transformação principal sem prometer renda garantida.',
      `Copy curta: ${idea} para ${audience} que precisam organizar ${problem}.`,
      'Incluir aviso de revisão humana e termos da plataforma antes de uso por afiliados.',
    ],
    launchPosts: [
      `Pré-lançamento: estamos validando ${idea} para ${audience}.`,
      `Bastidores: como ${offer} pode ajudar em ${problem}, sem promessas irreais.`,
      `Convite manual: revise a oferta e solicite acesso quando a publicação for aprovada.`,
    ],
    platformChecklist,
    humanApprovalChecklist: [
      'Aprovar título, descrição, preço e categoria.',
      'Confirmar ausência de renda garantida ou claims exagerados.',
      'Conferir que nenhum pagamento, checkout ou marketplace foi acionado automaticamente.',
      'Revisar políticas da plataforma selecionada.',
      draft.approvalNotes || 'Registrar aprovação humana antes de publicar.',
    ],
    riskWarnings: [
      'Risco de copy parecer promessa de renda garantida.',
      'Risco de publicar produto digital em canal com política restritiva.',
      'Risco de ativar pagamentos fora do escopo se etapas futuras forem feitas manualmente sem revisão.',
      'Este MVP não substitui revisão jurídica, fiscal ou de compliance.',
    ],
    nextSteps: [
      'Revisar pack com humano responsável.',
      'Ajustar assets e termos por plataforma.',
      'Copiar prompt para o Composer apenas se quiser refinar manualmente.',
      'Exportar JSON/Markdown para controle local.',
      'Planejar APPFORGE-004 Checkout Blueprint MVP sem ativar pagamentos reais.',
    ],
  };
}

export function buildMarketplacePackPrompt(draftInput: MarketplacePackDraft): string {
  const draft = normalizeMarketplacePackDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const pack = buildMarketplacePackOutput(draft);
  const promptPlatforms: MarketplacePlatform[] = draft.selectedPlatforms.length ? draft.selectedPlatforms : ['generic'];
  const platformLabels = promptPlatforms.map((platform) => MARKETPLACE_PLATFORM_LABELS[platform]);

  return `Você é o Marketplace Pack Generator MVP do GXEON App Forge. Gere e refine um marketplace-ready copy pack em português, mantendo operação manual-first e aprovação humana.

REGRAS OBRIGATÓRIAS:
- Manual-first: nenhuma publicação automática.
- Não acione marketplace API calls, SDKs, webhooks ou integrações reais.
- Não ative pagamento, checkout, gateway, links de cobrança ou processamento financeiro.
- Não prometa renda garantida, lucro certo ou resultado inevitável.
- Exija human approval antes de publicar, cobrar, conectar marketplace ou usar afiliados.

ENTRADAS:
- Produto: ${draft.sourceProductIdea || 'não informado'}
- Nicho: ${draft.sourceNiche || 'não informado'}
- Público: ${draft.sourceAudience || 'não informado'}
- Problema: ${draft.sourceProblem || 'não informado'}
- Oferta: ${draft.sourceOffer || 'não informada'}
- Promessa: ${draft.sourcePromise || 'não informada'}
- Preço: ${draft.sourcePrice || 'não informado'}
- Entrega: ${draft.deliveryFormat || 'não informada'}
- Plataformas: ${platformLabels.join(', ')}
- Categoria: ${draft.mainCategory || 'não informada'}
- Tom: ${TONE_LABELS[draft.tone]}
- Notas: ${draft.approvalNotes || 'sem notas'}

PRÉVIA LOCAL:
- Título: ${pack.productTitle}
- Descrição curta: ${pack.shortDescription}

RETORNE: título, descrições, SEO, categorias, tags, FAQ, garantia/reembolso, assets, affiliate copy, posts de lançamento, checklist por plataforma, checklist de aprovação humana, riscos e próximos passos.`;
}

export function buildMarketplacePackMarkdown(draftInput: MarketplacePackDraft): string {
  const draft = normalizeMarketplacePackDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const pack = buildMarketplacePackOutput(draft);
  const list = (items: string[]) => items.map((item) => `- ${item}`).join('\n');
  const platformList = Object.entries(pack.platformChecklist)
    .map(([platform, items]) => `### ${MARKETPLACE_PLATFORM_LABELS[platform as MarketplacePlatform]}\n${list(items)}`)
    .join('\n\n');

  return `# Marketplace Pack MVP — ${pack.productTitle}

> Manual-first. Sem marketplace API calls, sem autopublicação, sem pagamento real, sem checkout e sem renda garantida.

## Entradas
- **Produto:** ${draft.sourceProductIdea || 'Não informado'}
- **Nicho:** ${draft.sourceNiche || 'Não informado'}
- **Público:** ${draft.sourceAudience || 'Não informado'}
- **Oferta:** ${draft.sourceOffer || 'Não informada'}
- **Promessa:** ${draft.sourcePromise || 'Não informada'}
- **Preço:** ${draft.sourcePrice || 'Não informado'}
- **Formato:** ${draft.deliveryFormat || 'Não informado'}

## Copy e SEO
- **Título:** ${pack.productTitle}
- **Descrição curta:** ${pack.shortDescription}
- **Descrição longa:** ${pack.longDescription}
- **SEO title:** ${pack.seoTitle}
- **SEO description:** ${pack.seoDescription}

## Categorias
${list(pack.categories)}

## Tags
${list(pack.tags)}

## FAQ
${list(pack.faq)}

## Garantia e reembolso
${list(pack.guaranteeNotes)}

## Assets
${list(pack.assetChecklist)}

## Affiliate copy
${list(pack.affiliateCopy)}

## Launch posts
${list(pack.launchPosts)}

## Checklist por plataforma
${platformList}

## Aprovação humana
${list(pack.humanApprovalChecklist)}

## Riscos
${list(pack.riskWarnings)}

## Próximos passos
${list(pack.nextSteps)}

## Prompt para Composer

${buildMarketplacePackPrompt(draft)}
`;
}

export function buildMarketplacePackJson(
  draftInput: MarketplacePackDraft,
  exportedAt = nowIso(),
): MarketplacePackExport {
  const draft = normalizeMarketplacePackDraft(draftInput, draftInput.updatedAt || exportedAt);
  const pack = buildMarketplacePackOutput(draft);
  const prompt = buildMarketplacePackPrompt(draft);

  return {
    draft,
    pack,
    prompt,
    markdown: buildMarketplacePackMarkdown(draft),
    safety: {
      manualFirst: true,
      noGuaranteedIncome: true,
      noAutoPublishing: true,
      noLivePayments: true,
      noMarketplaceApiExecution: true,
      localOnlyDraft: true,
    },
    exportedAt,
  };
}

export function stringifyMarketplacePackJson(draftInput: MarketplacePackDraft): string {
  return JSON.stringify(buildMarketplacePackJson(draftInput), null, 2);
}
