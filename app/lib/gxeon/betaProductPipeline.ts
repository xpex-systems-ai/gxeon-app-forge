export const BETA_PRODUCT_PIPELINE_STORAGE_KEY = 'gxeon.betaProductPipeline.items.v1';

export const BETA_PRODUCT_STAGES = [
  'idea',
  'product_draft',
  'pack_ready',
  'checkout_ready',
  'landing_ready',
  'content_ready',
  'integration_dry_run_ready',
  'needs_review',
  'approved_for_beta',
  'manual_published',
  'testing',
  'paused',
  'archived',
] as const;
export const BETA_PRODUCT_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const READINESS_KEYS = [
  'productBlueprint',
  'marketplacePack',
  'checkoutBlueprint',
  'landingBlueprint',
  'contentPack',
  'integrationDryRun',
  'approvalLedgerEntry',
  'humanApproval',
] as const;
export type BetaProductStage = (typeof BETA_PRODUCT_STAGES)[number];
export type BetaProductPriority = (typeof BETA_PRODUCT_PRIORITIES)[number];
export type BetaProductReadiness = Record<(typeof READINESS_KEYS)[number], boolean>;
export interface BetaProductPipelineItem {
  id: string;
  productName: string;
  niche: string;
  audience: string;
  offer: string;
  basePrice: string;
  stage: BetaProductStage;
  priority: BetaProductPriority;
  readiness: BetaProductReadiness;
  readinessScore: number;
  blockers: string;
  nextAction: string;
  launchNotes: string;
  evidenceNotes: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}
export interface BetaProductPipelineExport {
  items: BetaProductPipelineItem[];
  summary: ReturnType<typeof summarizeBetaPipelineItems>;
  markdown: string;
  safety: {
    localOnly: true;
    noDatabase: true;
    noRealApiCalls: true;
    noLivePayments: true;
    noAutoPublishing: true;
    noSecretsStored: true;
    humanApprovedRequired: true;
  };
  exportedAt: string;
}

const SECRET_LIKE_KEYS = new Set([
  'api_key',
  'apikey',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'client_secret',
  'password',
  'credential',
  'cookie',
  'stripe_key',
  'webhook_secret',
  'social_token',
  'email_api_key',
  'whatsapp_token',
]);
const DELIMITERS = /<\/?gxeon[^>]*>|```|---/gi;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const nowIso = () => new Date().toISOString();
export const emptyBetaReadiness = (): BetaProductReadiness => ({
  productBlueprint: false,
  marketplacePack: false,
  checkoutBlueprint: false,
  landingBlueprint: false,
  contentPack: false,
  integrationDryRun: false,
  approvalLedgerEntry: false,
  humanApproval: false,
});
export function sanitizeBetaPipelineText(value: unknown) {
  return typeof value === 'string'
    ? value.replace(DELIMITERS, ' ').replace(CONTROL_CHARS, ' ').replace(/\s+/g, ' ').trim().slice(0, 600)
    : '';
}

function stage(v: unknown): BetaProductStage {
  return BETA_PRODUCT_STAGES.includes(v as BetaProductStage) ? (v as BetaProductStage) : 'idea';
}

function priority(v: unknown): BetaProductPriority {
  return BETA_PRODUCT_PRIORITIES.includes(v as BetaProductPriority) ? (v as BetaProductPriority) : 'medium';
}

function id(v: unknown) {
  return sanitizeBetaPipelineText(v) || `beta-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function date(v: unknown, fallback = nowIso()) {
  const s = sanitizeBetaPipelineText(v);
  return Number.isNaN(Date.parse(s)) ? fallback : new Date(s).toISOString();
}

