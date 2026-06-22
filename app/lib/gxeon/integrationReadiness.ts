export const INTEGRATION_READINESS_STORAGE_KEY = 'gxeon.integrationReadiness.draft.v1';
export const PRODUCT_BUILDER_DRAFT_STORAGE_KEY = 'gxeon.productBuilder.draft.v1';
export const MARKETPLACE_PACK_DRAFT_STORAGE_KEY = 'gxeon.marketplacePack.draft.v1';
export const CHECKOUT_BLUEPRINT_DRAFT_STORAGE_KEY = 'gxeon.checkoutBlueprint.draft.v1';
export const LANDING_BUILDER_DRAFT_STORAGE_KEY = 'gxeon.landingBuilder.draft.v1';
export const CONTENT_FACTORY_DRAFT_STORAGE_KEY = 'gxeon.contentFactory.draft.v1';

export const INTEGRATION_PLATFORMS = [
  'hotmart',
  'kiwify',
  'eduzz',
  'monetizze',
  'braip',
  'perfect_pay',
  'stripe',
  'mercado_pago',
  'shopify',
  'woocommerce',
  'clickbank',
  'gumroad',
  'lemon_squeezy',
  'n8n',
  'email',
  'whatsapp',
  'instagram',
  'linkedin',
  'youtube',
  'generic',
] as const;
export type IntegrationPlatform = (typeof INTEGRATION_PLATFORMS)[number];
export const INTEGRATION_GOALS = [
  'payload_preview',
  'dry_run',
  'n8n_blueprint',
  'credential_mapping',
  'webhook_mapping',
  'internal',
] as const;
export const APPROVAL_MODES = ['manual_review', 'dual_approval', 'founder_only', 'team_review'] as const;
export const RISK_LEVELS = ['low', 'medium', 'high'] as const;
export const ENVIRONMENT_MODES = ['local_only', 'staging_ready', 'production_later'] as const;
type IntegrationGoal = (typeof INTEGRATION_GOALS)[number];
type ApprovalMode = (typeof APPROVAL_MODES)[number];
type RiskLevel = (typeof RISK_LEVELS)[number];
type EnvironmentMode = (typeof ENVIRONMENT_MODES)[number];

export interface IntegrationReadinessDraft {
  sourceProductIdea: string;
  sourceNiche: string;
  sourceAudience: string;
  sourceProblem: string;
  sourceOffer: string;
  sourcePromise: string;
  basePrice: string;
  deliveryFormat: string;
  selectedPlatforms: IntegrationPlatform[];
  integrationGoal: IntegrationGoal;
  approvalMode: ApprovalMode;
  riskLevel: RiskLevel;
  environmentMode: EnvironmentMode;
  operatorNotes: string;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
}
export interface IntegrationReadinessOutput {
  platformAdapterMap: Array<{
    platform: string;
    purpose: string;
    requiredFields: string[];
    optionalFields: string[];
    excludedInMvp: string[];
  }>;
  payloadPreviews: Array<{
    platform: string;
    method: string;
    endpointLabel: string;
    simulatedPayload: Record<string, unknown>;
    dryRunOnly: true;
  }>;
  credentialRequirements: Array<{
    platform: string;
    requiredLater: string[];
    storageRecommendation: string;
    currentStatus: string;
  }>;
  webhookBlueprints: Array<{
    platform: string;
    event: string;
    futureWebhookPurpose: string;
    dryRunPayloadShape: Record<string, unknown>;
  }>;
  n8nWorkflowDrafts: Array<{
    name: string;
    trigger: string;
    steps: string[];
    humanApprovalGate: string;
    disabledInMvp: true;
  }>;
  humanApprovalGates: string[];
  dryRunReport: string[];
  complianceChecklist: string[];
  riskWarnings: string[];
  nextSteps: string[];
}
export interface IntegrationReadinessExport {
  draft: IntegrationReadinessDraft;
  readiness: IntegrationReadinessOutput;
  contextPayload: string;
  prompt: string;
  markdown: string;
  safety: {
    manualFirst: true;
    dryRunOnly: true;
    noRealApiCalls: true;
    noLivePayments: true;
    noRealCheckout: true;
    noAutoPublishing: true;
    noExternalSend: true;
    noSecretsStored: true;
    localOnlyDraft: true;
  };
  exportedAt: string;
}

