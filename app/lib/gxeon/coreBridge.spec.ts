import { describe, expect, it } from 'vitest';
import {
  CORE_BRIDGE_SAFETY_FLAGS,
  MOCK_CORE_OPPORTUNITY_PAYLOAD,
  MOCK_FORGE_PRODUCT_READY_PAYLOAD,
  buildCoreBridgeJson,
  buildCoreBridgeMarkdown,
  normalizeCoreOpportunityPayload,
  normalizeForgeProductReadyPayload,
  stripSecretLikeCoreBridgeFields,
} from './coreBridge';

describe('core bridge local-only contracts', () => {
  it('normalizes Core-to-Forge opportunity payloads with safe constants', () => {
    const normalized = normalizeCoreOpportunityPayload({
      repo: { name: 'scanner-result', stars: '42' as never },
    } as never);

    expect(normalized.source).toBe('gxeon-core');
    expect(normalized.type).toBe('repo_product_opportunity');
    expect(normalized.repo.name).toBe('scanner-result');
    expect(normalized.repo.stars).toBe(42);
    expect(normalized.safety).toMatchObject({
      humanApprovalRequired: true,
      noAutoFork: true,
      noAutoDeploy: true,
      noAutoPublish: true,
    });
  });

  it('normalizes Forge-to-Core readiness as dry-run only and not approved by default', () => {
    const normalized = normalizeForgeProductReadyPayload({
      integrationRequest: { mode: 'dry_run', needsWebhook: true, needsProductMapping: true } as never,
      approval: { humanApproved: true, nextAction: 'review' },
    });

    expect(normalized.source).toBe('gxeon-app-forge');
    expect(normalized.integrationRequest.mode).toBe('dry_run');
    expect(normalized.integrationRequest.needsWebhook).toBe(true);
    expect(normalized.integrationRequest.needsProductMapping).toBe(true);
    expect(normalized.approval.humanApproved).toBe(false);
  });

  it('preserves boolean contract anchors while forcing safety gates', () => {
    const withoutMapping = normalizeForgeProductReadyPayload({
      integrationRequest: { mode: 'dry_run', needsWebhook: true, needsProductMapping: false } as never,
      approval: { humanApproved: true, nextAction: 'review' },
    });
    const withMapping = normalizeForgeProductReadyPayload({
      integrationRequest: { mode: 'dry_run', needsWebhook: true, needsProductMapping: true } as never,
    });

    expect(withoutMapping.integrationRequest.needsWebhook).toBe(true);
    expect(withoutMapping.integrationRequest.needsProductMapping).toBe(false);
    expect(withoutMapping.approval.humanApproved).toBe(false);
    expect(withMapping.integrationRequest.needsProductMapping).toBe(true);
  });

  it('strips secret-like fields recursively without removing boolean contract anchors', () => {
    const stripped = stripSecretLikeCoreBridgeFields({
      password: 'x',
      webhookUrl: 'https://hooks.example.test',
      webhookSecret: 'hidden',
      webhookToken: 'hidden',
      needsWebhook: true,
      nested: { apiKey: 'hidden', safe: 'kept', needsProductMapping: false },
    });

    expect(stripped).toEqual({ needsWebhook: true, nested: { safe: 'kept', needsProductMapping: false } });
  });

  it('exposes all required safety flags', () => {
    expect(CORE_BRIDGE_SAFETY_FLAGS).toEqual({
      localOnly: true,
      dryRunOnly: true,
      noRealCoreApi: true,
      noExternalActions: true,
      noTokensStored: true,
      noWebhooks: true,
      noAutoDeploy: true,
      noAutoPublish: true,
      humanApprovalRequired: true,
    });
  });

  it('generates markdown and JSON export payloads', () => {
    const markdown = buildCoreBridgeMarkdown(MOCK_CORE_OPPORTUNITY_PAYLOAD, MOCK_FORGE_PRODUCT_READY_PAYLOAD);
    const json = JSON.parse(buildCoreBridgeJson(MOCK_CORE_OPPORTUNITY_PAYLOAD, MOCK_FORGE_PRODUCT_READY_PAYLOAD));

    expect(markdown).toContain('GXEON Core Bridge');
    expect(markdown).toContain('reference only; no request executed');
    expect(json.safetyFlags.noExternalActions).toBe(true);
    expect(json.productReady.integrationRequest.target).toBe('hotmart_future');
  });

  it('treats external URLs as inert repo references, not active calls', () => {
    const normalized = normalizeCoreOpportunityPayload({
      repo: { url: 'https://github.com/example/project' },
    } as never);
    const markdown = buildCoreBridgeMarkdown(normalized, MOCK_FORGE_PRODUCT_READY_PAYLOAD);

    expect(normalized.repo.url).toBe('https://github.com/example/project');
    expect(markdown).toContain('reference only; no request executed');
    expect(markdown).not.toContain('fetch(');
  });

  it('can represent GitHub repo scan results without calling GitHub', () => {
    const scanResult = normalizeCoreOpportunityPayload({
      repo: {
        owner: 'example',
        name: 'project',
        url: 'https://github.com/example/project',
        license: 'MIT',
        stars: 12000,
      } as never,
      technical: {
        stack: ['React', 'Node'],
        deployTargets: ['Railway', 'Vercel'],
        complexity: 'medium',
        securityRisk: 'medium',
      },
    });

    expect(scanResult.repo.owner).toBe('example');
    expect(scanResult.technical.deployTargets).toEqual(['Railway', 'Vercel']);
    expect(scanResult.safety.noAutoFork).toBe(true);
  });
});
