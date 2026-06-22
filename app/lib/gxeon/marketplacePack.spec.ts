import { describe, expect, it } from 'vitest';
import {
  buildGxeonContextPayload,
  buildMarketplacePackJson,
  buildMarketplacePackOutput,
  buildMarketplacePackPrompt,
  createEmptyMarketplacePackDraft,
  generateShortCommercialTitles,
  stringifyMarketplacePackJson,
  validateMarketplacePackDraft,
  type MarketplacePackDraft,
} from './marketplacePack';

const sampleDraft: MarketplacePackDraft = {
  ...createEmptyMarketplacePackDraft('2026-06-22T00:00:00.000Z'),
  sourceProductIdea: 'Curso de IA para corretores',
  sourceNiche: 'mercado imobiliário',
  sourceAudience: 'corretores autônomos',
  sourceProblem: 'falta de leads qualificados',
  sourceOffer: 'aulas, templates e checklist',
  sourcePromise: 'organizar captação com IA sem prometer renda',
  sourcePrice: 'R$ 297',
  deliveryFormat: 'vídeos e PDFs',
  selectedPlatforms: ['hotmart', 'kiwify', 'shopee'],
  mainCategory: 'Educação / Negócios',
  tone: 'direct',
};

describe('Marketplace Pack helpers', () => {
  it('flags missing recommended fields without permanent blocking', () => {
    const validation = validateMarketplacePackDraft({
      ...sampleDraft,
      sourceProductIdea: '',
      sourceNiche: '',
      sourceAudience: '',
      sourceOffer: '',
      sourcePromise: '',
      selectedPlatforms: [],
    });

    expect(validation.isStrongMarketplacePackReady).toBe(false);
    expect(validation.missingRecommendedFields).toEqual([
      'sourceProductIdea',
      'sourceNiche',
      'sourceAudience',
      'sourceOfferOrPromise',
      'selectedPlatforms',
    ]);
  });

  it('builds prompt with manual-first safety and human approval language', () => {
    const prompt = buildMarketplacePackPrompt(sampleDraft).toLowerCase();

    expect(prompt).toContain('manual-first');
    expect(prompt).toContain('não ative pagamento');
    expect(prompt).toContain('marketplace api calls');
    expect(prompt).toContain('nenhuma publicação automática');
    expect(prompt).toContain('human approval');
    expect(prompt).toContain('não prometa renda garantida');
  });

  it('includes selected platforms in the platform-specific checklist', () => {
    const output = buildMarketplacePackOutput(sampleDraft);

    expect(Object.keys(output.platformChecklist)).toEqual(['hotmart', 'kiwify', 'shopee']);
    expect(output.platformChecklist.hotmart.join(' ')).toContain('produto digital');
    expect(output.platformChecklist.shopee.join(' ')).toContain('política da plataforma');
  });

  it('generates 3 to 5 short commercial titles with no more than 3 words when feasible', () => {
    const titles = generateShortCommercialTitles(sampleDraft);

    expect(titles.length).toBeGreaterThanOrEqual(3);
    expect(titles.length).toBeLessThanOrEqual(5);
    titles.forEach((title) => {
      expect(title.split(/\s+/).length).toBeLessThanOrEqual(3);
      expect(title.toLowerCase()).not.toMatch(/renda|garantid|lucro certo|dinheiro fácil/);
    });
  });

  it('adds visible safe context payload to prompt and JSON export', () => {
    const prompt = buildMarketplacePackPrompt(sampleDraft);
    const json = buildMarketplacePackJson(sampleDraft, '2026-06-22T12:00:00.000Z');

    expect(prompt).toContain('<gxeon_context_payload>');
    expect(prompt).toContain('</gxeon_context_payload>');
    expect(JSON.parse(json.contextPayload)).toEqual({
      idea: sampleDraft.sourceProductIdea,
      niche: sampleDraft.sourceNiche,
      audience: sampleDraft.sourceAudience,
      problem: sampleDraft.sourceProblem,
      offer: sampleDraft.sourceOffer,
      promise: sampleDraft.sourcePromise,
      price: sampleDraft.sourcePrice,
      channels: ['Hotmart', 'Kiwify', 'Shopee'],
      deliveryFormat: sampleDraft.deliveryFormat,
      tone: sampleDraft.tone,
    });
  });

  it('exports JSON with safety flags', () => {
    const json = buildMarketplacePackJson(sampleDraft, '2026-06-22T12:00:00.000Z');

    expect(json.safety).toEqual({
      manualFirst: true,
      noGuaranteedIncome: true,
      noAutoPublishing: true,
      noLivePayments: true,
      noMarketplaceApiExecution: true,
      localOnlyDraft: true,
    });
  });

  it('does not serialize secret-like draft fields or context keys', () => {
    const forbiddenKeyPattern =
      /(^|[_.-])(api_key|apikey|token|access_token|refresh_token|secret|client_secret|password|credential|cookie)($|[_.-])/i;
    const payload = {
      ...sampleDraft,
      apiKey: 'x',
      token: 'y',
      access_token: 'a',
      refresh_token: 'r',
      secret: 'z',
      client_secret: 'client',
      password: 'p',
      cookie: 'c',
      credential: 'k',
    } as MarketplacePackDraft;
    const exported = buildMarketplacePackJson(payload, '2026-06-22T12:00:00.000Z');
    const json = stringifyMarketplacePackJson(payload);
    const contextPayload = buildGxeonContextPayload(payload);
    const walkKeys = (value: unknown): string[] => {
      if (!value || typeof value !== 'object') {
        return [];
      }

      return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => [key, ...walkKeys(nested)]);
    };
    const keys = walkKeys(exported).filter((key) => key !== 'noMarketplaceApiExecution');

    keys.forEach((key) => expect(key).not.toMatch(forbiddenKeyPattern));
    [
      'apiKey',
      'token',
      'access_token',
      'refresh_token',
      'secret',
      'client_secret',
      'password',
      'cookie',
      'credential',
      '"x"',
      '"y"',
      '"z"',
    ].forEach((term) => {
      expect(json).not.toContain(term);
      expect(contextPayload).not.toContain(term);
    });
  });
});
