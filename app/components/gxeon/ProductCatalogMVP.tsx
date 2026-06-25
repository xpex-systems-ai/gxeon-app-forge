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
  stringifyProductCatalogJson,
  type ProductCatalogAsset,
  type ProductCatalogAssetType,
  type ProductCatalogChannel,
  type ProductCatalogItem,
  type ProductCatalogStatus,
} from '~/lib/gxeon/productCatalog';

interface ProductCatalogMVPProps {
  importModule?: (moduleName: string) => void;
}

type ProductDraft = Omit<ProductCatalogItem, 'id' | 'createdAt' | 'updatedAt'>;
type AssetDraft = Omit<ProductCatalogAsset, 'id' | 'createdAt' | 'updatedAt'>;

const STATUS_LABELS: Record<ProductCatalogStatus, string> = {
  draft: 'Rascunho',
  ready: 'Pronto',
  approved: 'Aprovado',
  archived: 'Arquivado',
};

const ASSET_LABELS: Record<ProductCatalogAssetType, string> = {
  landing: 'Landing',
  marketplace: 'Marketplace',
  checkout: 'Checkout',
  content: 'Conteúdo',
  integration: 'Integração',
  other: 'Outro',
};

const CHANNEL_LABELS: Record<ProductCatalogChannel, string> = {
  manual: 'Manual',
  landing_page: 'Landing Page',
  marketplace: 'Marketplace',
  email: 'Email',
  social: 'Social',
  whatsapp: 'WhatsApp',
};

function productForm(): ProductDraft {
  return {
    productName: '',
    niche: '',
    audience: '',
    offer: '',
    price: '',
    status: 'draft',
    channels: ['manual'],
    notes: '',
  };
}

function assetForm(): AssetDraft {
  return { productId: '', title: '', type: 'other', channel: 'manual', summary: '', approvalNotes: '' };
}

