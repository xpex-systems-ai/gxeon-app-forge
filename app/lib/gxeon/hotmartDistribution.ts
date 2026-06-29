import type { ProductCatalogItem } from './productCatalog';

export const HOTMART_DISTRIBUTION_STORAGE_KEY = 'gxeon.hotmartDistribution.draft.v1';

export interface HotmartDistributionDraft {
  productName: string;
  niche: string;
  targetAudience: string;
  problem: string;
  promise: string;
  desiredPrice: string;
  source: string;
  listing: {
    title: string;
    subtitle: string;
    description: string;
    keywords: string[];
  };
  affiliateKit: {
    pitch: string;
    objections: string[];
    swipeCopy: string[];
  };
  assetPack: {
    salesCopy: string;
    trafficManagerBrief: string;
    launchQueue: string[];
  };
  compliance: {
    manualFirst: true;
    localOnly: true;
    humanApprovalRequired: true;
    noHotmartApi: true;
    noAutoPublish: true;
    noCheckout: true;
    noPayments: true;
    noWebhooks: true;
    noTokens: true;
    noSecrets: true;
    noDatabase: true;
  };
}

export interface HotmartDistributionExport {
  draft: HotmartDistributionDraft;
  markdown: string;
  json: string;
  exportedAt: string;
}

const FALLBACK_AUDIENCE = 'público validado manualmente pelo operador';
const FALLBACK_TEXT = 'validar manualmente antes de publicar';
const CONTROL_RE = /[\u0000-\u001f\u007f|`<>]/g;
const AUDIENCE_KEYS = [
  'targetAudience',
  'audience',
  'publicoAlvo',
  'public',
  'targetPublic',
  'clienteIdeal',
  'avatar',
] as const;

function clean(value: unknown, max = 240): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).replace(CONTROL_RE, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
    : '';
}

export function pickFirstNonEmptyCatalogValue(
  item: Record<string, unknown>,
  keys: readonly string[],
  fallback = '',
  max = 240,
): string {
  for (const key of keys) {
    const value = clean(item[key], max);

    if (value) {
      return value;
    }
  }

  return fallback;
}

function splitKeywords(...values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .flatMap((value) => value.split(/[,;/]/))
        .map((value) => clean(value, 48).toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 12);
}

export function importProductCatalogItemToHotmart(
  item: ProductCatalogItem | Record<string, unknown>,
): HotmartDistributionDraft {
  const catalog = item as Record<string, unknown>;
  const productName = pickFirstNonEmptyCatalogValue(catalog, ['productName', 'name', 'title'], 'Produto Hotmart local');
  const niche = pickFirstNonEmptyCatalogValue(catalog, ['niche', 'market', 'category'], FALLBACK_TEXT);
  const targetAudience = pickFirstNonEmptyCatalogValue(catalog, AUDIENCE_KEYS, FALLBACK_AUDIENCE);
  const problem = pickFirstNonEmptyCatalogValue(catalog, ['problem', 'pain', 'dor'], FALLBACK_TEXT, 500);
  const promise = pickFirstNonEmptyCatalogValue(catalog, ['promise', 'offer', 'promessa'], FALLBACK_TEXT, 500);
  const desiredPrice = pickFirstNonEmptyCatalogValue(
    catalog,
    ['desiredPrice', 'basePrice', 'price'],
    'preço a validar',
  );
  const source = pickFirstNonEmptyCatalogValue(catalog, ['source', 'id', 'slug'], 'product_catalog');

  return {
    productName,
    niche,
    targetAudience,
    problem,
    promise,
    desiredPrice,
    source,
    listing: {
      title: productName,
      subtitle: `${promise} para ${targetAudience}`,
      description: `${productName} ajuda ${targetAudience} a lidar com ${problem}. Promessa revisável: ${promise}.`,
      keywords: splitKeywords(productName, niche, targetAudience),
    },
    affiliateKit: {
      pitch: `Indique ${productName} para ${targetAudience} que precisam resolver ${problem}, sem prometer renda garantida.`,
      objections: ['Validar provas antes da divulgação', 'Confirmar aderência às políticas da Hotmart'],
      swipeCopy: [`Copy local para ${targetAudience}: ${promise}. Revisão humana obrigatória antes de publicar.`],
    },
    assetPack: {
      salesCopy: `${targetAudience} encontram em ${productName} um caminho guiado para ${problem}, com revisão manual de claims.`,
      trafficManagerBrief: `Segmentar testes para ${targetAudience}; não ativar campanhas sem aprovação humana e checagem de compliance.`,
      launchQueue: ['Revisar produto localmente', 'Validar compliance', 'Preparar cadastro manual na Hotmart'],
    },
    compliance: {
      manualFirst: true,
      localOnly: true,
      humanApprovalRequired: true,
      noHotmartApi: true,
      noAutoPublish: true,
      noCheckout: true,
      noPayments: true,
      noWebhooks: true,
      noTokens: true,
      noSecrets: true,
      noDatabase: true,
    },
  };
}

export function buildHotmartDistributionMarkdown(draft: HotmartDistributionDraft): string {
  return [
    `# ${draft.productName}`,
    '',
    `- Público: ${draft.targetAudience}`,
    `- Nicho: ${draft.niche}`,
    `- Problema: ${draft.problem}`,
    `- Promessa: ${draft.promise}`,
    `- Preço desejado: ${draft.desiredPrice}`,
    '',
    '## Listing',
    draft.listing.description,
    '',
    '## Afiliados',
    draft.affiliateKit.pitch,
    '',
    '## Tráfego',
    draft.assetPack.trafficManagerBrief,
    '',
    '## Segurança',
    'Local-only, manual-first, sem API Hotmart, sem checkout, sem pagamentos, sem webhooks, sem tokens e com aprovação humana obrigatória.',
  ].join('\n');
}

export function exportHotmartDistributionDraft(
  draft: HotmartDistributionDraft,
  exportedAt = new Date().toISOString(),
): HotmartDistributionExport {
  return {
    draft,
    markdown: buildHotmartDistributionMarkdown(draft),
    json: JSON.stringify({ draft, exportedAt }, null, 2),
    exportedAt,
  };
}
