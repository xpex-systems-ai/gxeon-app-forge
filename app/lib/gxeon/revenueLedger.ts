export const REVENUE_LEDGER_STORAGE_KEY = 'gxeon.revenueLedger.entries.v1';

export const REVENUE_LEDGER_STATUSES = [
  'planned',
  'offer_prepared',
  'sent_manual',
  'pending_manual_confirmation',
  'operator_confirmed',
  'lost',
  'refunded',
  'cancelled',
  'archived',
] as const;
export const REVENUE_CHANNELS = [
  'manual_whatsapp',
  'manual_email',
  'manual_instagram',
  'manual_linkedin',
  'manual_landing_page',
  'manual_marketplace',
  'manual_call',
  'partner',
  'affiliate_manual',
  'other',
] as const;
export const REVENUE_PROOF_TYPES = [
  'none',
  'operator_note',
  'screenshot_reference',
  'manual_receipt_reference',
  'platform_dashboard_checked_manually',
  'bank_statement_checked_manually',
  'customer_confirmation_manual',
  'other',
] as const;
export const REVENUE_CURRENCIES = ['BRL', 'USD', 'EUR', 'OTHER'] as const;

export type RevenueLedgerStatus = (typeof REVENUE_LEDGER_STATUSES)[number];
export type RevenueChannel = (typeof REVENUE_CHANNELS)[number];
export type RevenueProofType = (typeof REVENUE_PROOF_TYPES)[number];
export type RevenueCurrency = (typeof REVENUE_CURRENCIES)[number];

export interface RevenueLedgerEntry {
  id: string;
  productName: string;
  pipelineItemId: string;
  sourceModule: string;
  channel: RevenueChannel;
  status: RevenueLedgerStatus;
  currency: RevenueCurrency;
  plannedPrice: number;
  manualConfirmedAmount: number;
  estimatedCost: number;
  netEstimate: number;
  quantity: number;
  buyerOrSegment: string;
  offerSummary: string;
  proofType: RevenueProofType;
  proofNotes: string;
  riskNotes: string;
  nextAction: string;
  operatorConfirmedBy: string;
  operatorConfirmedAt: string;
  createdAt: string;
  updatedAt: string;
}
export interface RevenueLedgerSummary {
  totalEntries: number;
  plannedTotal: number;
  operatorConfirmedTotal: number;
  estimatedCostTotal: number;
  netEstimateTotal: number;
  pendingManualConfirmation: number;
  lostOrCancelled: number;
  operatorConfirmedCount: number;
}
export interface RevenueLedgerExport {
  entries: RevenueLedgerEntry[];
  summary: RevenueLedgerSummary;
  markdown: string;
  safety: {
    localOnly: true;
    noPaymentProcessing: true;
    noCheckoutCreation: true;
    noRealApiCalls: true;
    noAutoPublishing: true;
    noSecretsStored: true;
    operatorConfirmationRequired: true;
    notFinancialAdvice: true;
    notTaxReceipt: true;
  };
  exportedAt: string;
}

export const REVENUE_SECRET_LIKE_KEYS = new Set([
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
  'pix_key',
  'bank_account',
]);

