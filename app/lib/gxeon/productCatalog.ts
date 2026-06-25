export interface ProductCatalogItem {
  id: string;
  productName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCatalogAsset {
  id: string;
  productId: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

type ProductCatalogItemDraft = Partial<Omit<ProductCatalogItem, 'id' | 'createdAt' | 'updatedAt'>> &
  Partial<Pick<ProductCatalogItem, 'id' | 'createdAt' | 'updatedAt'>>;
type ProductCatalogAssetDraft = Partial<Omit<ProductCatalogAsset, 'id' | 'createdAt' | 'updatedAt'>> &
  Partial<Pick<ProductCatalogAsset, 'id' | 'createdAt' | 'updatedAt'>>;

function createLocalId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function createProductCatalogItem(
  input: ProductCatalogItemDraft = {},
  now = new Date().toISOString(),
): ProductCatalogItem {
  return {
    id: input.id || createLocalId('product'),
    productName: input.productName?.trim() || 'Produto local sem nome',
    status: input.status?.trim() || 'draft',
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

export function createProductCatalogAsset(
  input: ProductCatalogAssetDraft = {},
  now = new Date().toISOString(),
): ProductCatalogAsset {
  return {
    id: input.id || createLocalId('asset'),
    productId: input.productId?.trim() || '',
    title: input.title?.trim() || 'Asset local sem título',
    type: input.type?.trim() || 'copy',
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}
