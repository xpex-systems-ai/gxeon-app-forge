import React, { useMemo, useState } from 'react';
import { CHECKOUT_BLUEPRINT_STORAGE_KEY } from '~/lib/gxeon/checkoutBlueprint';
import { CONTENT_FACTORY_STORAGE_KEY } from '~/lib/gxeon/contentFactory';
import { INTEGRATION_READINESS_STORAGE_KEY } from '~/lib/gxeon/integrationReadiness';
import { LANDING_BUILDER_STORAGE_KEY } from '~/lib/gxeon/landingBuilder';
import { MARKETPLACE_PACK_STORAGE_KEY } from '~/lib/gxeon/marketplacePack';
import { PRODUCT_BUILDER_STORAGE_KEY } from '~/lib/gxeon/productBuilder';
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

const catalogImports = [
  { key: PRODUCT_BUILDER_STORAGE_KEY, label: 'Product Builder' },
  { key: MARKETPLACE_PACK_STORAGE_KEY, label: 'Marketplace Pack' },
  { key: CHECKOUT_BLUEPRINT_STORAGE_KEY, label: 'Checkout Blueprint' },
  { key: LANDING_BUILDER_STORAGE_KEY, label: 'Landing Builder' },
  { key: CONTENT_FACTORY_STORAGE_KEY, label: 'Content Factory' },
  { key: INTEGRATION_READINESS_STORAGE_KEY, label: 'Integration Readiness' },
] as const;

const pickFirstText = (value: Record<string, unknown>, keys: string[]) =>
  keys.map((key) => value[key]).find((item): item is string => typeof item === 'string' && item.trim().length > 0) ||
  '';

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
    if (!productDraft.productName?.trim()) {
      setStatus('Informe o nome do produto antes de adicionar ao catálogo local.');

      return;
    }

    const item = createProductCatalogItem({ ...productDraft, tags: splitTags(productDraft.tags) });
    setItems((current) => [item, ...current.filter((existing) => existing.id !== item.id)]);
    setProductDraft(emptyProductDraft());
    setStatus('Produto adicionado somente ao estado local. Use salvar para gravar no localStorage.');
  };

  const addAsset = () => {
    if (!assetDraft.productId?.trim()) {
      setStatus('Selecione um produto local antes de adicionar o asset.');

      return;
    }

    if (!assetDraft.title?.trim()) {
      setStatus('Informe o título do asset antes de adicionar ao catálogo local.');

      return;
    }

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

  const loadCatalog = () => {
    setItems(
      readLocalStorage<Partial<ProductCatalogItem>[]>(PRODUCT_CATALOG_STORAGE_KEY, []).map((item) =>
        normalizeProductCatalogItem(item),
      ),
    );
    setAssets(
      readLocalStorage<Partial<ProductCatalogAsset>[]>(PRODUCT_CATALOG_ASSET_STORAGE_KEY, []).map((asset) =>
        normalizeProductCatalogAsset(asset),
      ),
    );
    setStatus('Catálogo carregado do localStorage somente após clique explícito.');
  };

  const importLocalDraft = (source: (typeof catalogImports)[number]) => {
    const raw = readLocalStorage<Record<string, unknown> | null>(source.key, null);

    if (!raw) {
      setStatus(`Nenhum rascunho local encontrado para ${source.label}.`);

      return;
    }

    const productName = pickFirstText(raw, ['productName', 'productTitle', 'name', 'title', 'offerName']);

    if (!productName.trim()) {
      setStatus(`${source.label} não possui nome de produto suficiente para importar.`);

      return;
    }

    const item = createProductCatalogItem({
      productName,
      niche: pickFirstText(raw, ['niche', 'market', 'category']),
      audience: pickFirstText(raw, ['audience', 'avatar', 'targetAudience']),
      offer: pickFirstText(raw, ['offer', 'valueProposition', 'promise']),
      status: 'draft',
      sourceModules: [source.label],
      tags: [source.label, 'imported-local'],
    });
    const asset = createProductCatalogAsset({
      productId: item.id,
      title: `${source.label} local checkpoint`,
      sourceModule: source.label,
      summary: 'Imported by explicit click from browser localStorage only; review manually before use.',
      contentPreview: JSON.stringify(raw).slice(0, 900),
      tags: [source.label, 'local-only'],
      assetType: source.label === 'Integration Readiness' ? 'integration_dry_run' : 'other',
      channel: 'internal',
      status: 'draft',
    });

    setItems((current) => [
      { ...item, assetIds: [asset.id] },
      ...current.filter((existing) => existing.id !== item.id),
    ]);
    setAssets((current) => [asset, ...current.filter((existing) => existing.id !== asset.id)]);
    setStatus(`${source.label} importado localmente; nenhum envio externo foi executado.`);
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus('Markdown copiado para a área de transferência.');
    } catch {
      setStatus('Clipboard indisponível; copie manualmente pelo preview local.');
    }
  };

  const clearCatalog = () => {
    setItems([]);
    setAssets([]);
    writeLocalStorage(PRODUCT_CATALOG_STORAGE_KEY, []);
    writeLocalStorage(PRODUCT_CATALOG_ASSET_STORAGE_KEY, []);
    setStatus('Catálogo local limpo; somente as chaves localStorage do Product Catalog foram alteradas.');
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
        <button type="button" className="rounded bg-white/10 px-3 py-2 text-xs" onClick={loadCatalog}>
          Carregar localStorage
        </button>
        <button type="button" className="rounded bg-white/10 px-3 py-2 text-xs" onClick={exportJson}>
          Gerar JSON local
        </button>
        <button type="button" className="rounded bg-white/10 px-3 py-2 text-xs" onClick={() => void copyMarkdown()}>
          Copiar Markdown
        </button>
        <button type="button" className="rounded bg-white/10 px-3 py-2 text-xs" onClick={clearCatalog}>
          Limpar
        </button>
        {catalogImports.map((source) => (
          <button
            key={source.key}
            type="button"
            className="rounded bg-white/10 px-3 py-2 text-xs"
            onClick={() => importLocalDraft(source)}
          >
            Importar {source.label}
          </button>
        ))}
      </div>

      <pre className="mt-3 max-h-40 overflow-auto rounded bg-black/40 p-2 text-[11px] text-white/70">{status}</pre>
      <pre className="mt-3 max-h-40 overflow-auto rounded bg-black/40 p-2 text-[11px] text-white/50">{markdown}</pre>
    </section>
  );
}