export function sanitizeBetaPipelineObject<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeBetaPipelineObject(item)) as T;
  }

  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>)
        .filter(([k]) => !SECRET_LIKE_KEYS.has(k.toLowerCase()))
        .map(([k, v]) => [k, typeof v === 'string' ? sanitizeBetaPipelineText(v) : sanitizeBetaPipelineObject(v)]),
    ) as T;
  }

  return (typeof input === 'string' ? sanitizeBetaPipelineText(input) : input) as T;
}
export function calculateReadinessScore(readiness: Partial<BetaProductReadiness> = {}) {
  return Math.round((READINESS_KEYS.filter((key) => Boolean(readiness[key])).length / READINESS_KEYS.length) * 100);
}
export function normalizeBetaPipelineItem(
  input: Partial<BetaProductPipelineItem> = {},
  now = nowIso(),
): BetaProductPipelineItem {
  const createdAt = date(input.createdAt, now);
  const readiness = { ...emptyBetaReadiness(), ...(input.readiness || {}) };

  return {
    id: id(input.id),
    productName: sanitizeBetaPipelineText(input.productName) || 'Untitled beta product',
    niche: sanitizeBetaPipelineText(input.niche),
    audience: sanitizeBetaPipelineText(input.audience),
    offer: sanitizeBetaPipelineText(input.offer),
    basePrice: sanitizeBetaPipelineText(input.basePrice),
    stage: stage(input.stage),
    priority: priority(input.priority),
    readiness,
    readinessScore: calculateReadinessScore(readiness),
    blockers: sanitizeBetaPipelineText(input.blockers),
    nextAction: sanitizeBetaPipelineText(input.nextAction),
    launchNotes: sanitizeBetaPipelineText(input.launchNotes),
    evidenceNotes: sanitizeBetaPipelineText(input.evidenceNotes),
    owner: sanitizeBetaPipelineText(input.owner),
    createdAt,
    updatedAt: date(input.updatedAt, now),
  };
}
export function createBetaPipelineItem(input: Partial<BetaProductPipelineItem> = {}, now = nowIso()) {
  return normalizeBetaPipelineItem({ createdAt: now, updatedAt: now, ...input }, now);
}
export function isBetaItemNeedsReview(item: Pick<BetaProductPipelineItem, 'stage' | 'blockers' | 'readiness'>) {
  return (
    Boolean(item.blockers.trim()) ||
    item.stage === 'needs_review' ||
    (item.stage === 'approved_for_beta' && !item.readiness.humanApproval)
  );
}
export function summarizeBetaPipelineItems(items: BetaProductPipelineItem[]) {
  const normalized = items.map((i) => normalizeBetaPipelineItem(i));
  const total = normalized.length;

  return {
    total,
    approvedForBeta: normalized.filter((i) => i.stage === 'approved_for_beta').length,
    testing: normalized.filter((i) => i.stage === 'testing').length,
    blockedOrNeedsReview: normalized.filter(isBetaItemNeedsReview).length,
    manualPublished: normalized.filter((i) => i.stage === 'manual_published').length,
    averageReadinessScore: total ? Math.round(normalized.reduce((sum, i) => sum + i.readinessScore, 0) / total) : 0,
  };
}
export function buildBetaPipelineMarkdown(itemsInput: Partial<BetaProductPipelineItem>[]) {
  const items = itemsInput.map((i) => normalizeBetaPipelineItem(i));
  const summary = summarizeBetaPipelineItems(items);

  return [
    `# GXEON Beta Product Pipeline MVP`,
    ``,
    `Local-only operational planning tool. Not legal, tax, or financial advice. Manual publication must follow each platform's rules. Payment activation, checkout creation, marketplace publication, APIs, webhooks, n8n, email, social posting and WhatsApp are out of scope.`,
    ``,
    `## Summary`,
    `- Total: ${summary.total}`,
    `- Approved for beta: ${summary.approvedForBeta}`,
    `- Testing: ${summary.testing}`,
    `- Blocked / needs review: ${summary.blockedOrNeedsReview}`,
    `- Manual published: ${summary.manualPublished}`,
    `- Average readiness score: ${summary.averageReadinessScore}%`,
    ``,
    `## Items`,
    ...items.flatMap((i) => [
      `### ${i.productName}`,
      `- Stage: ${i.stage}`,
      `- Priority: ${i.priority}`,
      `- Readiness score: ${i.readinessScore}%`,
      `- Blockers: ${i.blockers || 'None recorded'}`,
      `- Next action: ${i.nextAction || 'Define next local operator action'}`,
      `- Approval warning: ${i.stage === 'approved_for_beta' && !i.readiness.humanApproval ? 'Human approval is still required before beta execution.' : 'Human approval gate tracked locally.'}`,
      `- Launch notes: ${i.launchNotes || 'Manual planning only; no automatic launch.'}`,
      ``,
    ]),
  ].join('\n');
}
export function buildBetaPipelineJson(
  itemsInput: Partial<BetaProductPipelineItem>[],
  exportedAt = nowIso(),
): BetaProductPipelineExport {
  const items = sanitizeBetaPipelineObject(itemsInput).map((i) => normalizeBetaPipelineItem(i, exportedAt));
  return {
    items,
    summary: summarizeBetaPipelineItems(items),
    markdown: buildBetaPipelineMarkdown(items),
    safety: {
      localOnly: true,
      noDatabase: true,
      noRealApiCalls: true,
      noLivePayments: true,
      noAutoPublishing: true,
      noSecretsStored: true,
      humanApprovedRequired: true,
    },
    exportedAt,
  };
}
export function stringifyBetaPipelineJson(itemsInput: Partial<BetaProductPipelineItem>[]) {
  return JSON.stringify(buildBetaPipelineJson(itemsInput), null, 2);
}