const nowIso = () => new Date().toISOString();
const clean = (v: unknown) => (typeof v === 'string' ? sanitizeIntegrationContextValue(v.trim()) : '');
const isPlatform = (v: unknown): v is IntegrationPlatform => INTEGRATION_PLATFORMS.includes(v as IntegrationPlatform);
const oneOf = <T extends readonly string[]>(values: T, v: unknown, f: T[number]) =>
  values.includes(v as T[number]) ? (v as T[number]) : f;

export function sanitizeIntegrationContextValue(value: unknown) {
  return typeof value === 'string'
    ? value
        .replaceAll('<gxeon_integration_context_payload>', '[removed_integration_context_open_tag]')
        .replaceAll('</gxeon_integration_context_payload>', '[removed_integration_context_close_tag]')
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .slice(0, 1200)
    : '';
}
export function createEmptyIntegrationReadinessDraft(now = nowIso()): IntegrationReadinessDraft {
  return {
    sourceProductIdea: '',
    sourceNiche: '',
    sourceAudience: '',
    sourceProblem: '',
    sourceOffer: '',
    sourcePromise: '',
    basePrice: '',
    deliveryFormat: '',
    selectedPlatforms: ['generic'],
    integrationGoal: 'dry_run',
    approvalMode: 'manual_review',
    riskLevel: 'medium',
    environmentMode: 'local_only',
    operatorNotes: '',
    approvalNotes: '',
    createdAt: now,
    updatedAt: now,
  };
}
export function normalizeIntegrationReadinessDraft(
  input: Partial<IntegrationReadinessDraft>,
  now = nowIso(),
): IntegrationReadinessDraft {
  const base = createEmptyIntegrationReadinessDraft(now);
  const selected = Array.isArray(input.selectedPlatforms)
    ? input.selectedPlatforms.filter(isPlatform)
    : base.selectedPlatforms;

  return {
    ...base,
    sourceProductIdea: clean(input.sourceProductIdea),
    sourceNiche: clean(input.sourceNiche),
    sourceAudience: clean(input.sourceAudience),
    sourceProblem: clean(input.sourceProblem),
    sourceOffer: clean(input.sourceOffer),
    sourcePromise: clean(input.sourcePromise),
    basePrice: clean(input.basePrice),
    deliveryFormat: clean(input.deliveryFormat),
    selectedPlatforms: selected.length ? selected : ['generic'],
    integrationGoal: oneOf(INTEGRATION_GOALS, input.integrationGoal, 'dry_run'),
    approvalMode: oneOf(APPROVAL_MODES, input.approvalMode, 'manual_review'),
    riskLevel: oneOf(RISK_LEVELS, input.riskLevel, 'medium'),
    environmentMode: oneOf(ENVIRONMENT_MODES, input.environmentMode, 'local_only'),
    operatorNotes: clean(input.operatorNotes),
    approvalNotes: clean(input.approvalNotes),
    createdAt: clean(input.createdAt) || now,
    updatedAt: now,
  };
}
export function validateIntegrationReadinessDraft(input: Partial<IntegrationReadinessDraft>) {
  const fields = ['sourceProductIdea', 'sourceNiche', 'sourceAudience', 'sourceOffer', 'basePrice'] as const;
  const missingRecommendedFields = fields.filter((f) => !clean(input[f]));

  return { missingRecommendedFields, isStrongReadinessReady: missingRecommendedFields.length === 0 };
}

