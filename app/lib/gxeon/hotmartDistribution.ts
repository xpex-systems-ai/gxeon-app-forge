export const HOTMART_DISTRIBUTION_STORAGE_KEY = 'gxeon.hotmartDistribution.drafts.v1';

export type HotmartProductStatus =
  | 'idea'
  | 'generated'
  | 'needs_review'
  | 'approved_manual'
  | 'ready_for_hotmart_manual_publish'
  | 'blocked'
  | 'archived';
export type HotmartProductCategory =
  | 'ai_tools'
  | 'marketing'
  | 'business'
  | 'sales'
  | 'dashboards'
  | 'education'
  | 'productivity'
  | 'automation'
  | 'templates'
  | 'prompts'
  | 'other';
export type HotmartDeliveryFormat =
  | 'ebook'
  | 'course'
  | 'template_pack'
  | 'dashboard_template'
  | 'software_blueprint'
  | 'ai_system_pack'
  | 'prompt_pack'
  | 'hybrid_pack';
export type HotmartDraftSource = 'manual' | 'product_builder' | 'catalog' | 'core_bridge' | 'generated_batch';

export interface HotmartProductIdea {
  id: string;
  productName: string;
  category: HotmartProductCategory;
  targetAudience: string;
  primaryProblem: string;
  safePromise: string;
  deliveryFormat: HotmartDeliveryFormat;
  aiIntegrationConcept: string;
  trafficManagerAngle: string;
  affiliateAngle: string;
  tags: string[];
}

export interface HotmartProductDraft extends HotmartProductIdea {
  createdAt: string;
  updatedAt: string;
  status: HotmartProductStatus;
  priceHypothesis: string;
  offerStack: string[];
  hotmartManualPublishChecklist: string[];
  complianceNotes: string[];
  riskWarnings: string[];
  humanApprovalNotes: string;
  source: HotmartDraftSource;
}

export interface HotmartAssetPack {
  id: string;
  productDraftId: string;
  headline: string;
  subheadline: string;
  salesPageCopy: string;
  checkoutCopy: string;
  affiliatePitch: string;
  trafficManagerBrief: string;
  adAngles: string[];
  creativePrompts: string[];
  emailSequence: string[];
  whatsappScripts: string[];
  faq: Array<{ question: string; answer: string }>;
  guaranteeText: string;
  supportInstructions: string;
  deliveryInstructions: string;
  hotmartListingDraft: {
    title: string;
    shortDescription: string;
    longDescription: string;
    categorySuggestion: string;
    keywords: string[];
    producerNotes: string;
  };
  safety: {
    manualPublishOnly: true;
    noAutoPosting: true;
    noPaymentCreated: true;
    noExternalApiCall: true;
    noIncomeGuarantee: true;
  };
}

export interface HotmartAffiliateKit {
  affiliatePitch: string;
  adAngles: string[];
  shortVideoHooks: string[];
  whatsappScripts: string[];
  emailSubjectLines: string[];
  trafficManagerBrief: string;
  prohibitedClaimWarnings: string[];
  noGuaranteeDisclaimer: string;
}

export interface HotmartLaunchQueueItem {
  id: string;
  productDraftId: string;
  assetPackId: string;
  status: 'queued' | 'reviewing' | 'approved_for_manual_publish' | 'blocked' | 'published_manually' | 'archived';
  operatorChecklist: string[];
  missingItems: string[];
  approvalGate: 'founder_only' | 'dual_review' | 'legal_review_needed';
  publishMode: 'manual_hotmart_dashboard_only';
  notes: string;
}

export interface HotmartComplianceResult {
  isBlocked: boolean;
  findings: string[];
  warnings: string[];
}

const BLOCKED_TERMS = [
  'ganho garantido',
  'venda garantida',
  'renda garantida',
  'resultado garantido',
  'dinheiro fácil',
  'sem esforço',
  '100% garantido',
  'fique rico',
  'lucro certo',
  'guaranteed roi',
  'guaranteed sales',
];

