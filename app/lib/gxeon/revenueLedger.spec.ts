import { describe, expect, it } from 'vitest';
import {
  buildRevenueLedgerJson,
  buildRevenueLedgerMarkdown,
  calculateRevenueLedgerSummary,
  createRevenueLedgerEntry,
  normalizeRevenueLedgerEntry,
  parseRevenueNumber,
  stringifyRevenueLedgerJson,
} from './revenueLedger';

const secretKeys = [
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
  'pix_key',
  'bank_account',
];

describe('revenueLedger', () => {
  it('normalizes entries and sanitizes delimiter/control text', () => {
    const entry = normalizeRevenueLedgerEntry(
      { productName: '<gxeon>Offer```', status: 'bad' as any, channel: 'manual_email', proofType: 'operator_note' },
      '2026-01-01T00:00:00.000Z',
    );
    expect(entry.productName).toBe('Offer');
    expect(entry.status).toBe('planned');
    expect(entry.channel).toBe('manual_email');
  });
  it('parses numeric price, cost, quantity and confirmed amount safely', () => {
    expect(parseRevenueNumber('BRL 1.234,56')).toBe(1234.56);

    const entry = normalizeRevenueLedgerEntry({
      plannedPrice: '297' as any,
      estimatedCost: '12.50' as any,
      quantity: '2' as any,
      manualConfirmedAmount: '500' as any,
    });
    expect(entry.plannedPrice).toBe(297);
    expect(entry.estimatedCost).toBe(12.5);
    expect(entry.quantity).toBe(2);
    expect(entry.manualConfirmedAmount).toBe(500);
  });
  it('calculates summary totals and net estimates', () => {
    const entries = [
      createRevenueLedgerEntry({ plannedPrice: 100, estimatedCost: 10, quantity: 2 }),
      createRevenueLedgerEntry({
        status: 'operator_confirmed',
        manualConfirmedAmount: 150,
        plannedPrice: 200,
        estimatedCost: 20,
      }),
    ];
    const summary = calculateRevenueLedgerSummary(entries);
    expect(summary.plannedTotal).toBe(400);
    expect(summary.operatorConfirmedTotal).toBe(150);
    expect(summary.estimatedCostTotal).toBe(30);
    expect(summary.netEstimateTotal).toBe(320);
  });
  it('keeps imported planned entries from becoming operator_confirmed automatically', () => {
    const entry = createRevenueLedgerEntry({ sourceModule: 'Beta Product Pipeline', productName: 'Imported' });
    expect(entry.status).toBe('planned');
    expect(entry.operatorConfirmedAt).toBe('');
  });
  it('exports safety flags and excludes secret-like keys', () => {
    const json = stringifyRevenueLedgerJson([
      {
        productName: 'Safe',
        ...Object.fromEntries(secretKeys.map((key) => [key, 'redacted-test-value'])),
      } as any,
    ]);
    const parsed = JSON.parse(json);
    expect(parsed.safety.localOnly).toBe(true);
    secretKeys.forEach((key) => expect(json).not.toContain(`"${key}"`));
  });
  it('markdown includes status, channel, proof type and safety warnings', () => {
    const md = buildRevenueLedgerMarkdown([
      {
        productName: 'Offer',
        status: 'pending_manual_confirmation',
        channel: 'manual_landing_page',
        proofType: 'screenshot_reference',
      },
    ]);
    expect(md).toContain('Status: pending_manual_confirmation');
    expect(md).toContain('Channel: manual_landing_page');
    expect(md).toContain('Proof type: screenshot_reference');
    expect(md).toContain('not financial advice');
    expect(md).toContain('not tax documentation');
  });
  it('builds JSON export with required flags', () => {
    const exported = buildRevenueLedgerJson([]);
    expect(exported.safety.noPaymentProcessing).toBe(true);
    expect(exported.safety.operatorConfirmationRequired).toBe(true);
  });
});
