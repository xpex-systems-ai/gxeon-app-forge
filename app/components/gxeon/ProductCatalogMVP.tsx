import React, { useMemo, useState } from 'react';
import {
  PRODUCT_CATALOG_ASSET_STORAGE_KEY,
  PRODUCT_CATALOG_ASSET_TYPES,
  PRODUCT_CATALOG_CHANNELS,
  PRODUCT_CATALOG_STATUSES,
  PRODUCT_CATALOG_STORAGE_KEY,
  buildProductCatalogMarkdown,
  createProductCatalogAsset,
  createProductCatalogItem,
  normalizeProductCatalogAsset,
  normalizeProductCatalogItem,
  stringifyProductCatalogJson,
  summarizeProductCatalog,
  type ProductCatalogAsset,
  type ProductCatalogAssetType,
  type ProductCatalogChannel,
  type ProductCatalogItem,
  type ProductCatalogStatus,
} from '~/lib/gxeon/productCatalog';

type ProductDraft = Pick<
  Partial<ProductCatalogItem>,
  'productName' | 'niche' | 'audience' | 'offer' | 'status' | 'tags'
>;
type AssetDraft = Pick<Partial<ProductCatalogAsset>, 'productId' | 'title' | 'summary' | 'contentPreview' | 'tags'> & {
  assetType: ProductCatalogAssetType;
  channel: ProductCatalogChannel;
  status: ProductCatalogAsset['status'];
};

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  return rawValue ? (JSON.parse(rawValue) as T) : fallback;
}

function writeLocalStorage<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

const emptyProductDraft = (): ProductDraft => ({
  productName: '',
  niche: '',
  audience: '',
  offer: '',
  status: 'draft',
  tags: [],
});
const emptyAssetDraft = (): AssetDraft => ({
  productId: '',
  title: '',
  summary: '',
  contentPreview: '',
  tags: [],
  assetType: 'other',
  channel: 'internal',
  status: 'draft',
});

const splitTags = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value : String(value || '').split(',')).map((item) => item.trim()).filter(Boolean);