const CHECKLIST = [
  'Revisar promessa sem garantia de renda, vendas ou ROI.',
  'Cadastrar produto manualmente no painel Hotmart com título, descrição e categoria revisados.',
  'Enviar arquivos de entrega sem links de checkout criados pelo sistema.',
  'Revisar preço, reembolso, suporte e material de afiliados.',
  'Registrar aprovação do founder antes de publicar manualmente.',
];

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function slug(value: string) {
  return (
    clean(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'hotmart-draft'
  );
}

function id(prefix: string, seed: string) {
  return `${prefix}-${slug(seed)}-${Math.abs(seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0))}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function generateHotmartProductIdeas(
  niche = 'marketing',
  audience = 'gestores de tráfego',
  format: HotmartDeliveryFormat = 'hybrid_pack',
): HotmartProductIdea[] {
  const families = [
    'AI Campaign OS',
    'AI Lead Dashboard Pack',
    'AI Affiliate Kit Builder',
    'AI Copy and Creative Pack',
    'Traffic Manager Command Center',
    'Digital Product Launch Pack',
    'AI CRM Lite for Leads',
    'Prompt Pack for Ads and Sales',
    'Dashboard Template Pack',
    'Hotmart Offer Builder Kit',
  ];
  return families.map((family, index) => ({
    id: id('idea', `${niche}-${audience}-${family}`),
    productName: `${family} para ${niche}`,
    category: index % 3 === 0 ? 'marketing' : index % 3 === 1 ? 'dashboards' : 'ai_tools',
    targetAudience: audience,
    primaryProblem: `Falta de um processo claro para transformar ${niche} em ativos vendáveis e campanhas revisáveis.`,
    safePromise: `Organizar um pacote prático para ${audience} planejarem, revisarem e publicarem manualmente sem prometer resultados financeiros.`,
    deliveryFormat: format,
    aiIntegrationConcept:
      'Prompts, checklists e templates locais para acelerar pesquisa, copy, briefing e revisão humana.',
    trafficManagerAngle: `Briefing de campanhas para validar dores de ${niche}, ângulos e criativos sem disparos automáticos.`,
    affiliateAngle: `Kit de indicação com pitch, objeções e mensagens manuais para afiliados apresentarem a solução com responsabilidade.`,
    tags: [slug(niche), slug(audience), 'manual-first', 'hotmart-ready'],
  }));
}

export function buildHotmartProductDraft(
  idea: Partial<HotmartProductIdea>,
  source: HotmartDraftSource = 'manual',
  now = nowIso(),
): HotmartProductDraft {
  const productName = clean(idea.productName) || 'Hotmart Offer Builder Kit';
  const draft: HotmartProductDraft = {
    id: id('hotmart', `${productName}-${source}`),
    createdAt: now,
    updatedAt: now,
    status: 'generated',
    productName,
    category: idea.category ?? 'marketing',
    targetAudience: clean(idea.targetAudience) || 'produtores digitais e gestores de tráfego',
    primaryProblem:
      clean(idea.primaryProblem) || 'Oferta sem pacote, checklist e ativos revisáveis para publicação manual.',
    safePromise:
      clean(idea.safePromise) ||
      'Preparar um pacote de produto e distribuição com revisão humana, sem promessa de renda.',
    deliveryFormat: idea.deliveryFormat ?? 'hybrid_pack',
    priceHypothesis: 'R$97 a R$497, validar manualmente por valor percebido, suporte e profundidade do pacote.',
    offerStack: [
      'Produto principal',
      'Checklist Hotmart manual',
      'Kit de afiliado',
      'Briefing para tráfego',
      'FAQ e suporte',
    ],
    aiIntegrationConcept:
      clean(idea.aiIntegrationConcept) ||
      'Sistema de prompts locais para gerar assets e revisar riscos antes da publicação manual.',
    trafficManagerAngle:
      clean(idea.trafficManagerAngle) ||
      'Campanhas por dor, público e criativos com aprovação humana antes de qualquer veiculação.',
    affiliateAngle:
      clean(idea.affiliateAngle) || 'Afiliados recebem pitch e scripts manuais com avisos contra promessas de renda.',
    hotmartManualPublishChecklist: [...CHECKLIST],
    complianceNotes: [
      'Manual-first',
      'Local-only',
      'Sem checkout real',
      'Sem API Hotmart',
      'Sem garantia de resultado',
    ],
    riskWarnings: validateHotmartProductCompliance(JSON.stringify(idea)).warnings,
    humanApprovalNotes:
      'Founder deve revisar promessa, preço, entrega, suporte, afiliados e compliance antes de publicar manualmente.',
    source,
    tags: [...(idea.tags ?? []), 'hotmart-manual', 'no-auto-publish'],
  };

  return draft.riskWarnings.length ? { ...draft, status: 'needs_review' } : draft;
}

export function buildAffiliateKit(draft: HotmartProductDraft): HotmartAffiliateKit {
  const disclaimer = 'Não prometer renda, vendas, ROI ou resultados garantidos; toda comunicação exige revisão humana.';
  return {
    affiliatePitch: `Apresente ${draft.productName} como um pacote para organizar ${draft.primaryProblem.toLowerCase()} com publicação manual e segura. ${disclaimer}`,
    adAngles: [
      'Dor operacional',
      'Checklist manual',
      'Velocidade com revisão humana',
      'Kit para afiliados',
      'Briefing para tráfego',
    ],
    shortVideoHooks: [
      'Seu produto está pronto para revisão?',
      'Pare de improvisar assets Hotmart',
      'Checklist antes de publicar',
      'Afiliado precisa de clareza',
      'Tráfego começa com briefing',
    ],
    whatsappScripts: Array.from(
      { length: 5 },
      (_, i) =>
        `Script ${i + 1}: mostrar a dor, explicar o pacote e convidar para revisão manual sem promessa de ganho.`,
    ),
    emailSubjectLines: [
      'Checklist Hotmart antes de publicar',
      'Kit de afiliado sem promessas arriscadas',
      'Organize sua oferta com revisão humana',
      'Briefing de tráfego para produto digital',
      'Seu pacote está pronto para auditoria?',
    ],
    trafficManagerBrief: `${draft.trafficManagerAngle} ${disclaimer}`,
    prohibitedClaimWarnings: [...BLOCKED_TERMS],
    noGuaranteeDisclaimer: disclaimer,
  };
}

export function buildHotmartAssetPack(draft: HotmartProductDraft): HotmartAssetPack {
  const kit = buildAffiliateKit(draft);
  return {
    id: id('asset', draft.id),
    productDraftId: draft.id,
    headline: `${draft.productName}: pacote manual-first para Hotmart`,
    subheadline: draft.safePromise,
    salesPageCopy: `Estruture oferta, entrega, afiliados e tráfego para ${draft.targetAudience}. Inclui checklists e prompts locais. Não inclui publicação automática, checkout real ou promessa de renda.`,
    checkoutCopy:
      'Texto para revisar e colar manualmente no checkout Hotmart após aprovação humana. Nenhum link real é criado aqui.',
    affiliatePitch: kit.affiliatePitch,
    trafficManagerBrief: kit.trafficManagerBrief,
    adAngles: kit.adAngles,
    creativePrompts: kit.shortVideoHooks.map((hook) => `Criar criativo sobre: ${hook}`),
    emailSequence: kit.emailSubjectLines,
    whatsappScripts: kit.whatsappScripts,
    faq: [
      {
        question: 'Este sistema publica na Hotmart?',
        answer: 'Não. Ele gera rascunhos locais para publicação manual.',
      },
      {
        question: 'Há promessa de resultado?',
        answer: 'Não. O pacote organiza execução e revisão, sem garantia de renda, vendas ou ROI.',
      },
    ],
    guaranteeText:
      'Use linguagem de garantia apenas conforme política aprovada pelo produtor e plataforma, revisada manualmente.',
    supportInstructions: 'Definir canal, SLA e escopo de suporte antes da publicação manual.',
    deliveryInstructions: 'Anexar arquivos e instruções manualmente no painel Hotmart após revisão final.',
    hotmartListingDraft: {
      title: draft.productName,
      shortDescription: draft.safePromise,
      longDescription: `Produto para ${draft.targetAudience}: ${draft.primaryProblem}. Entrega: ${draft.offerStack.join(', ')}.`,
      categorySuggestion: draft.category,
      keywords: draft.tags,
      producerNotes:
        'Revisar compliance, preço, suporte, material de afiliados e entrega antes de publicar manualmente.',
    },
    safety: {
      manualPublishOnly: true,
      noAutoPosting: true,
      noPaymentCreated: true,
      noExternalApiCall: true,
      noIncomeGuarantee: true,
    },
  };
}

export function validateHotmartProductCompliance(text: string): HotmartComplianceResult {
  const normalized = text.toLowerCase();
  const findings = BLOCKED_TERMS.filter((term) => normalized.includes(term));
  const warnings = [...findings.map((term) => `Termo bloqueado: ${term}`)];

  if (/(copiado|plagiado|copycat|scraped)/i.test(text)) {
    warnings.push('Fonte copiada/plagiada indicada pelo operador.');
  }

  if (/(cura|jurídico garantido|investimento garantido)/i.test(text)) {
    warnings.push('Promessa médica, legal ou financeira não suportada.');
  }

  return { isBlocked: warnings.length > 0, findings, warnings };
}

export function createHotmartLaunchQueueItem(
  draft: HotmartProductDraft,
  assetPack: HotmartAssetPack,
): HotmartLaunchQueueItem {
  const compliance = validateHotmartProductCompliance(JSON.stringify({ draft, assetPack }));
  const missingItems = [
    !draft.humanApprovalNotes && 'Notas de aprovação humana',
    !assetPack.headline && 'Headline',
    !assetPack.affiliatePitch && 'Pitch de afiliado',
  ].filter(Boolean) as string[];

  return {
    id: id('queue', `${draft.id}-${assetPack.id}`),
    productDraftId: draft.id,
    assetPackId: assetPack.id,
    status: compliance.isBlocked || missingItems.length ? 'blocked' : 'queued',
    operatorChecklist: [...CHECKLIST, 'Confirmar que o botão final usado será apenas o painel manual da Hotmart.'],
    missingItems,
    approvalGate: compliance.isBlocked ? 'legal_review_needed' : 'founder_only',
    publishMode: 'manual_hotmart_dashboard_only',
    notes: 'Fila local. Nenhuma ação externa, API, webhook, pagamento ou checkout foi executado.',
  };
}

export function buildHotmartManualPublishMarkdown(draft: HotmartProductDraft, assetPack?: HotmartAssetPack) {
  return `# Checklist Hotmart Manual — ${draft.productName}\n\n## Segurança\n- Manual-first\n- Sem API Hotmart\n- Sem checkout real gerado\n- Sem promessa de renda\n\n## Publicação manual\n${draft.hotmartManualPublishChecklist.map((item) => `- [ ] ${item}`).join('\n')}\n\n## Listing\n- Título: ${assetPack?.hotmartListingDraft.title ?? draft.productName}\n- Descrição curta: ${assetPack?.hotmartListingDraft.shortDescription ?? draft.safePromise}\n`;
}
export function buildAffiliateKitMarkdown(kit: HotmartAffiliateKit) {
  return `# Kit de Afiliado\n\n${kit.affiliatePitch}\n\n## Ângulos\n${kit.adAngles.map((item) => `- ${item}`).join('\n')}\n\n## Aviso\n${kit.noGuaranteeDisclaimer}`;
}
export function buildTrafficManagerBriefMarkdown(draft: HotmartProductDraft, kit = buildAffiliateKit(draft)) {
  return `# Briefing de Tráfego — ${draft.productName}\n\n${kit.trafficManagerBrief}\n\n## Público\n${draft.targetAudience}\n\n## Dor\n${draft.primaryProblem}`;
}
export function buildHotmartDistributionJson(
  draft: HotmartProductDraft,
  assetPack: HotmartAssetPack,
  queue?: HotmartLaunchQueueItem,
) {
  return JSON.stringify({ draft, assetPack, queue, safety: assetPack.safety }, null, 2);
}
export function buildHotmartComposerPrompt(draft: HotmartProductDraft) {
  return `Revise o pacote Hotmart manual-first para ${draft.productName}. Não publique, não crie checkout, não chame APIs e não prometa renda. Gere melhorias para oferta, afiliados, tráfego e checklist manual.`;
}

export function importProductBuilderDraftToHotmart(input: Record<string, unknown>) {
  const idea: HotmartProductIdea = {
    id: id('idea', clean(input.idea) || 'product-builder'),
    productName: clean(input.idea) || 'Produto importado do Product Builder',
    category: 'marketing',
    targetAudience: clean(input.targetAudience) || 'público importado localmente',
    primaryProblem: clean(input.problem) || 'problema importado localmente para revisão',
    safePromise: clean(input.promise) || 'Promessa segura importada para revisão humana, sem garantia de renda.',
    deliveryFormat: 'hybrid_pack',
    aiIntegrationConcept: 'Reaproveitar campos locais do Product Builder em prompts e checklists.',
    trafficManagerAngle: 'Transformar canais e problema em briefing de campanha manual.',
    affiliateAngle: 'Transformar oferta em pitch de afiliado revisado manualmente.',
    tags: ['product-builder-import'],
  };
  return buildHotmartProductDraft(idea, 'product_builder');
}

export function importProductCatalogItemToHotmart(input: Record<string, unknown>) {
  return buildHotmartProductDraft(
    {
      productName: clean(input.productName) || clean(input.title) || 'Produto importado do Catálogo',
      targetAudience: clean(input.targetAudience) || 'compradores do catálogo local',
      primaryProblem:
        clean(input.primaryProblem) || clean(input.problem) || 'produto local precisa de pacote Hotmart revisável',
      safePromise:
        clean(input.safePromise) ||
        clean(input.promise) ||
        'Preparar produto para publicação manual na Hotmart sem garantias.',
      deliveryFormat: 'hybrid_pack',
      category: 'templates',
      aiIntegrationConcept: 'Converter catálogo local em assets e checklist.',
      trafficManagerAngle: 'Briefing manual baseado no posicionamento do catálogo.',
      affiliateAngle: 'Pitch de afiliado baseado no valor do produto local.',
      tags: ['catalog-import'],
    },
    'catalog',
  );
}