export function ProductCatalogMvp({ importModule }: ProductCatalogMVPProps) {
  const [items, setItems] = useState<ProductCatalogItem[]>([]);
  const [assets, setAssets] = useState<ProductCatalogAsset[]>([]);
  const [productDraft, setProductDraft] = useState<ProductDraft>(() => productForm());
  const [assetDraft, setAssetDraft] = useState<AssetDraft>(() => assetForm());
  const [status, setStatus] = useState('Catálogo local pronto. IDs só são gerados ao adicionar/importar registros.');

  const markdown = useMemo(() => buildProductCatalogMarkdown(items, assets), [items, assets]);

  const addProduct = () => {
    if (!productDraft.productName.trim()) {
      setStatus('Informe o nome do produto antes de adicionar ao catálogo.');
      return;
    }

    const created = createProductCatalogItem(productDraft);
    setItems((current) => [created, ...current]);
    setProductDraft(productForm());
    setStatus('Produto adicionado com ID único gerado no clique.');
  };

  const addAsset = () => {
    if (!assetDraft.title.trim()) {
      setStatus('Informe o título do asset antes de adicionar ao catálogo.');
      return;
    }

    if (!assetDraft.productId.trim()) {
      setStatus('Selecione um produto antes de adicionar o asset.');
      return;
    }

    const created = createProductCatalogAsset(assetDraft);
    setAssets((current) => [created, ...current]);
    setAssetDraft(assetForm());
    setStatus('Asset adicionado com ID único gerado no clique.');
  };

  const saveCatalog = () => {
    localStorage.setItem(PRODUCT_CATALOG_STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(PRODUCT_CATALOG_ASSET_STORAGE_KEY, JSON.stringify(assets));
    setStatus('Catálogo salvo no localStorage v1.');
  };

  const loadCatalog = () => {
    const nextItems = JSON.parse(
      localStorage.getItem(PRODUCT_CATALOG_STORAGE_KEY) || '[]',
    ) as Partial<ProductCatalogItem>[];
    const nextAssets = JSON.parse(
      localStorage.getItem(PRODUCT_CATALOG_ASSET_STORAGE_KEY) || '[]',
    ) as Partial<ProductCatalogAsset>[];
    setItems(nextItems.map((item) => createProductCatalogItem(item)));
    setAssets(nextAssets.map((asset) => createProductCatalogAsset(asset)));
    setStatus('Catálogo carregado localmente.');
  };

  const clearCatalog = () => {
    if (!window.confirm('Limpar catálogo local?')) {
      return;
    }

    setItems([]);
    setAssets([]);
    localStorage.removeItem(PRODUCT_CATALOG_STORAGE_KEY);
    localStorage.removeItem(PRODUCT_CATALOG_ASSET_STORAGE_KEY);
    setStatus('Catálogo limpo localmente.');
  };

  const exportJson = () => {
    const blob = new Blob([stringifyProductCatalogJson(items, assets)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gxeon-product-catalog.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exportado localmente.');
  };

  const copyMarkdown = async () => {
    await navigator.clipboard?.writeText(markdown);
    setStatus('Markdown copiado. Revise manualmente antes de publicar.');
  };

  const importFromModule = (moduleName: string) => {
    importModule?.(moduleName);
    setStatus(`Importação solicitada de ${moduleName}. Registros importados devem gerar IDs no ato da importação.`);
  };

  return (
    <section
      className="rounded-2xl border border-[#d9a441]/20 bg-[#05060a] p-3"
      data-testid="gxeon-product-catalog-mvp"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d9a441]">Catálogo local</p>
          <h3 className="text-base font-black text-white">Product Catalog + Asset Library</h3>
          <p className="mt-1 text-xs text-white/58">
            Local-only, manual-first, sem uploads, pagamentos, webhooks ou publicação automática.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['ProductBuilder', 'MarketplacePack', 'LandingBuilder', 'ContentFactory'].map((moduleName) => (
            <button
              key={moduleName}
              type="button"
              onClick={() => importFromModule(moduleName)}
              className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/62"
            >
              Importar {moduleName}
            </button>
          ))}
        </div>
      </div>

      <p
        className="my-2 rounded-xl border border-[#d9a441]/15 bg-[#d9a441]/8 p-2 text-xs text-[#f4d58d]"
        data-testid="gxeon-product-catalog-status"
      >
        {status}
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-2">
          <h4 className="mb-2 text-sm font-bold text-white">Adicionar produto</h4>
          <input
            value={productDraft.productName}
            onChange={(event) => setProductDraft({ ...productDraft, productName: event.target.value })}
            placeholder="Nome do produto"
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          />
          <input
            value={productDraft.niche}
            onChange={(event) => setProductDraft({ ...productDraft, niche: event.target.value })}
            placeholder="Nicho"
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          />
          <input
            value={productDraft.audience}
            onChange={(event) => setProductDraft({ ...productDraft, audience: event.target.value })}
            placeholder="Público"
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          />
          <input
            value={productDraft.offer}
            onChange={(event) => setProductDraft({ ...productDraft, offer: event.target.value })}
            placeholder="Oferta"
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          />
          <input
            value={productDraft.price}
            onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })}
            placeholder="Preço hipotético"
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          />
          <select
            value={productDraft.status}
            onChange={(event) =>
              setProductDraft({ ...productDraft, status: event.target.value as ProductCatalogStatus })
            }
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          >
            {PRODUCT_CATALOG_STATUSES.map((item) => (
              <option key={item} value={item}>
                {STATUS_LABELS[item]}
              </option>
            ))}
          </select>
          <textarea
            value={productDraft.notes}
            onChange={(event) => setProductDraft({ ...productDraft, notes: event.target.value })}
            placeholder="Notas de aprovação"
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          />
          <button
            type="button"
            data-testid="gxeon-product-catalog-add-product"
            onClick={addProduct}
            className="rounded-full bg-[#d9a441] px-3 py-1.5 text-xs font-bold text-black"
          >
            Add Product
          </button>
        </div>

        <div className="rounded-xl border border-white/10 p-2">
          <h4 className="mb-2 text-sm font-bold text-white">Adicionar asset</h4>
          <select
            value={assetDraft.productId}
            onChange={(event) => setAssetDraft({ ...assetDraft, productId: event.target.value })}
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          >
            <option value="">Selecione um produto</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.productName}
              </option>
            ))}
          </select>
          <input
            value={assetDraft.title}
            onChange={(event) => setAssetDraft({ ...assetDraft, title: event.target.value })}
            placeholder="Título do asset"
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          />
          <select
            value={assetDraft.type}
            onChange={(event) => setAssetDraft({ ...assetDraft, type: event.target.value as ProductCatalogAssetType })}
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          >
            {PRODUCT_CATALOG_ASSET_TYPES.map((item) => (
              <option key={item} value={item}>
                {ASSET_LABELS[item]}
              </option>
            ))}
          </select>
          <select
            value={assetDraft.channel}
            onChange={(event) => setAssetDraft({ ...assetDraft, channel: event.target.value as ProductCatalogChannel })}
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          >
            {PRODUCT_CATALOG_CHANNELS.map((item) => (
              <option key={item} value={item}>
                {CHANNEL_LABELS[item]}
              </option>
            ))}
          </select>
          <textarea
            value={assetDraft.summary}
            onChange={(event) => setAssetDraft({ ...assetDraft, summary: event.target.value })}
            placeholder="Resumo"
            className="mb-2 w-full rounded bg-black/30 p-2 text-xs text-white"
          />
          <button
            type="button"
            data-testid="gxeon-product-catalog-add-asset"
            onClick={addAsset}
            className="rounded-full bg-[#d9a441] px-3 py-1.5 text-xs font-bold text-black"
          >
            Add Asset
          </button>
        </div>
      </div>

      <div className="my-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={saveCatalog}
          className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/65"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={loadCatalog}
          className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/65"
        >
          Carregar
        </button>
        <button
          type="button"
          onClick={exportJson}
          className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/65"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => void copyMarkdown()}
          className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/65"
        >
          Copy Markdown
        </button>
        <button
          type="button"
          onClick={clearCatalog}
          className="rounded-full border border-red-400/30 px-2.5 py-1 text-xs text-red-200"
        >
          Clear Catalog
        </button>
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <div>
          {items.map((item) => (
            <article key={item.id} className="mb-2 rounded-xl border border-white/10 p-2 text-xs text-white/65">
              <strong className="text-white">{item.productName}</strong>
              <br />
              {item.id}
            </article>
          ))}
        </div>
        <div>
          {assets.map((asset) => (
            <article key={asset.id} className="mb-2 rounded-xl border border-white/10 p-2 text-xs text-white/65">
              <strong className="text-white">{asset.title}</strong>
              <br />
              {asset.id}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
