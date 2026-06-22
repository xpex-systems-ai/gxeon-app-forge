import { describe, expect, it } from 'vitest';
import {
  buildApprovalLedgerJson,
  buildApprovalLedgerMarkdown,
  createLedgerEntry,
  normalizeLedgerEntry,
  stringifyApprovalLedgerJson,
} from './approvalLedger';

describe('approvalLedger', () => {
  it('normalizes entries and sanitizes delimiters', () => {
    const entry = normalizeLedgerEntry(
      { productName: '  Pack  ', summary: '<gxeon_secret>```ok' },
      '2026-06-22T00:00:00.000Z',
    );
    expect(entry.productName).toBe('Pack');
    expect(entry.summary).toContain('[sanitized-delimiter]');
    expect(entry.status).toBe('draft');
  });

  it('counts summary statuses', () => {
    const exported = buildApprovalLedgerJson([
      createLedgerEntry({ status: 'approved_manual' }),
      createLedgerEntry({ status: 'blocked' }),
      createLedgerEntry({ status: 'needs_review' }),
      createLedgerEntry({ status: 'ready_for_beta' }),
    ]);
    expect(exported.summary).toMatchObject({ total: 4, approved: 1, blocked: 1, needsReview: 1, readyForBeta: 1 });
  });

  it('exports safety flags', () => {
    expect(buildApprovalLedgerJson([]).safety).toEqual({
      localOnly: true,
      noDatabase: true,
      noRealApiCalls: true,
      noLivePayments: true,
      noAutoPublishing: true,
      noSecretsStored: true,
      humanApproved: true,
    });
  });

  it('excludes secret-like keys from JSON', () => {
    const json = stringifyApprovalLedgerJson([
      {
        productName: 'Secret test',
        api_key: 'x',
        token: 'x',
        access_token: 'x',
        refresh_token: 'x',
        secret: 'x',
        client_secret: 'x',
        password: 'x',
        credential: 'x',
        cookie: 'x',
        stripe_key: 'x',
        webhook_secret: 'x',
        social_token: 'x',
        email_api_key: 'x',
        whatsapp_token: 'x',
      } as unknown as Parameters<typeof stringifyApprovalLedgerJson>[0][number],
    ]);
    [
      'api_key',
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
      '"x"',
    ].forEach((needle) => expect(json).not.toContain(needle));
  });

  it('defaults high risk entries to needs_review when status is not manually supplied', () => {
    expect(createLedgerEntry({ riskLevel: 'high' }).status).toBe('needs_review');
    expect(createLedgerEntry({ riskLevel: 'high', status: 'blocked' }).status).toBe('blocked');
  });

  it('generates markdown with statuses and approval warnings', () => {
    const markdown = buildApprovalLedgerMarkdown([
      { productName: 'Beta', status: 'needs_review', approvalRequired: true, riskLevel: 'high' },
    ]);
    expect(markdown).toContain('Status: needs_review');
    expect(markdown).toContain('human approval required');
    expect(markdown).toContain('Not legal, tax, financial');
  });
});
