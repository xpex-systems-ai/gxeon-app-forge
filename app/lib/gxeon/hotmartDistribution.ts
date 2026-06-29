import type { ProductCatalogItem } from './productCatalog';

export const HOTMART_DISTRIBUTION_STORAGE_KEY = 'gxeon.hotmartDistribution.draft.v1';

export interface HotmartDistributionDraft {
  productName: string;
  problem: string;
  promise: string;
  desiredPrice: string;
  targetAudience: string;
  source: 'manual' | 'catalog';
}

export interface HotmartAssetPack {
  listing: {
    title: string;
    shortDescription: string;
    longDescription: string;
  };
  salesPageCopy: string[];
  affiliatePitch: string[];
  trafficManagerBrief: string[];
  safety: {
    localOnly: true;
    manualFirst: true;
    noHotmartApi: true;
    noAutoPublish: true;
    noCheckoutCreation: true;
    noPaymentProcessing: true;
    humanApprovalRequired: true;
  };
}

export interface HotmartDistributionImport {
  draft: HotmartDistributionDraft;
  assetPack: HotmartAssetPack;
}

const FALLBACK_AUDIENCE = 'compradores do catálogo local';
const AUDIENCE_KEYS = [
  'targetAudience',
  'audience',
  'publicoAlvo',
  'public',
  'targetPublic',
  'clienteIdeal',
  'avatar',
] as const;

function cleanCatalogValue(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).replace(/\s+/g, ' ').trim() : '';
}

export function pickFirstCatalogValue(raw: Record<string, unknown>, keys: readonly string[]): string {
  for (const key of keys) {
    const value = cleanCatalogValue(raw[key]);

    if (value) {
      return value;
    }
  }

  return '';
}

export function buildHotmartAssetPack(draft: HotmartDistributionDraft): HotmartAssetPack {
  return {
    listing: {
      title: draft.productName,
      shortDescription: `${draft.promise} para ${draft.targetAudience}.`,
      longDescription: `${draft.productName} ajuda ${draft.targetAudience} a enfrentar ${draft.problem} com ${draft.promise}. Revisar manualmente antes de qualquer publicação na Hotmart.`,
    },
    salesPageCopy: [
      `Para ${draft.targetAudience}: transforme ${draft.problem} em um plano prático.`,
      `Promessa central: ${draft.promise}.`,
      `Preço desejado para revisão manual: ${draft.desiredPrice}.`,
    ],
    affiliatePitch: [`Audiência preservada do catálogo local: ${draft.targetAudience}.`],
    trafficManagerBrief: [`Segmentar somente após revisão humana: ${draft.targetAudience}.`],
    safety: {
      localOnly: true,
      manualFirst: true,
      noHotmartApi: true,
      noAutoPublish: true,
      noCheckoutCreation: true,
      noPaymentProcessing: true,
      humanApprovalRequired: true,
    },
  };
}

export function importProductCatalogItemToHotmart(
  catalogItem: Partial<ProductCatalogItem> & Record<string, unknown>,
): HotmartDistributionImport {
  const raw = { ...catalogItem };
  const productName = cleanCatalogValue(raw.productName) || 'Produto do catálogo local';
  const problem = cleanCatalogValue(raw.problem) || 'problema mapeado no catálogo local';
  const promise = cleanCatalogValue(raw.promise || raw.offer) || 'promessa a validar manualmente';
  const desiredPrice = cleanCatalogValue(raw.desiredPrice || raw.basePrice) || 'preço a definir manualmente';
  const targetAudience = pickFirstCatalogValue(raw, AUDIENCE_KEYS) || FALLBACK_AUDIENCE;
  const draft: HotmartDistributionDraft = {
    productName,
    problem,
    promise,
    desiredPrice,
    targetAudience,
    source: 'catalog',
  };

  return {
    draft,
    assetPack: buildHotmartAssetPack(draft),
  };
}
