import { describe, expect, it } from 'vitest';
import {
  buildAffiliateKit,
  buildHotmartAssetPack,
  buildHotmartDistributionJson,
  buildHotmartManualPublishMarkdown,
  buildHotmartProductDraft,
  createHotmartLaunchQueueItem,
  generateHotmartProductIdeas,
  importProductBuilderDraftToHotmart,
  importProductCatalogItemToHotmart,
  validateHotmartProductCompliance,
} from './hotmartDistribution';

describe('hotmart distribution os', () => {
  const idea = generateHotmartProductIdeas('afiliados', 'gestores de tráfego')[0];

  it('creates 10 product ideas with traffic and affiliate angles', () => {
    const ideas = generateHotmartProductIdeas('dashboards', 'afiliados');
    expect(ideas).toHaveLength(10);
    expect(ideas.every((item) => item.primaryProblem && item.trafficManagerAngle && item.affiliateAngle)).toBe(true);
  });

  it('builds a HotmartProductDraft without external actions', () => {
    const draft = buildHotmartProductDraft(idea);
    expect(draft.status).toBe('generated');
    expect(draft.complianceNotes).toContain('Sem API Hotmart');
    expect(JSON.stringify(draft).toLowerCase()).not.toContain('checkout link');
  });

  it('builds an Affiliate Kit with no guaranteed income claims', () => {
    const draft = buildHotmartProductDraft(idea);
    const kit = buildAffiliateKit(draft);
    const serialized = JSON.stringify(kit).toLowerCase();
    expect(kit.adAngles).toHaveLength(5);
    expect(kit.whatsappScripts).toHaveLength(5);
    expect(serialized).toContain('não prometer renda');
    expect(serialized).not.toContain('renda garantida para compradores');
  });

  it('builds Sales Asset Pack with manual publish safety flags', () => {
    const draft = buildHotmartProductDraft(idea);
    const asset = buildHotmartAssetPack(draft);
    expect(asset.safety).toEqual({
      manualPublishOnly: true,
      noAutoPosting: true,
      noPaymentCreated: true,
      noExternalApiCall: true,
      noIncomeGuarantee: true,
    });
    expect(asset.checkoutCopy).toContain('Nenhum link real');
  });

  it('blocks compliance-risk phrases', () => {
    const result = validateHotmartProductCompliance('ganho garantido e dinheiro fácil');
    expect(result.isBlocked).toBe(true);
    expect(result.findings).toContain('ganho garantido');
  });

  it('creates LaunchQueue item requiring human approval', () => {
    const draft = buildHotmartProductDraft(idea);
    const asset = buildHotmartAssetPack(draft);
    const queue = createHotmartLaunchQueueItem(draft, asset);
    expect(queue.approvalGate).toBe('founder_only');
    expect(queue.publishMode).toBe('manual_hotmart_dashboard_only');
  });

  it('exports JSON without tokens or secrets', () => {
    const draft = buildHotmartProductDraft(idea);
    const asset = buildHotmartAssetPack(draft);
    const json = buildHotmartDistributionJson(draft, asset);
    expect(json).not.toMatch(/token|secret|apiKey|credential/i);
    expect(json).toContain('noExternalApiCall');
  });

  it('generates Markdown checklist with Hotmart manual publish steps', () => {
    const draft = buildHotmartProductDraft(idea);
    const markdown = buildHotmartManualPublishMarkdown(draft);
    expect(markdown).toContain('Checklist Hotmart Manual');
    expect(markdown).toContain('Sem API Hotmart');
    expect(markdown).toContain('[ ] Cadastrar produto manualmente');
  });

  it('imports Product Builder draft without mutating original local state', () => {
    const original = {
      idea: 'Oferta AI',
      targetAudience: 'agências',
      problem: 'briefing lento',
      promise: 'organizar entrega',
    };
    const snapshot = { ...original };
    const draft = importProductBuilderDraftToHotmart(original);
    expect(original).toEqual(snapshot);
    expect(draft.source).toBe('product_builder');
  });

  it('imports Product Catalog item into Hotmart draft locally', () => {
    const original = { productName: 'Dashboard Local', problem: 'leads espalhados' };
    const draft = importProductCatalogItemToHotmart(original);
    expect(draft.source).toBe('catalog');
    expect(draft.productName).toBe('Dashboard Local');
  });
});
