import { describe, expect, it } from 'vitest';
import {
  buildProductBlueprintPrompt,
  createEmptyProductBuilderDraft,
  stringifyProductBlueprintJson,
  validateProductBuilderDraft,
  type ProductBuilderDraft,
} from './productBuilder';

const sampleDraft: ProductBuilderDraft = {
  ...createEmptyProductBuilderDraft('2026-06-21T00:00:00.000Z'),
  idea: 'Curso de IA para corretores',
  niche: 'mercado imobiliário',
  targetAudience: 'corretores autônomos',
  problem: 'falta de leads qualificados',
  productType: 'course',
  offer: 'aulas, templates e checklist',
  promise: 'organizar captação com IA sem prometer renda',
  desiredPrice: 'R$ 297',
  channels: ['Instagram', 'Email'],
  tone: 'direct',
  deliveryFormat: 'vídeos e PDFs',
};

describe('Product Builder helpers', () => {
  it('builds a prompt with all required product blueprint sections', () => {
    const prompt = buildProductBlueprintPrompt(sampleDraft);

    [
      'Nome do produto',
      'Avatar',
      'Problema',
      'Promessa',
      'Transformação',
      'Oferta',
      'Entregáveis',
      'Preço sugerido',
      'Landing page',
      'Marketplace pack',
      'Canais',
      'Conteúdo inicial',
      'Checklist de aprovação humana',
      'Riscos',
      'Próximos passos',
    ].forEach((section) => expect(prompt).toContain(section));
  });

  it('includes manual-first safety boundaries in the prompt', () => {
    const prompt = buildProductBlueprintPrompt(sampleDraft).toLowerCase();

    expect(prompt).toContain('manual-first');
    expect(prompt).toContain('não faça promessas de renda garantida');
    expect(prompt).toContain('não execute pagamentos reais');
    expect(prompt).toContain('não acione apis de marketplace');
    expect(prompt).toContain('aprovação humana');
    expect(prompt).toContain('nada deve ser publicado');
  });

  it('flags missing recommended fields without blocking sparse fallback generation', () => {
    const validation = validateProductBuilderDraft({
      ...sampleDraft,
      idea: '',
      niche: ' ',
      targetAudience: '',
      problem: '',
    });

    expect(validation.isStrongBlueprintReady).toBe(false);
    expect(validation.missingRecommendedFields).toEqual(['idea', 'niche', 'targetAudience', 'problem']);
  });

  it('accepts drafts with the recommended fields filled', () => {
    expect(validateProductBuilderDraft(sampleDraft)).toEqual({
      missingRecommendedFields: [],
      isStrongBlueprintReady: true,
    });
  });

  it('exports JSON without secret-like or API key fields', () => {
    const json = stringifyProductBlueprintJson({
      ...sampleDraft,
      privateCredential: 'redacted-placeholder',
      paymentCredential: 'redacted-placeholder',
    } as ProductBuilderDraft);

    expect(json).not.toContain('privateCredential');
    expect(json).not.toContain('paymentCredential');
    expect(json).not.toContain('redacted-placeholder');
    expect(json).toContain('noLivePayments');
  });
});
