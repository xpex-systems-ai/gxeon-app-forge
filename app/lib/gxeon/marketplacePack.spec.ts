import { describe, expect, it } from 'vitest';
import {
  buildMarketplacePackJson,
  buildMarketplacePackOutput,
  buildMarketplacePackPrompt,
  createEmptyMarketplacePackDraft,
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

  it('does not serialize secret-like draft fields', () => {
    const json = stringifyMarketplacePackJson({
      ...sampleDraft,
      apiKey: 'x',
      token: 'y',
      secret: 'z',
      password: 'p',
      cookie: 'c',
      credential: 'k',
    } as MarketplacePackDraft);

    ['apiKey', 'token', 'secret', 'password', 'cookie', 'credential', '"x"', '"y"', '"z"'].forEach((term) =>
      expect(json).not.toContain(term),
    );
  });
});
