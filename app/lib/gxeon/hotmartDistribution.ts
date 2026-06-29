import type { ProductCatalogItem } from './productCatalog';

export interface HotmartDistributionDraft {
  productName: string;
  problem: string;
  promise: string;
  targetAudience: string;
  desiredPrice: string;
  source: 'catalog';
}

export interface HotmartDistributionAssetPack {
  listing: {
    title: string;
    shortDescription: string;
    longDescription: string;
  };
  salesPageCopy: string;
  affiliatePitch: string;
  trafficManagerBrief: string;
}

export interface HotmartDistributionImport {
  draft: HotmartDistributionDraft;
  assetPack: HotmartDistributionAssetPack;
  safety: {
    localOnlyDraft: true;
    humanApprovalRequired: true;
    noHotmartApiExecution: true;
    noAutoPublishing: true;
    noCheckoutCreation: true;
    noPaymentProcessing: true;
  };
}

const AUDIENCE_KEYS = [
  'targetAudience',
  'audience',
  'publicoAlvo',
  'public',
  'targetPublic',
  'clienteIdeal',
  'avatar',
] as const;

function cleanCatalogValue(value: unknown, max = 500): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).replace(/\s+/g, ' ').trim().slice(0, max);
}

export function pickFirstCatalogValue(raw: Record<string, unknown>, keys: readonly string[], fallback = ''): string {
  for (const key of keys) {
    const value = cleanCatalogValue(raw[key]);

    if (value) {
      return value;
    }
  }

  return fallback;
}

export function importProductCatalogItemToHotmart(item: ProductCatalogItem): HotmartDistributionImport {
  const raw: Record<string, unknown> = { ...item };
  const productName = pickFirstCatalogValue(raw, ['productName', 'name', 'title'], 'Produto do catálogo local');
  const problem = pickFirstCatalogValue(raw, ['problem'], 'problema validado no catálogo local');
  const promise = pickFirstCatalogValue(raw, ['promise', 'offer'], 'promessa revisável do catálogo local');
  const desiredPrice = pickFirstCatalogValue(raw, ['desiredPrice', 'basePrice', 'price'], 'preço a revisar');
  const targetAudience = pickFirstCatalogValue(raw, AUDIENCE_KEYS, 'compradores do catálogo local');

  const draft: HotmartDistributionDraft = {
    productName,
    problem,
    promise,
    targetAudience,
    desiredPrice,
    source: 'catalog',
  };

  return {
    draft,
    assetPack: {
      listing: {
        title: productName,
        shortDescription: `${promise} para ${targetAudience}.`,
        longDescription: `${productName} ajuda ${targetAudience} a lidar com ${problem}. ${promise}. Publicação Hotmart manual após revisão humana.`,
      },
      salesPageCopy: `${productName}: uma oferta local para ${targetAudience} que aborda ${problem} com ${promise}.`,
      affiliatePitch: `Indicado para afiliados que atendem ${targetAudience}; revise promessa, provas e políticas antes de publicar manualmente.`,
      trafficManagerBrief: `Segmentar somente após aprovação humana: ${targetAudience}. Problema central: ${problem}.`,
    },
    safety: {
      localOnlyDraft: true,
      humanApprovalRequired: true,
      noHotmartApiExecution: true,
      noAutoPublishing: true,
      noCheckoutCreation: true,
      noPaymentProcessing: true,
    },
  };
}
