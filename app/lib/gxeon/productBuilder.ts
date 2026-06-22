export const PRODUCT_BUILDER_STORAGE_KEY = 'gxeon.productBuilder.draft.v1';

export const PRODUCT_TYPES = [
  'ebook',
  'course',
  'mentorship',
  'saas',
  'template',
  'affiliate_store',
  'dashboard',
  'community',
  'service',
  'other',
] as const;

export const PRODUCT_TONES = ['direct', 'premium', 'technical', 'popular', 'institutional', 'persuasive'] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];
export type ProductTone = (typeof PRODUCT_TONES)[number];

export interface ProductBuilderDraft {
  idea: string;
  niche: string;
  targetAudience: string;
  problem: string;
  productType: ProductType;
  offer: string;
  promise: string;
  desiredPrice: string;
  channels: string[];
  tone: ProductTone;
  deliveryFormat: string;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBlueprintOutput {
  nameSuggestions: string[];
  avatar: string;
  coreOffer: string;
  promise: string;
  transformation: string;
  deliverables: string[];
  pricingHypothesis: string;
  landingPageStructure: string[];
  marketplacePackFields: string[];
  contentAngles: string[];
  salesChannels: string[];
  humanApprovalChecklist: string[];
  nextSteps: string[];
}

export interface ProductBuilderExport {
  draft: ProductBuilderDraft;
  blueprint: ProductBlueprintOutput;
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

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ebook: 'Ebook',
  course: 'Curso digital',
  mentorship: 'Mentoria',
  saas: 'SaaS',
  template: 'Template',
  affiliate_store: 'Loja afiliada',
  dashboard: 'Dashboard',
  community: 'Comunidade',
  service: 'Serviço',
  other: 'Outro',
};

const TONE_LABELS: Record<ProductTone, string> = {
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

function cleanList(values: unknown): string[] {
  if (Array.isArray(values)) {
    return values.map(clean).filter(Boolean);
  }

  return clean(values)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureProductType(value: unknown): ProductType {
  return PRODUCT_TYPES.includes(value as ProductType) ? (value as ProductType) : 'ebook';
}

function ensureTone(value: unknown): ProductTone {
  return PRODUCT_TONES.includes(value as ProductTone) ? (value as ProductTone) : 'direct';
}

export function createEmptyProductBuilderDraft(now = nowIso()): ProductBuilderDraft {
  return {
    idea: '',
    niche: '',
    targetAudience: '',
    problem: '',
    productType: 'ebook',
    offer: '',
    promise: '',
    desiredPrice: '',
    channels: [],
    tone: 'direct',
    deliveryFormat: '',
    approvalNotes: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeProductBuilderDraft(input: Partial<ProductBuilderDraft>, now = nowIso()): ProductBuilderDraft {
  return {
    idea: clean(input.idea),
    niche: clean(input.niche),
    targetAudience: clean(input.targetAudience),
    problem: clean(input.problem),
    productType: ensureProductType(input.productType),
    offer: clean(input.offer),
    promise: clean(input.promise),
    desiredPrice: clean(input.desiredPrice),
    channels: cleanList(input.channels),
    tone: ensureTone(input.tone),
    deliveryFormat: clean(input.deliveryFormat),
    approvalNotes: clean(input.approvalNotes),
    createdAt: clean(input.createdAt) || now,
    updatedAt: now,
  };
}

export function buildProductBlueprintOutput(draftInput: ProductBuilderDraft): ProductBlueprintOutput {
  const draft = normalizeProductBuilderDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const channelText = draft.channels.length ? draft.channels : ['Email', 'Instagram', 'Landing page manual'];
  const ideaName = draft.idea || 'Produto Digital';
  const niche = draft.niche || 'nicho informado pelo operador';
  const audience = draft.targetAudience || 'avatar a validar manualmente';
  const problem = draft.problem || 'problema principal a refinar';
  const promise = draft.promise || draft.offer || 'promessa de transformação sem garantia de renda';

  return {
    nameSuggestions: [`${ideaName} Blueprint`, `${ideaName} Pro`, `Método ${ideaName}`],
    avatar: `${audience} no nicho de ${niche}, enfrentando ${problem}.`,
    coreOffer: draft.offer || `${PRODUCT_TYPE_LABELS[draft.productType]} para resolver ${problem}.`,
    promise,
    transformation: `Sair de "${problem}" para uma execução organizada com oferta, entregáveis, canais e aprovação humana.`,
    deliverables: [
      draft.deliveryFormat || PRODUCT_TYPE_LABELS[draft.productType],
      'Blueprint da oferta',
      'Checklist de validação manual',
      'Plano de conteúdo inicial',
    ],
    pricingHypothesis: draft.desiredPrice || 'Definir hipótese de preço após validação manual de valor percebido.',
    landingPageStructure: [
      'Hero com promessa',
      'Avatar e problema',
      'Transformação',
      'Entregáveis',
      'Preço sugerido',
      'FAQ',
      'CTA manual',
    ],
    marketplacePackFields: [
      'Título',
      'Descrição curta',
      'Descrição longa',
      'Tags',
      'Imagens necessárias',
      'Termos e observações manuais',
    ],
    contentAngles: [
      'Dor principal',
      'Antes e depois',
      'Bastidores da construção',
      'Prova de entendimento do avatar',
      'Convite para validação',
    ],
    salesChannels: channelText,
    humanApprovalChecklist: [
      'Validar promessa sem garantia de renda',
      'Revisar preço e entregáveis',
      'Aprovar copy antes de publicar',
      'Confirmar que pagamentos reais continuam desativados',
      'Confirmar que nenhum marketplace será acionado por API',
    ],
    nextSteps: [
      'Refinar avatar',
      'Validar oferta com 3-5 pessoas',
      'Revisar landing page',
      'Preparar marketplace pack manual',
      'Decidir próximos testes',
    ],
  };
}

export function buildProductBlueprintPrompt(draftInput: ProductBuilderDraft): string {
  const draft = normalizeProductBuilderDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const blueprint = buildProductBlueprintOutput(draft);

  return `Você é o Product Builder MVP do GXEON App Forge. Gere um Product Blueprint estruturado em português para um produto digital vendável, mantendo operação manual-first.

REGRAS DE SEGURANÇA E ESCOPO:
- Manual-first: nada deve ser publicado, cobrado, integrado ou enviado automaticamente.
- Não faça promessas de renda garantida, lucro certo ou resultado financeiro inevitável.
- Não execute pagamentos reais, checkout real, gateways, banco de dados ou integrações externas.
- Não acione APIs de marketplace e não publique em Hotmart, Kiwify, Shopee, Mercado Livre, ClickBank ou redes sociais.
- Entregue um plano copiável e útil mesmo sem provider LLM conectado.

ENTRADAS DO OPERADOR:
- Ideia: ${draft.idea || 'não informada'}
- Nicho: ${draft.niche || 'não informado'}
- Público/avatar: ${draft.targetAudience || 'não informado'}
- Problema: ${draft.problem || 'não informado'}
- Tipo de produto: ${PRODUCT_TYPE_LABELS[draft.productType]}
- Oferta inicial: ${draft.offer || 'não informada'}
- Promessa: ${draft.promise || 'não informada'}
- Preço desejado: ${draft.desiredPrice || 'não informado'}
- Canais: ${draft.channels.join(', ') || 'não informados'}
- Tom: ${TONE_LABELS[draft.tone]}
- Formato de entrega: ${draft.deliveryFormat || 'não informado'}
- Notas de aprovação: ${draft.approvalNotes || 'sem notas'}

PRÉVIA LOCAL GERADA:
- Sugestões de nome: ${blueprint.nameSuggestions.join(' | ')}
- Oferta central: ${blueprint.coreOffer}
- Hipótese de preço: ${blueprint.pricingHypothesis}

RETORNE O BLUEPRINT COM ESTAS SEÇÕES OBRIGATÓRIAS:
1. Nome do produto
2. Avatar
3. Problema
4. Promessa
5. Transformação
6. Oferta
7. Entregáveis
8. Preço sugerido
9. Landing page
10. Marketplace pack
11. Canais
12. Conteúdo inicial
13. Checklist de aprovação humana
14. Riscos
15. Próximos passos

Use linguagem ${TONE_LABELS[draft.tone]}, objetiva e acionável. Inclua avisos claros de aprovação humana antes de venda, publicação, checkout ou marketplace.`;
}

export function buildProductBlueprintMarkdown(draftInput: ProductBuilderDraft): string {
  const draft = normalizeProductBuilderDraft(draftInput, draftInput.updatedAt || FALLBACK_DATE);
  const blueprint = buildProductBlueprintOutput(draft);
  const list = (items: string[]) => items.map((item) => `- ${item}`).join('\n');

  return `# Product Blueprint MVP — ${draft.idea || 'Produto Digital'}

> Operação manual-first. Sem renda garantida, sem pagamentos reais, sem autopublicação e sem execução de APIs de marketplace.

## Entradas
- **Ideia:** ${draft.idea || 'Não informada'}
- **Nicho:** ${draft.niche || 'Não informado'}
- **Público:** ${draft.targetAudience || 'Não informado'}
- **Problema:** ${draft.problem || 'Não informado'}
- **Tipo:** ${PRODUCT_TYPE_LABELS[draft.productType]}
- **Oferta:** ${draft.offer || 'Não informada'}
- **Promessa:** ${draft.promise || 'Não informada'}
- **Preço desejado:** ${draft.desiredPrice || 'Não informado'}
- **Canais:** ${draft.channels.join(', ') || 'Não informados'}
- **Tom:** ${TONE_LABELS[draft.tone]}
- **Formato de entrega:** ${draft.deliveryFormat || 'Não informado'}

## Nome do produto
${list(blueprint.nameSuggestions)}

## Avatar
${blueprint.avatar}

## Oferta e promessa
- **Oferta central:** ${blueprint.coreOffer}
- **Promessa:** ${blueprint.promise}
- **Transformação:** ${blueprint.transformation}

## Entregáveis
${list(blueprint.deliverables)}

## Preço sugerido
${blueprint.pricingHypothesis}

## Landing page
${list(blueprint.landingPageStructure)}

## Marketplace pack
${list(blueprint.marketplacePackFields)}

## Canais
${list(blueprint.salesChannels)}

## Conteúdo inicial
${list(blueprint.contentAngles)}

## Checklist de aprovação humana
${list(blueprint.humanApprovalChecklist)}

## Riscos
- Promessa exagerada ou interpretação como garantia de renda.
- Publicar antes de validação humana.
- Ativar pagamentos, marketplace ou banco de dados antes do escopo aprovado.

## Próximos passos
${list(blueprint.nextSteps)}

## Prompt profissional para LLM

${buildProductBlueprintPrompt(draft)}
`;
}

export function buildProductBlueprintJson(
  draftInput: ProductBuilderDraft,
  exportedAt = nowIso(),
): ProductBuilderExport {
  const draft = normalizeProductBuilderDraft(draftInput, draftInput.updatedAt || exportedAt);
  const blueprint = buildProductBlueprintOutput(draft);
  const prompt = buildProductBlueprintPrompt(draft);

  return {
    draft,
    blueprint,
    prompt,
    markdown: buildProductBlueprintMarkdown(draft),
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

export function stringifyProductBlueprintJson(draftInput: ProductBuilderDraft): string {
  return JSON.stringify(buildProductBlueprintJson(draftInput), null, 2);
}
