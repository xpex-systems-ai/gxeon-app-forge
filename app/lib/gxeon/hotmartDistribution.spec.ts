import { describe, expect, it } from 'vitest';
import {
  buildHotmartDistributionMarkdown,
  buildHotmartDistributionPrompt,
  normalizeHotmartDistributionKit,
  type HotmartDistributionInput,
} from './hotmartDistribution';

const kit: HotmartDistributionInput = {
  productName: 'Método AppForge',
  slug: 'Método AppForge 2026!!!',
  targetAudience: 'founders',
  audience: 'legacy audience',
  niche: 'produtos digitais',
  promise: 'lançar com revisão humana',
  productDraft: { modules: ['diagnóstico'], price: 97 },
  affiliateKit: { commission: '40%', swipe: 'copy aprovada' },
  assetPack: { banners: ['hero.png'], copyBlocks: ['headline'] },
  complianceNotes: ['não prometer renda garantida'],
  launchQueue: [{ channel: 'Hotmart manual', status: 'ready' }],
  manualPublishChecklist: ['revisar copy', 'colar assets manualmente'],
  createdAt: '2026-06-29T10:00:00.000Z',
  updatedAt: '2026-06-30T10:00:00.000Z',
  token: 'should-not-leak',
} as HotmartDistributionInput & { token: string };

describe('hotmart distribution handoff exports', () => {
  it('buildHotmartDistributionPrompt includes productDraft', () => {
    expect(buildHotmartDistributionPrompt(kit)).toContain('diagnóstico');
  });

  it('buildHotmartDistributionPrompt includes affiliateKit', () => {
    expect(buildHotmartDistributionPrompt(kit)).toContain('copy aprovada');
  });

  it('buildHotmartDistributionPrompt includes assetPack', () => {
    expect(buildHotmartDistributionPrompt(kit)).toContain('hero.png');
  });

  it('buildHotmartDistributionPrompt includes complianceNotes', () => {
    expect(buildHotmartDistributionPrompt(kit)).toContain('não prometer renda garantida');
  });

  it('buildHotmartDistributionPrompt includes launchQueue items', () => {
    expect(buildHotmartDistributionPrompt(kit)).toContain('Hotmart manual');
  });

  it('buildHotmartDistributionPrompt includes manualPublishChecklist items', () => {
    expect(buildHotmartDistributionPrompt(kit)).toContain('colar assets manualmente');
  });

  it('buildHotmartDistributionMarkdown includes niche', () => {
    expect(buildHotmartDistributionMarkdown(kit)).toContain('- Niche: produtos digitais');
  });

  it('buildHotmartDistributionMarkdown includes promise', () => {
    expect(buildHotmartDistributionMarkdown(kit)).toContain('- Promise: lançar com revisão humana');
  });

  it('sanitizes slug and timestamps', () => {
    const normalized = normalizeHotmartDistributionKit(kit);
    expect(normalized.slug).toBe('m-todo-appforge-2026');
    expect(normalized.createdAt).toBe('2026-06-29T10:00:00.000Z');
    expect(normalized.updatedAt).toBe('2026-06-30T10:00:00.000Z');
  });

  it('removes secret-like keys and values from exports', () => {
    const output = buildHotmartDistributionPrompt({
      ...kit,
      affiliateKit: { token: 'abc', safe: 'approved', nested: { password: 'hidden' } },
      productDraft: { headline: 'safe', credential: 'hidden', suspicious: 'bearer abc123' },
    });

    expect(output).toContain('approved');
    expect(output).toContain('safe');
    expect(output).not.toContain('abc');
    expect(output).not.toContain('hidden');
    expect(output).not.toContain('bearer abc123');
  });

  it('does not include unknown enumerable fields', () => {
    const output = buildHotmartDistributionMarkdown({
      ...kit,
      unexpectedField: 'must not leak',
    } as HotmartDistributionInput & {
      unexpectedField: string;
    });

    expect(output).not.toContain('must not leak');
    expect(output).not.toContain('unexpectedField');
  });

  it('prioritizes targetAudience over the audience alias', () => {
    expect(normalizeHotmartDistributionKit(kit).targetAudience).toBe('founders');
    expect(normalizeHotmartDistributionKit({ audience: 'alias only' }).targetAudience).toBe('alias only');
  });

  it('does not mutate input objects', () => {
    const original = { ...kit, productDraft: { apiKey: 'secret', headline: 'safe' } };
    const before = JSON.stringify(original);

    buildHotmartDistributionPrompt(original);

    expect(JSON.stringify(original)).toBe(before);
  });

  it('preserves local-only manual-first safety language', () => {
    const output = buildHotmartDistributionMarkdown(kit);

    expect(output).toContain('Local-only and manual-first handoff');
    expect(output).toContain('Human approval required');
    expect(output).toContain('No Hotmart API');
    expect(output).toContain('no checkout');
    expect(output).toContain('no payment');
    expect(output).toContain('no webhooks');
    expect(output).toContain('no tokens');
    expect(output).toContain('no secrets');
    expect(output).toContain('no database');
    expect(output).toContain('no external send');
  });
});
