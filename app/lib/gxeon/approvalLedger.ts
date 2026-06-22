export const APPROVAL_LEDGER_STORAGE_KEY = 'gxeon.approvalLedger.entries.v1';

export const LEDGER_ITEM_STATUSES = [
  'draft',
  'generated',
  'needs_review',
  'approved_manual',
  'blocked',
  'ready_for_beta',
  'archived',
] as const;
export const LEDGER_ITEM_TYPES = [
  'product_blueprint',
  'marketplace_pack',
  'checkout_blueprint',
  'landing_blueprint',
  'content_pack',
  'integration_readiness',
  'operator_decision',
  'risk_review',
  'evidence_note',
] as const;
export const LEDGER_RISK_LEVELS = ['low', 'medium', 'high'] as const;

export type LedgerItemStatus = (typeof LEDGER_ITEM_STATUSES)[number];
export type LedgerItemType = (typeof LEDGER_ITEM_TYPES)[number];
export type LedgerRiskLevel = (typeof LEDGER_RISK_LEVELS)[number];

export interface ApprovalLedgerEntry {
  id: string;
  type: LedgerItemType;
  status: LedgerItemStatus;
  productName: string;
  summary: string;
  sourceModule: string;
  riskLevel: LedgerRiskLevel;
  approvalRequired: boolean;
  approvedBy: string;
  approvalNotes: string;
  evidenceNotes: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalLedgerExport {
  entries: ApprovalLedgerEntry[];
  summary: ReturnType<typeof summarizeLedgerEntries>;
  markdown: string;
  safety: {
    localOnly: true;
    noDatabase: true;
    noRealApiCalls: true;
    noLivePayments: true;
    noAutoPublishing: true;
    noSecretsStored: true;
    humanApproved: true;
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
const FALLBACK_DATE = '1970-01-01T00:00:00.000Z';

const nowIso = () => new Date().toISOString();
const oneOf = <T extends readonly string[]>(values: T, value: unknown, fallback: T[number]) =>
  values.includes(value as T[number]) ? (value as T[number]) : fallback;

export function sanitizeLedgerValue(value: unknown) {
  return typeof value === 'string'
    ? value.replace(DELIMITERS, '[sanitized-delimiter]').replace(CONTROL_CHARS, ' ').trim().slice(0, 900)
    : '';
}

function stripSecretLikeFields<T>(input: T): T {
  return JSON.parse(
    JSON.stringify(input, (key, value) => {
      if (SECRET_LIKE_KEYS.has(key.toLowerCase())) {
        return undefined;
      }

      return typeof value === 'string' ? sanitizeLedgerValue(value) : value;
    }),
  ) as T;
}

export function normalizeLedgerEntry(input: Partial<ApprovalLedgerEntry>, now = nowIso()): ApprovalLedgerEntry {
  const riskLevel = oneOf(LEDGER_RISK_LEVELS, input.riskLevel, 'medium');
  const requestedStatus = oneOf(LEDGER_ITEM_STATUSES, input.status, 'draft');
  const approvalRequired = Boolean(input.approvalRequired ?? riskLevel !== 'low');
  const status = riskLevel === 'high' && !input.status ? 'needs_review' : requestedStatus;

  return stripSecretLikeFields({
    id: sanitizeLedgerValue(input.id) || `ledger-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: oneOf(LEDGER_ITEM_TYPES, input.type, 'operator_decision'),
    status,
    productName: sanitizeLedgerValue(input.productName) || 'Produto sem nome',
    summary: sanitizeLedgerValue(input.summary),
    sourceModule: sanitizeLedgerValue(input.sourceModule) || 'Manual operator entry',
    riskLevel,
    approvalRequired,
    approvedBy: sanitizeLedgerValue(input.approvedBy),
    approvalNotes: sanitizeLedgerValue(input.approvalNotes),
    evidenceNotes: sanitizeLedgerValue(input.evidenceNotes),
    nextAction: sanitizeLedgerValue(input.nextAction) || 'Revisar manualmente antes de qualquer ativação externa.',
    createdAt: sanitizeLedgerValue(input.createdAt) || now,
    updatedAt: now,
  });
}

export function createLedgerEntry(input: Partial<ApprovalLedgerEntry> = {}, now = nowIso()) {
  return normalizeLedgerEntry({ ...input, createdAt: input.createdAt || now }, now);
}

export function summarizeLedgerEntries(entries: ApprovalLedgerEntry[]) {
  return {
    total: entries.length,
    approved: entries.filter((e) => e.status === 'approved_manual').length,
    blocked: entries.filter((e) => e.status === 'blocked').length,
    needsReview: entries.filter((e) => e.status === 'needs_review').length,
    readyForBeta: entries.filter((e) => e.status === 'ready_for_beta').length,
  };
}

export function buildApprovalLedgerMarkdown(entriesInput: Partial<ApprovalLedgerEntry>[], exportedAt = nowIso()) {
  const entries = entriesInput.map((entry) => normalizeLedgerEntry(entry, entry.updatedAt || FALLBACK_DATE));
  const summary = summarizeLedgerEntries(entries);
  const lines = [
    '# GXEON Approval & Operations Ledger',
    '',
    `Exported at: ${exportedAt}`,
    '',
    'Local-only operational record. Not legal, tax, financial, compliance or automatic approval advice.',
    'No database, APIs, payments, checkout links, webhooks, n8n connections, messages or auto-publishing are activated.',
    '',
    `Summary: total ${summary.total}, approved ${summary.approved}, blocked ${summary.blocked}, needs review ${summary.needsReview}, ready for beta ${summary.readyForBeta}.`,
    '',
  ];

  entries.forEach((entry, index) => {
    lines.push(
      `## ${index + 1}. ${entry.productName}`,
      `- Type: ${entry.type}`,
      `- Status: ${entry.status}`,
      `- Source module: ${entry.sourceModule}`,
      `- Risk level: ${entry.riskLevel}`,
      `- Approval required: ${entry.approvalRequired ? 'yes - human approval required before activation' : 'no, but human review is still recommended'}`,
      `- Approved by: ${entry.approvedBy || 'not approved'}`,
      `- Summary: ${entry.summary || 'No summary provided.'}`,
      `- Approval notes: ${entry.approvalNotes || 'Pending operator notes.'}`,
      `- Evidence notes: ${entry.evidenceNotes || 'No evidence attached.'}`,
      `- Next action: ${entry.nextAction}`,
      '',
    );
  });

  return lines.join('\n');
}

export function buildApprovalLedgerJson(
  entriesInput: Partial<ApprovalLedgerEntry>[],
  exportedAt = nowIso(),
): ApprovalLedgerExport {
  const entries = entriesInput.map((entry) => normalizeLedgerEntry(entry, entry.updatedAt || FALLBACK_DATE));
  return stripSecretLikeFields({
    entries,
    summary: summarizeLedgerEntries(entries),
    markdown: buildApprovalLedgerMarkdown(entries, exportedAt),
    safety: {
      localOnly: true,
      noDatabase: true,
      noRealApiCalls: true,
      noLivePayments: true,
      noAutoPublishing: true,
      noSecretsStored: true,
      humanApproved: true,
    },
    exportedAt,
  });
}

export function stringifyApprovalLedgerJson(entriesInput: Partial<ApprovalLedgerEntry>[], exportedAt = nowIso()) {
  return JSON.stringify(buildApprovalLedgerJson(entriesInput, exportedAt), null, 2);
}
