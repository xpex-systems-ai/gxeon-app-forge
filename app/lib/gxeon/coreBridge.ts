export type CoreBridgeRiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export interface CoreOpportunityPayload {
  source: 'gxeon-core';
  type: 'repo_product_opportunity';
  repo: {
    url: string;
    name: string;
    owner: string;
    license: string;
    stars: number;
    lastCommit: string;
  };
  technical: {
    stack: string[];
    deployTargets: string[];
    complexity: CoreBridgeRiskLevel;
    securityRisk: CoreBridgeRiskLevel;
  };
  commercial: {
    suggestedProduct: string;
    targetAudience: string;
    distributionChannel: string;
    pricingHypothesis: string;
  };
  safety: {
    licenseReviewRequired: boolean;
    humanApprovalRequired: boolean;
    noAutoFork: boolean;
    noAutoDeploy: boolean;
    noAutoPublish: boolean;
  };
}

export interface ForgeProductReadyPayload {
  source: 'gxeon-app-forge';
  type: 'product_ready_for_integration';
  product: {
    name: string;
    status: 'draft' | 'manual_distribution_ready' | 'blocked_pending_review';
    catalogId: string;
    deliveryType: string;
  };
  integrationRequest: {
    target: 'hotmart_future' | 'core_future' | 'manual_review';
    mode: 'dry_run';
    needsWebhook: boolean;
    needsProductMapping: boolean;
  };
  approval: {
    humanApproved: boolean;
    nextAction: string;
  };
}

export interface CoreBridgeSafetyFlags {
  localOnly: true;
  dryRunOnly: true;
  noRealCoreApi: true;
  noExternalActions: true;
  noTokensStored: true;
  noWebhooks: true;
  noAutoDeploy: true;
  noAutoPublish: true;
  humanApprovalRequired: true;
}

export interface CoreBridgeMockState {
  opportunity: CoreOpportunityPayload;
  productReady: ForgeProductReadyPayload;
  safetyFlags: CoreBridgeSafetyFlags;
  updatedAt: string;
}

export const CORE_BRIDGE_OPPORTUNITY_STORAGE_KEY = 'gxeon.coreBridge.opportunity.v1';
export const CORE_BRIDGE_PRODUCT_READY_STORAGE_KEY = 'gxeon.coreBridge.productReady.v1';
export const CORE_BRIDGE_STATE_STORAGE_KEY = 'gxeon.coreBridge.mockState.v1';

export const CORE_BRIDGE_SAFETY_FLAGS: CoreBridgeSafetyFlags = {
  localOnly: true,
  dryRunOnly: true,
  noRealCoreApi: true,
  noExternalActions: true,
  noTokensStored: true,
  noWebhooks: true,
  noAutoDeploy: true,
  noAutoPublish: true,
  humanApprovalRequired: true,
};

const SECRET_LIKE_KEYS = ['token', 'secret', 'password', 'apiKey', 'apikey', 'authorization', 'webhook', 'checkoutUrl'];
const asText = (value: unknown, fallback = '') => (typeof value === 'string' && value.trim() ? value.trim() : fallback);
const asBool = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);
const asNumber = (value: unknown, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const asList = (value: unknown) => (Array.isArray(value) ? value.map((item) => asText(item)).filter(Boolean) : []);
const asRisk = (value: unknown): CoreBridgeRiskLevel =>
  value === 'low' || value === 'medium' || value === 'high' ? value : 'unknown';

export const MOCK_CORE_OPPORTUNITY_PAYLOAD: CoreOpportunityPayload = {
  source: 'gxeon-core',
  type: 'repo_product_opportunity',
  repo: {
    url: 'https://github.com/example/project',
    name: 'project',
    owner: 'example',
    license: 'MIT',
    stars: 12000,
    lastCommit: '2026-06-20',
  },
  technical: {
    stack: ['React', 'Node'],
    deployTargets: ['Railway', 'Vercel'],
    complexity: 'medium',
    securityRisk: 'medium',
  },
  commercial: {
    suggestedProduct: 'GXEON Campaign OS',
    targetAudience: 'gestores de tráfego e afiliados',
    distributionChannel: 'Hotmart future',
    pricingHypothesis: 'R$297-R$997',
  },
  safety: {
    licenseReviewRequired: true,
    humanApprovalRequired: true,
    noAutoFork: true,
    noAutoDeploy: true,
    noAutoPublish: true,
  },
};

export const MOCK_FORGE_PRODUCT_READY_PAYLOAD: ForgeProductReadyPayload = {
  source: 'gxeon-app-forge',
  type: 'product_ready_for_integration',
  product: {
    name: 'GXEON Campaign OS',
    status: 'manual_distribution_ready',
    catalogId: 'pc_campaign_os_001',
    deliveryType: 'system_access_plus_training',
  },
  integrationRequest: {
    target: 'hotmart_future',
    mode: 'dry_run',
    needsWebhook: true,
    needsProductMapping: true,
  },
  approval: {
    humanApproved: false,
    nextAction: 'review_hotmart_delivery_blueprint',
  },
};

export function stripSecretLikeCoreBridgeFields<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => stripSecretLikeCoreBridgeFields(item)) as T;
  }

  if (!input || typeof input !== 'object') {
    return input;
  }

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>)
      .filter(([key]) => !SECRET_LIKE_KEYS.some((secretKey) => key.toLowerCase().includes(secretKey.toLowerCase())))
      .map(([key, value]) => [key, stripSecretLikeCoreBridgeFields(value)]),
  ) as T;
}