type Adapter = {
  purpose: string;
  requiredFields: string[];
  optionalFields: string[];
  excludedInMvp: string[];
  riskNotes: string[];
};
export const INTEGRATION_ADAPTERS: Record<IntegrationPlatform, Adapter> = Object.fromEntries(
  INTEGRATION_PLATFORMS.map((p) => [
    p,
    {
      purpose: `${p} readiness blueprint only; no live connection.`,
      requiredFields: ['approved product data', 'approved offer terms', 'human compliance approval'],
      optionalFields: ['support policy', 'refund policy', 'tax notes'],
      excludedInMvp: ['real API calls', 'OAuth', 'credential storage', 'live webhooks', 'automatic publishing'],
      riskNotes: ['Review platform terms, limits, taxes, refunds and claims before future activation.'],
    },
  ]),
) as Record<IntegrationPlatform, Adapter>;
[
  'hotmart',
  'kiwify',
  'stripe',
  'mercado_pago',
  'shopify',
  'woocommerce',
  'clickbank',
  'gumroad',
  'lemon_squeezy',
  'n8n',
  'generic',
].forEach((p) => {
  INTEGRATION_ADAPTERS[p as IntegrationPlatform].purpose =
    p === 'n8n'
      ? 'Disabled n8n workflow blueprint only; no live webhook.'
      : `${p} adapter schema and DRY_RUN_ONLY payload preview; no executable endpoint.`;
});

function compact(d: IntegrationReadinessDraft) {
  return {
    product: {
      idea: d.sourceProductIdea,
      niche: d.sourceNiche,
      audience: d.sourceAudience,
      problem: d.sourceProblem,
      offer: d.sourceOffer,
      promise: d.sourcePromise,
      basePrice: d.basePrice,
      deliveryFormat: d.deliveryFormat,
    },
    integration: {
      platforms: d.selectedPlatforms,
      goal: d.integrationGoal,
      approvalMode: d.approvalMode,
      riskLevel: d.riskLevel,
      environmentMode: d.environmentMode,
    },
    notes: { operator: d.operatorNotes, approval: d.approvalNotes },
    safety: 'DRY_RUN_ONLY_NO_SECRETS_NO_REAL_API_CALLS',
  };
}