const DELIMITERS = /<\/?gxeon[^>]*>|```|---|\|/gi;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const nowIso = () => new Date().toISOString();
const oneOf = <T extends readonly string[]>(values: T, value: unknown, fallback: T[number]) =>
  values.includes(value as T[number]) ? (value as T[number]) : fallback;

export function sanitizeRevenueLedgerValue(value: unknown, limit = 700) {
  return typeof value === 'string'
    ? value.replace(DELIMITERS, ' ').replace(CONTROL_CHARS, ' ').replace(/\s+/g, ' ').trim().slice(0, limit)
    : '';
}
export function sanitizeRevenueLedgerObject<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeRevenueLedgerObject(item)) as T;
  }

  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>)
        .filter(([k]) => !REVENUE_SECRET_LIKE_KEYS.has(k.toLowerCase()))
        .map(([k, v]) => [k, typeof v === 'string' ? sanitizeRevenueLedgerValue(v) : sanitizeRevenueLedgerObject(v)]),
    ) as T;
  }

  return (typeof input === 'string' ? sanitizeRevenueLedgerValue(input) : input) as T;
}
export function parseRevenueNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Number(value.toFixed(2)));
  }

  const raw = sanitizeRevenueLedgerValue(value).replace(/[^\d,.-]/g, '');
  const decimalComma = /,\d{1,2}$/.test(raw);
  const normalized = decimalComma ? raw.replace(/\./g, '').replace(/,(?=\d{1,2}$)/, '.') : raw.replace(/,/g, '');
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? Math.max(0, Number(parsed.toFixed(2))) : fallback;
}

function date(value: unknown, fallback = nowIso()) {
  const s = sanitizeRevenueLedgerValue(value);
  return Number.isNaN(Date.parse(s)) ? fallback : new Date(s).toISOString();
}

export function calculateRevenueNetEstimate(
  entry: Pick<RevenueLedgerEntry, 'status' | 'manualConfirmedAmount' | 'plannedPrice' | 'estimatedCost' | 'quantity'>,
) {
  const gross =
    entry.status === 'operator_confirmed'
      ? entry.manualConfirmedAmount
      : entry.plannedPrice * Math.max(1, entry.quantity || 1);
  return Number((gross - entry.estimatedCost).toFixed(2));
}
export function normalizeRevenueLedgerEntry(
  input: Partial<RevenueLedgerEntry> = {},
  now = nowIso(),
): RevenueLedgerEntry {
  const status = oneOf(REVENUE_LEDGER_STATUSES, input.status, 'planned');
  const quantity = Math.max(1, Math.round(parseRevenueNumber(input.quantity, 1)) || 1);
  const entry = sanitizeRevenueLedgerObject({
    id: sanitizeRevenueLedgerValue(input.id) || `revenue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productName: sanitizeRevenueLedgerValue(input.productName) || 'Untitled revenue hypothesis',
    pipelineItemId: sanitizeRevenueLedgerValue(input.pipelineItemId),
    sourceModule: sanitizeRevenueLedgerValue(input.sourceModule) || 'Manual Revenue Ledger entry',
    channel: oneOf(REVENUE_CHANNELS, input.channel, 'other'),
    status,
    currency: oneOf(REVENUE_CURRENCIES, input.currency, 'BRL'),
    plannedPrice: parseRevenueNumber(input.plannedPrice),
    manualConfirmedAmount: parseRevenueNumber(input.manualConfirmedAmount),
    estimatedCost: parseRevenueNumber(input.estimatedCost),
    netEstimate: 0,
    quantity,
    buyerOrSegment: sanitizeRevenueLedgerValue(input.buyerOrSegment),
    offerSummary: sanitizeRevenueLedgerValue(input.offerSummary),
    proofType: oneOf(REVENUE_PROOF_TYPES, input.proofType, 'none'),
    proofNotes: sanitizeRevenueLedgerValue(input.proofNotes),
    riskNotes: sanitizeRevenueLedgerValue(input.riskNotes),
    nextAction: sanitizeRevenueLedgerValue(input.nextAction) || 'Define next manual commercial action.',
    operatorConfirmedBy: sanitizeRevenueLedgerValue(input.operatorConfirmedBy),
    operatorConfirmedAt: status === 'operator_confirmed' ? date(input.operatorConfirmedAt, now) : '',
    createdAt: date(input.createdAt, now),
    updatedAt: now,
  }) as RevenueLedgerEntry;
  entry.netEstimate = calculateRevenueNetEstimate(entry);

  return entry;
}
export function createRevenueLedgerEntry(input: Partial<RevenueLedgerEntry> = {}, now = nowIso()) {
  return normalizeRevenueLedgerEntry(
    { createdAt: now, updatedAt: now, ...input, status: input.status || 'planned' },
    now,
  );
}
export function calculateRevenueLedgerSummary(entriesInput: Partial<RevenueLedgerEntry>[]): RevenueLedgerSummary {
  const entries = entriesInput.map((e) => normalizeRevenueLedgerEntry(e, e.updatedAt || nowIso()));
  return {
    totalEntries: entries.length,
    plannedTotal: entries.reduce((s, e) => s + e.plannedPrice * e.quantity, 0),
    operatorConfirmedTotal: entries.reduce(
      (s, e) => s + (e.status === 'operator_confirmed' ? e.manualConfirmedAmount : 0),
      0,
    ),
    estimatedCostTotal: entries.reduce((s, e) => s + e.estimatedCost, 0),
    netEstimateTotal: entries.reduce((s, e) => s + e.netEstimate, 0),
    pendingManualConfirmation: entries.filter((e) => e.status === 'pending_manual_confirmation').length,
    lostOrCancelled: entries.filter((e) => ['lost', 'cancelled', 'refunded'].includes(e.status)).length,
    operatorConfirmedCount: entries.filter((e) => e.status === 'operator_confirmed').length,
  };
}
export function buildRevenueLedgerMarkdown(entriesInput: Partial<RevenueLedgerEntry>[], exportedAt = nowIso()) {
  const entries = entriesInput.map((e) => normalizeRevenueLedgerEntry(e, e.updatedAt || exportedAt));
  const summary = calculateRevenueLedgerSummary(entries);

  return [
    '# GXEON Revenue Ledger MVP',
    '',
    `Exported at: ${exportedAt}`,
    '',
    'Local-only planning ledger. This is not financial advice, not tax documentation, and not a payment processor settlement record.',
    'Operator confirmation is manual evidence only; platform dashboards, banks and payment processors must be checked outside this MVP.',
    'No database, APIs, payment processing, checkout creation, webhooks, n8n, emails, WhatsApp, social posting or auto-publication are activated.',
    '',
    `## Summary`,
    `- Total entries: ${summary.totalEntries}`,
    `- Planned total: ${summary.plannedTotal}`,
    `- Operator confirmed total: ${summary.operatorConfirmedTotal}`,
    `- Estimated costs: ${summary.estimatedCostTotal}`,
    `- Net estimate: ${summary.netEstimateTotal}`,
    `- Pending manual confirmation: ${summary.pendingManualConfirmation}`,
    `- Lost/cancelled/refunded: ${summary.lostOrCancelled}`,
    '',
    ...entries.flatMap((e, i) => [
      `## ${i + 1}. ${e.productName}`,
      `- Status: ${e.status}`,
      `- Channel: ${e.channel}`,
      `- Proof type: ${e.proofType}`,
      `- Planned price: ${e.currency} ${e.plannedPrice} x ${e.quantity}`,
      `- Manual confirmed amount: ${e.currency} ${e.manualConfirmedAmount}`,
      `- Estimated cost: ${e.currency} ${e.estimatedCost}`,
      `- Net estimate: ${e.currency} ${e.netEstimate}`,
      `- Buyer/segment: ${e.buyerOrSegment || 'not recorded'}`,
      `- Offer summary: ${e.offerSummary || 'not recorded'}`,
      `- Proof notes: ${e.proofNotes || 'manual proof not recorded'}`,
      `- Risk notes: ${e.riskNotes || 'none recorded'}`,
      `- Next action: ${e.nextAction}`,
      '',
    ]),
  ].join('\n');
}
export function buildRevenueLedgerJson(
  entriesInput: Partial<RevenueLedgerEntry>[],
  exportedAt = nowIso(),
): RevenueLedgerExport {
  const entries = entriesInput.map((e) => normalizeRevenueLedgerEntry(e, e.updatedAt || exportedAt));
  return sanitizeRevenueLedgerObject({
    entries,
    summary: calculateRevenueLedgerSummary(entries),
    markdown: buildRevenueLedgerMarkdown(entries, exportedAt),
    safety: {
      localOnly: true,
      noPaymentProcessing: true,
      noCheckoutCreation: true,
      noRealApiCalls: true,
      noAutoPublishing: true,
      noSecretsStored: true,
      operatorConfirmationRequired: true,
      notFinancialAdvice: true,
      notTaxReceipt: true,
    },
    exportedAt,
  });
}
export function stringifyRevenueLedgerJson(entriesInput: Partial<RevenueLedgerEntry>[], exportedAt = nowIso()) {
  return JSON.stringify(buildRevenueLedgerJson(entriesInput, exportedAt), null, 2);
}
