import { describe, expect, it } from 'vitest';
import { normalizeForgeProductReadyPayload, stripSecretLikeCoreBridgeFields } from './coreBridge';

describe('core bridge local-only contract', () => {
  it('preserves boolean webhook and product mapping contract anchors', () => {
    const payload = normalizeForgeProductReadyPayload({
      integrationRequest: { needsWebhook: true, needsProductMapping: false, licenseReviewRequired: true },
    });
    expect(payload.integrationRequest.needsWebhook).toBe(true);
    expect(payload.integrationRequest.needsProductMapping).toBe(false);
    expect(payload.integrationRequest.licenseReviewRequired).toBe(true);
  });

  it('preserves needsProductMapping true when requested', () => {
    expect(
      normalizeForgeProductReadyPayload({ integrationRequest: { needsProductMapping: true } }).integrationRequest
        .needsProductMapping,
    ).toBe(true);
  });

  it('strips webhook endpoints, webhook secrets and webhook tokens', () => {
    expect(
      stripSecretLikeCoreBridgeFields({
        needsWebhook: true,
        webhookUrl: 'https://example.test/webhook',
        webhookSecret: 'secret',
        webhookToken: 'token',
        nested: { webhook_url: 'https://example.test/webhook' },
      }),
    ).toEqual({ needsWebhook: true, nested: {} });
  });

  it('strips generic sensitive fields without stripping boolean anchors', () => {
    expect(
      stripSecretLikeCoreBridgeFields({
        needsWebhook: true,
        needsProductMapping: true,
        licenseReviewRequired: true,
        humanApprovalRequired: true,
        noAutoFork: true,
        noAutoDeploy: true,
        noAutoPublish: true,
        token: 'x',
        secret: 'y',
        password: 'z',
        apiKey: 'a',
        authorization: 'bearer abcdefghijklmnop',
        checkoutUrl: 'https://checkout.test/pay',
      }),
    ).toEqual({
      needsWebhook: true,
      needsProductMapping: true,
      licenseReviewRequired: true,
      humanApprovalRequired: true,
      noAutoFork: true,
      noAutoDeploy: true,
      noAutoPublish: true,
    });
  });

  it('forces dry-run mode and human approval safety', () => {
    const payload = normalizeForgeProductReadyPayload({
      mode: 'live' as never,
      approval: { humanApproved: true } as never,
    });
    expect(payload.mode).toBe('dry_run');
    expect(payload.approval.humanApproved).toBe(false);
    expect(payload.safety).toMatchObject({ localOnly: true, noExternalCalls: true, noAutoDeploy: true });
  });
});
