import { describe, expect, it } from 'vitest';
import {
  buildBetaPipelineJson,
  buildBetaPipelineMarkdown,
  calculateReadinessScore,
  createBetaPipelineItem,
  normalizeBetaPipelineItem,
  stringifyBetaPipelineJson,
  summarizeBetaPipelineItems,
} from './betaProductPipeline';

describe('betaProductPipeline', () => {
  it('normalizes items and sanitizes delimiters/control characters', () => {
    const item = normalizeBetaPipelineItem({
      productName: '```<gxeon>x</gxeon>\u0000',
      stage: 'bad' as any,
      priority: 'bad' as any,
    });
    expect(item.productName).toBe('x');
    expect(item.stage).toBe('idea');
    expect(item.priority).toBe('medium');
  });
  it('calculates readiness score from checklist', () => {
    expect(calculateReadinessScore({ productBlueprint: true, humanApproval: true })).toBe(25);
  });
  it('summarizes counts and blockers needing review', () => {
    const items = [
      createBetaPipelineItem({ stage: 'approved_for_beta', readiness: { humanApproval: true } as any }),
      createBetaPipelineItem({ stage: 'testing' }),
      createBetaPipelineItem({ stage: 'manual_published', blockers: 'Need tax review' }),
    ];
    expect(summarizeBetaPipelineItems(items)).toMatchObject({
      total: 3,
      approvedForBeta: 1,
      testing: 1,
      manualPublished: 1,
      blockedOrNeedsReview: 1,
    });
  });
  it('exports JSON safety flags and excludes secret-like keys', () => {
    const exported = stringifyBetaPipelineJson([
      {
        productName: 'Safe',
        api_key: 'x',
        token: 'y',
        access_token: 'z',
        refresh_token: 'r',
        secret: 's',
        client_secret: 'c',
        password: 'p',
        credential: 'cred',
        cookie: 'cookie',
        stripe_key: 'stripe',
        webhook_secret: 'hook',
        social_token: 'social',
        email_api_key: 'email',
        whatsapp_token: 'wa',
      } as any,
    ]);
    expect(exported).toContain('"localOnly": true');

    for (const key of [
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
    ]) {
      expect(exported).not.toContain(key);
    }
  });
  it('builds JSON export with markdown', () => {
    expect(buildBetaPipelineJson([{ productName: 'A' }]).markdown).toContain('Beta Product Pipeline');
  });
  it('markdown includes stage, priority, readiness score and approval warnings', () => {
    const markdown = buildBetaPipelineMarkdown([
      { productName: 'A', stage: 'approved_for_beta', priority: 'critical' },
    ]);
    expect(markdown).toContain('Stage: approved_for_beta');
    expect(markdown).toContain('Priority: critical');
    expect(markdown).toContain('Readiness score: 0%');
    expect(markdown).toContain('Human approval is still required');
  });
});