export function buildIntegrationContextPayload(input: IntegrationReadinessDraft) {
  const d = normalizeIntegrationReadinessDraft(input, input.updatedAt);
  return `<gxeon_integration_context_payload>${JSON.stringify(compact(d))}</gxeon_integration_context_payload>`;
}
export function buildIntegrationReadinessOutput(input: IntegrationReadinessDraft): IntegrationReadinessOutput {
  const d = normalizeIntegrationReadinessDraft(input, input.updatedAt);
  const platforms = d.selectedPlatforms;

  return {
    platformAdapterMap: platforms.map((p) => ({
      platform: p,
      purpose: INTEGRATION_ADAPTERS[p].purpose,
      requiredFields: INTEGRATION_ADAPTERS[p].requiredFields,
      optionalFields: INTEGRATION_ADAPTERS[p].optionalFields,
      excludedInMvp: INTEGRATION_ADAPTERS[p].excludedInMvp,
    })),
    payloadPreviews: platforms.map((p) => ({
      platform: p,
      method: 'DRY_RUN_ONLY',
      endpointLabel: `${p.toUpperCase()}_FUTURE_ENDPOINT_LABEL_ONLY`,
      simulatedPayload: {
        label: 'DRY_RUN_ONLY',
        productId: 'DRY_RUN_PRODUCT_ID',
        checkoutId: 'DRY_RUN_CHECKOUT_ID',
        title: d.sourceProductIdea || 'DRY_RUN_PRODUCT_TITLE',
        price: d.basePrice || 'DRY_RUN_PRICE',
        offer: d.sourceOffer || 'DRY_RUN_OFFER',
        noRealApiCall: true,
      },
      dryRunOnly: true as const,
    })),
    credentialRequirements: platforms.map((p) => ({
      platform: p,
      requiredLater: INTEGRATION_ADAPTERS[p].requiredFields,
      storageRecommendation:
        'Future credentials must be stored only in approved server-side secret management, never pasted into this frontend.',
      currentStatus: 'Not collected, not stored, not connected in MVP.',
    })),
    webhookBlueprints: platforms.map((p) => ({
      platform: p,
      event: 'future.approval_or_order_event',
      futureWebhookPurpose: 'Blueprint for a later human-approved event mapping; no webhook is registered or called.',
      dryRunPayloadShape: {
        eventId: 'DRY_RUN_EVENT_ID',
        productId: 'DRY_RUN_PRODUCT_ID',
        checkoutId: 'DRY_RUN_CHECKOUT_ID',
        dryRunOnly: true,
      },
    })),
    n8nWorkflowDrafts: [
      {
        name: 'Integration Readiness Review - Disabled MVP',
        trigger: 'Manual review trigger only; no live webhook',
        steps: [
          'Review product, marketplace, checkout, landing and content context',
          'Validate platform terms, taxes, refunds, support and claims',
          'Approve credential strategy outside frontend',
          'Only APPFORGE-008 may design human-approved live API layer',
        ],
        humanApprovalGate: 'Founder/team approval required before any external connector exists.',
        disabledInMvp: true,
      },
    ],
    humanApprovalGates: [
      'Review platform terms and regional compliance.',
      'Approve taxes, refunds, support, delivery and claims.',
      'Approve credential strategy without frontend secret entry.',
      'Confirm no live payment, checkout, webhook, post, email or WhatsApp send is triggered.',
    ],
    dryRunReport: [
      'Generated local-only adapter schemas and payload previews.',
      'No real API calls, products, checkout links, webhooks, n8n connections, posts or messages were executed.',
    ],
    complianceChecklist: [
      'Platform terms, approval rules, rate limits and policy requirements reviewed.',
      'Payment readiness remains no live charges for Stripe/Mercado Pago.',
      'Marketplace readiness remains product/checkout planning only for Hotmart/Kiwify/Eduzz/Braip/Perfect Pay.',
      'Social/email/WhatsApp remains manual follow-up only, not bulk automation.',
    ],
    riskWarnings: platforms.flatMap((p) => INTEGRATION_ADAPTERS[p].riskNotes),
    nextSteps: [
      'Export Markdown/JSON for manual review.',
      'Use APPFORGE-008 later for a human-approved API layer design only after compliance approval.',
    ],
  };
}
export function buildIntegrationReadinessPrompt(d: IntegrationReadinessDraft) {
  return `DRY-RUN ONLY. No real API calls, no live payments, no real checkout, no external send, no auto-publishing, no credentials, and human approval required.\n\n${buildIntegrationContextPayload(d)}\n\nGenerate an Integration Readiness review using only blueprint text and DRY_RUN_ONLY payload previews.`;
}
export function buildIntegrationReadinessMarkdown(d: IntegrationReadinessDraft) {
  const out = buildIntegrationReadinessOutput(d);
  return `# Integration Readiness MVP\n\n**Mode:** DRY_RUN_ONLY — no real API calls, no live payments, no real checkout, no external send, no auto-publishing, no credentials.\n\n## Payload Previews\n${out.payloadPreviews.map((p) => `- ${p.platform}: ${p.method}, dryRunOnly: ${p.dryRunOnly}, ${p.endpointLabel}`).join('\n')}\n\n## Approval Gates\n${out.humanApprovalGates.map((x) => `- ${x}`).join('\n')}\n\n## Risk Warnings\n${out.riskWarnings.map((x) => `- ${x}`).join('\n')}\n`;
}
export function buildIntegrationReadinessJson(d: IntegrationReadinessDraft): IntegrationReadinessExport {
  const draft = normalizeIntegrationReadinessDraft(d, d.updatedAt);
  const readiness = buildIntegrationReadinessOutput(draft);

  return {
    draft,
    readiness,
    contextPayload: buildIntegrationContextPayload(draft),
    prompt: buildIntegrationReadinessPrompt(draft),
    markdown: buildIntegrationReadinessMarkdown(draft),
    safety: {
      manualFirst: true,
      dryRunOnly: true,
      noRealApiCalls: true,
      noLivePayments: true,
      noRealCheckout: true,
      noAutoPublishing: true,
      noExternalSend: true,
      noSecretsStored: true,
      localOnlyDraft: true,
    },
    exportedAt: nowIso(),
  };
}
export function stringifyIntegrationReadinessJson(d: IntegrationReadinessDraft) {
  return JSON.stringify(buildIntegrationReadinessJson(d), null, 2);
}