export function normalizeCoreOpportunityPayload(input: Partial<CoreOpportunityPayload> = {}): CoreOpportunityPayload {
  const safe = stripSecretLikeCoreBridgeFields(input) as Partial<CoreOpportunityPayload>;
  const repo = safe.repo ?? {};
  const technical = safe.technical ?? {};
  const commercial = safe.commercial ?? {};
  const safety = safe.safety ?? {};

  return {
    source: 'gxeon-core',
    type: 'repo_product_opportunity',
    repo: {
      url: asText(repo.url, MOCK_CORE_OPPORTUNITY_PAYLOAD.repo.url),
      name: asText(repo.name, MOCK_CORE_OPPORTUNITY_PAYLOAD.repo.name),
      owner: asText(repo.owner, MOCK_CORE_OPPORTUNITY_PAYLOAD.repo.owner),
      license: asText(repo.license, 'UNREVIEWED'),
      stars: asNumber(repo.stars),
      lastCommit: asText(repo.lastCommit, 'unknown'),
    },
    technical: {
      stack: asList(technical.stack).length ? asList(technical.stack) : ['Unknown'],
      deployTargets: asList(technical.deployTargets),
      complexity: asRisk(technical.complexity),
      securityRisk: asRisk(technical.securityRisk),
    },
    commercial: {
      suggestedProduct: asText(commercial.suggestedProduct, 'Untitled Forge Product'),
      targetAudience: asText(commercial.targetAudience, 'manual review required'),
      distributionChannel: asText(commercial.distributionChannel, 'manual/local only'),
      pricingHypothesis: asText(commercial.pricingHypothesis, 'manual review required'),
    },
    safety: {
      licenseReviewRequired: asBool(safety.licenseReviewRequired, true),
      humanApprovalRequired: true,
      noAutoFork: true,
      noAutoDeploy: true,
      noAutoPublish: true,
    },
  };
}

export function normalizeForgeProductReadyPayload(
  input: Partial<ForgeProductReadyPayload> = {},
): ForgeProductReadyPayload {
  const safe = stripSecretLikeCoreBridgeFields(input) as Partial<ForgeProductReadyPayload>;
  const product = safe.product ?? {};
  const integrationRequest = safe.integrationRequest ?? {};
  const approval = safe.approval ?? {};

  return {
    source: 'gxeon-app-forge',
    type: 'product_ready_for_integration',
    product: {
      name: asText(product.name, MOCK_FORGE_PRODUCT_READY_PAYLOAD.product.name),
      status:
        product.status === 'draft' || product.status === 'blocked_pending_review'
          ? product.status
          : 'manual_distribution_ready',
      catalogId: asText(product.catalogId, 'pc_local_draft'),
      deliveryType: asText(product.deliveryType, 'manual_delivery'),
    },
    integrationRequest: {
      target:
        integrationRequest.target === 'core_future' || integrationRequest.target === 'manual_review'
          ? integrationRequest.target
          : 'hotmart_future',
      mode: 'dry_run',
      needsWebhook: asBool(integrationRequest.needsWebhook, false),
      needsProductMapping: asBool(integrationRequest.needsProductMapping, true),
    },
    approval: {
      humanApproved: false,
      nextAction: asText(approval.nextAction, 'human_review_required'),
    },
  };
}

export function buildCoreBridgeJson(opportunity: CoreOpportunityPayload, productReady: ForgeProductReadyPayload) {
  return JSON.stringify(
    {
      bridge: 'gxeon-core-to-forge-local-only',
      safetyFlags: CORE_BRIDGE_SAFETY_FLAGS,
      opportunity: normalizeCoreOpportunityPayload(opportunity),
      productReady: normalizeForgeProductReadyPayload(productReady),
    },
    null,
    2,
  );
}

export function buildCoreBridgeMarkdown(opportunity: CoreOpportunityPayload, productReady: ForgeProductReadyPayload) {
  const core = normalizeCoreOpportunityPayload(opportunity);
  const forge = normalizeForgeProductReadyPayload(productReady);

  return [
    '# GXEON Core Bridge — Local Mock Contract',
    '',
    '## Core-to-Forge Opportunity',
    `- Repo: ${core.repo.owner}/${core.repo.name}`,
    `- URL reference: ${core.repo.url} (reference only; no request executed)`,
    `- License: ${core.repo.license} (review required: ${core.safety.licenseReviewRequired})`,
    `- Stack: ${core.technical.stack.join(', ')}`,
    `- Risk: complexity ${core.technical.complexity}; security ${core.technical.securityRisk}`,
    `- Product potential: ${core.commercial.suggestedProduct} for ${core.commercial.targetAudience}`,
    `- Channel fit: ${core.commercial.distributionChannel}; pricing hypothesis ${core.commercial.pricingHypothesis}`,
    '',
    '## Forge-to-Core Product Readiness',
    `- Product: ${forge.product.name} (${forge.product.status})`,
    `- Catalog ID: ${forge.product.catalogId}`,
    `- Delivery: ${forge.product.deliveryType}`,
    `- Integration target: ${forge.integrationRequest.target} in ${forge.integrationRequest.mode}`,
    `- Next action: ${forge.approval.nextAction}`,
    '',
    '## Safety',
    ...Object.entries(CORE_BRIDGE_SAFETY_FLAGS).map(([key, value]) => `- ${key}: ${value}`),
  ].join('\n');
}