export function ProductCatalogMvp() {
  const [items, setItems] = useState<ProductCatalogItem[]>(() =>
    readLocalStorage<Partial<ProductCatalogItem>[]>(PRODUCT_CATALOG_STORAGE_KEY, []).map((item) =>
      normalizeProductCatalogItem(item),
    ),
  );
  const [assets, setAssets] = useState<ProductCatalogAsset[]>(() =>
    readLocalStorage<Partial<ProductCatalogAsset>[]>(PRODUCT_CATALOG_ASSET_STORAGE_KEY, []).map((asset) =>
      normalizeProductCatalogAsset(asset),
    ),
  );
  const [productDraft, setProductDraft] = useState<ProductDraft>(() => emptyProductDraft());
  const [assetDraft, setAssetDraft] = useState<AssetDraft>(() => emptyAssetDraft());
  const [status, setStatus] = useState('Catálogo local pronto; nenhuma ação externa será executada.');

  const summary = useMemo(() => summarizeProductCatalog(items, assets), [items, assets]);
  const markdown = useMemo(() => buildProductCatalogMarkdown(items, assets), [items, assets]);

  const addProduct = () => {
    const item = createProductCatalogItem({ ...productDraft, tags: splitTags(productDraft.tags) });
    setItems((current) => [item, ...current.filter((existing) => existing.id !== item.id)]);
    setProductDraft(emptyProductDraft());
    setStatus('Produto adicionado somente ao estado local. Use salvar para gravar no localStorage.');
  };

  const addAsset = () => {
    const asset = createProductCatalogAsset({ ...assetDraft, tags: splitTags(assetDraft.tags) });
    setAssets((current) => [asset, ...current.filter((existing) => existing.id !== asset.id)]);
    setItems((current) =>
      current.map((item) =>
        item.id === asset.productId ? { ...item, assetIds: Array.from(new Set([...item.assetIds, asset.id])) } : item,
      ),
    );
    setAssetDraft(emptyAssetDraft());
    setStatus('Asset adicionado somente ao estado local.');
  };

  const saveCatalog = () => {
    writeLocalStorage(PRODUCT_CATALOG_STORAGE_KEY, items);
    writeLocalStorage(PRODUCT_CATALOG_ASSET_STORAGE_KEY, assets);
    setStatus('Catálogo salvo apenas no localStorage do navegador.');
  };

  const exportJson = () => {
    const payload = stringifyProductCatalogJson(items, assets);
    setStatus(payload);
  };

  return (
    <section
      data-testid="gxeon-product-catalog-mvp"
      className="rounded-2xl border border-[#d9a441]/20 bg-[#07080d] p-3 text-white"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d9a441]">Product Catalog</p>
          <h3 className="text-base font-black">Catálogo local de produtos e assets</h3>
          <p className="text-xs text-white/60">Local-only, manual-first, sem APIs, webhooks, pagamentos ou uploads.</p>
        </div>
        <div className="text-right text-[11px] text-white/60">
          <p>{summary.totalProducts} produtos</p>
          <p>{summary.totalAssets} assets</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-3">
          <h4 className="text-sm font-bold">Novo produto</h4>
          <input
            className="mt-2 w-full rounded bg-black/40 p-2 text-xs"
            placeholder="Nome"
            value={productDraft.productName || ''}
            onChange={(event) => setProductDraft({ ...productDraft, productName: event.target.value })}
          />
          <input
            className="mt-2 w-full rounded bg-black/40 p-2 text-xs"
            placeholder="Nicho"
            value={productDraft.niche || ''}
            onChange={(event) => setProductDraft({ ...productDraft, niche: event.target.value })}
          />
          <input
            className="mt-2 w-full rounded bg-black/40 p-2 text-xs"
            placeholder="Oferta"
            value={productDraft.offer || ''}
            onChange={(event) => setProductDraft({ ...productDraft, offer: event.target.value })}
          />
          <select
            className="mt-2 w-full rounded bg-black/40 p-2 text-xs"
            value={productDraft.status}
            onChange={(event) =>
              setProductDraft({ ...productDraft, status: event.target.value as ProductCatalogStatus })
            }
          >
            {PRODUCT_CATALOG_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="mt-3 rounded bg-[#d9a441] px-3 py-2 text-xs font-bold text-black"
            onClick={addProduct}
          >
            Adicionar produto
          </button>
        </div>

        <div className="rounded-xl border border-white/10 p-3">
          <h4 className="text-sm font-bold">Novo asset</h4>
          <select
            className="mt-2 w-full rounded bg-black/40 p-2 text-xs"
            value={assetDraft.productId}
            onChange={(event) => setAssetDraft({ ...assetDraft, productId: event.target.value })}
          >
            <option value="">Sem produto vinculado</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.productName}
              </option>
            ))}
          </select>
          <input
            className="mt-2 w-full rounded bg-black/40 p-2 text-xs"
            placeholder="Título"
            value={assetDraft.title || ''}
            onChange={(event) => setAssetDraft({ ...assetDraft, title: event.target.value })}
          />
          <select
            className="mt-2 w-full rounded bg-black/40 p-2 text-xs"
            value={assetDraft.assetType}
            onChange={(event) =>
              setAssetDraft({ ...assetDraft, assetType: event.target.value as ProductCatalogAssetType })
            }
          >
            {PRODUCT_CATALOG_ASSET_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="mt-2 w-full rounded bg-black/40 p-2 text-xs"
            value={assetDraft.channel}
            onChange={(event) => setAssetDraft({ ...assetDraft, channel: event.target.value as ProductCatalogChannel })}
          >
            {PRODUCT_CATALOG_CHANNELS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button type="button" className="mt-3 rounded bg-white/10 px-3 py-2 text-xs font-bold" onClick={addAsset}>
            Adicionar asset
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="rounded bg-white/10 px-3 py-2 text-xs" onClick={saveCatalog}>
          Salvar localStorage
        </button>
        <button type="button" className="rounded bg-white/10 px-3 py-2 text-xs" onClick={exportJson}>
          Gerar JSON local
        </button>
      </div>

      <pre className="mt-3 max-h-40 overflow-auto rounded bg-black/40 p-2 text-[11px] text-white/70">{status}</pre>
      <pre className="mt-3 max-h-40 overflow-auto rounded bg-black/40 p-2 text-[11px] text-white/50">{markdown}</pre>
    </section>
  );
}
