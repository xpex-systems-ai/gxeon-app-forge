import React, { useState } from 'react';
import {
  createProductCatalogAsset,
  createProductCatalogItem,
  type ProductCatalogAsset,
  type ProductCatalogItem,
} from '~/lib/gxeon/productCatalog';

interface ProductFormDraft {
  productName: string;
  status: string;
}

interface AssetFormDraft {
  productId: string;
  title: string;
  type: string;
}

const PRODUCT_CATALOG_STORAGE_KEY = 'gxeon.productCatalog.products.v1';
const PRODUCT_CATALOG_ASSETS_STORAGE_KEY = 'gxeon.productCatalog.assets.v1';

function emptyProductForm(): ProductFormDraft {
  return { productName: '', status: 'draft' };
}

function emptyAssetForm(): AssetFormDraft {
  return { productId: '', title: '', type: 'copy' };
}

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function ProductCatalogMvp() {
  const [products, setProducts] = useState<ProductCatalogItem[]>(() =>
    readLocalStorage(PRODUCT_CATALOG_STORAGE_KEY, []),
  );
  const [assets, setAssets] = useState<ProductCatalogAsset[]>(() =>
    readLocalStorage(PRODUCT_CATALOG_ASSETS_STORAGE_KEY, []),
  );
  const [productForm, setProductForm] = useState<ProductFormDraft>(() => emptyProductForm());
  const [assetForm, setAssetForm] = useState<AssetFormDraft>(() => emptyAssetForm());
  const [status, setStatus] = useState('Catálogo local pronto para registros manuais.');

  const addProduct = () => {
    if (!productForm.productName.trim()) {
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
import { PRODUCT_BUILDER_STORAGE_KEY } from '~/lib/gxeon/productBuilder';
import { MARKETPLACE_PACK_STORAGE_KEY } from '~/lib/gxeon/marketplacePack';
import { CHECKOUT_BLUEPRINT_STORAGE_KEY } from '~/lib/gxeon/checkoutBlueprint';
import { LANDING_BUILDER_STORAGE_KEY } from '~/lib/gxeon/landingBuilder';
import { CONTENT_FACTORY_STORAGE_KEY } from '~/lib/gxeon/contentFactory';
import { INTEGRATION_READINESS_STORAGE_KEY } from '~/lib/gxeon/integrationReadiness';
import { APPROVAL_LEDGER_STORAGE_KEY } from '~/lib/gxeon/approvalLedger';
import { BETA_PRODUCT_PIPELINE_STORAGE_KEY } from '~/lib/gxeon/betaProductPipeline';
import { REVENUE_LEDGER_STORAGE_KEY } from '~/lib/gxeon/revenueLedger';
import {
  buildProductCatalogExport,
  normalizeProductCatalogAsset,
  normalizeProductCatalogItem,
  PRODUCT_CATALOG_ASSETS_STORAGE_KEY,
  PRODUCT_CATALOG_ITEMS_STORAGE_KEY,
  serializeCatalogPreview,
  type ProductCatalogAsset,
  type ProductCatalogAssetType,
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
type ProductDraft = Pick<
  Partial<ProductCatalogItem>,
  'productName' | 'niche' | 'audience' | 'problem' | 'offer' | 'promise' | 'basePrice' | 'tags' | 'nextAction'
>;
type AssetDraft = Pick<Partial<ProductCatalogAsset>, 'productId' | 'title' | 'summary' | 'contentPreview' | 'tags'> & {
  assetType: ProductCatalogAssetType;
  sourceModule: string;
  status: ProductCatalogStatus;
};

const emptyProductDraft: ProductDraft = {
  productName: '',
  niche: '',
  audience: '',
  problem: '',
  offer: '',
  promise: '',
  basePrice: '',
  tags: [],
  nextAction: '',
};
const emptyAssetDraft: AssetDraft = {
  productId: '',
  title: '',
  assetType: 'other',
  sourceModule: 'Manual Catalog',
  summary: '',
  contentPreview: '',
  tags: [],
  status: 'draft',
};
const IMPORT_SOURCES: {
  label: string;
  moduleName: string;
  storageKey: string;
  assetType: ProductCatalogAssetType;
  status: ProductCatalogStatus;
}[] = [
  {
    label: 'Product Builder',
    moduleName: 'ProductBuilderMVP',
    storageKey: PRODUCT_BUILDER_STORAGE_KEY,
    assetType: 'product_blueprint',
    status: 'draft',
  },
  {
    label: 'Marketplace Pack',
    moduleName: 'MarketplacePackGeneratorMVP',
    storageKey: MARKETPLACE_PACK_STORAGE_KEY,
    assetType: 'marketplace_pack',
    status: 'packaged',
  },
  {
    label: 'Checkout Blueprint',
    moduleName: 'CheckoutBlueprintMVP',
    storageKey: CHECKOUT_BLUEPRINT_STORAGE_KEY,
    assetType: 'checkout_blueprint',
    status: 'needs_review',
  },
  {
    label: 'Landing Builder',
    moduleName: 'LandingBuilderMVP',
    storageKey: LANDING_BUILDER_STORAGE_KEY,
    assetType: 'landing_blueprint',
    status: 'landing_ready',
  },
  {
    label: 'Content Factory',
    moduleName: 'ContentFactoryMVP',
    storageKey: CONTENT_FACTORY_STORAGE_KEY,
    assetType: 'content_pack',
    status: 'content_ready',
  },
  {
    label: 'Integration Readiness',
    moduleName: 'IntegrationReadinessMVP',
    storageKey: INTEGRATION_READINESS_STORAGE_KEY,
    assetType: 'integration_dry_run',
    status: 'integration_dry_run_ready',
  },
  {
    label: 'Approval Ledger',
    moduleName: 'ApprovalLedgerMVP',
    storageKey: APPROVAL_LEDGER_STORAGE_KEY,
    assetType: 'approval_record',
    status: 'needs_review',
  },
  {
    label: 'Beta Product Pipeline',
    moduleName: 'BetaProductPipelineMVP',
    storageKey: BETA_PRODUCT_PIPELINE_STORAGE_KEY,
    assetType: 'beta_pipeline_record',
    status: 'beta_ready',
  },
  {
    label: 'Revenue Ledger',
    moduleName: 'RevenueLedgerMVP',
    storageKey: REVENUE_LEDGER_STORAGE_KEY,
    assetType: 'revenue_record',
    status: 'needs_review',
  },
];
const parseTags = (v: unknown) =>
  String(v ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
const asString = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
const firstString = (...values: unknown[]) => values.map(asString).find(Boolean);
const readJson = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

export function ProductCatalogMvp() {
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [assets, setAssets] = useState<ProductCatalogAsset[]>([]);
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyProductDraft);
  const [assetDraft, setAssetDraft] = useState<AssetDraft>(emptyAssetDraft);
  const [status, setStatus] = useState('Catálogo local pronto.');
  const exportPayload = useMemo(() => buildProductCatalogExport(products, assets), [products, assets]);

  const addProduct = () => {
    if (!productDraft.productName?.trim()) {
      setStatus('Informe o nome do produto antes de adicionar ao catálogo.');
      return;
    }

    const nextProduct = createProductCatalogItem({ productName: productForm.productName, status: productForm.status });
    const nextProducts = [nextProduct, ...products];
    setProducts(nextProducts);
    writeLocalStorage(PRODUCT_CATALOG_STORAGE_KEY, nextProducts);
    setProductForm(emptyProductForm());
    setStatus(`Produto "${nextProduct.productName}" adicionado ao catálogo local.`);
  };

  const addAsset = () => {
    if (!assetForm.title.trim()) {
    const created = createProductCatalogItem(productDraft);
    setItems((current) => [created, ...current]);
    setProductDraft(productForm());
    setStatus('Produto adicionado com ID único gerado no clique.');
  };

  const addAsset = () => {
    if (!assetDraft.title.trim()) {
    const product = normalizeProductCatalogItem({
      ...productDraft,
      tags: productDraft.tags,
      status: 'draft',
      sourceModules: ['Manual Catalog'],
      nextAction: productDraft.nextAction || 'manual review',
    });
    setProducts((items) => [...items, product]);
    setProductDraft(emptyProductDraft);
    setStatus(`Produto ${product.productName} adicionado com ID novo.`);
  };
  const addAsset = () => {
    if (!assetDraft.title?.trim()) {
      setStatus('Informe o título do asset antes de adicionar ao catálogo.');
      return;
    }

    if (!assetForm.productId.trim()) {
    if (!assetDraft.productId.trim()) {
    if (!assetDraft.productId) {
      setStatus('Selecione um produto antes de adicionar o asset.');
      return;
    }

    const nextAsset = createProductCatalogAsset({
      productId: assetForm.productId,
      title: assetForm.title,
      type: assetForm.type,
    });
    const nextAssets = [nextAsset, ...assets];
    setAssets(nextAssets);
    writeLocalStorage(PRODUCT_CATALOG_ASSETS_STORAGE_KEY, nextAssets);
    setAssetForm(emptyAssetForm());
    setStatus(`Asset "${nextAsset.title}" adicionado ao catálogo local.`);
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

    setProducts([]);
    setAssets([]);
    writeLocalStorage(PRODUCT_CATALOG_STORAGE_KEY, []);
    writeLocalStorage(PRODUCT_CATALOG_ASSETS_STORAGE_KEY, []);
    setProductForm(emptyProductForm());
    setAssetForm(emptyAssetForm());
    setStatus('Catálogo local limpo manualmente.');
  };

  return (
    <section data-testid="gxeon-product-catalog-mvp" className="rounded-2xl border border-[#d9a441]/25 bg-black/30 p-4">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d9a441]">Product Catalog MVP</p>
          <h3 className="text-lg font-black text-white">Catálogo local de produtos e assets</h3>
          <p className="text-xs leading-5 text-white/60">
            Registros manuais em localStorage; sem uploads, checkout, APIs externas ou publicação automática.
          </p>
        </div>
        <button
          type="button"
          onClick={clearCatalog}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/70"
        >
          Limpar catálogo
        </button>
      </div>

      <p
        data-testid="gxeon-product-catalog-status"
        className="mb-4 rounded-xl border border-[#d9a441]/15 bg-[#d9a441]/8 p-3 text-xs text-[#f4d58d]"
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

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <label className="text-xs font-bold text-white/70" htmlFor="product-catalog-name">
            Nome do produto
          </label>
          <input
            id="product-catalog-name"
            data-testid="gxeon-product-catalog-product-name"
            value={productForm.productName}
            onChange={(event) => setProductForm({ ...productForm, productName: event.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-sm text-white"
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
            className="mt-3 rounded-full bg-[#d9a441] px-3 py-1.5 text-xs font-black text-black"
            className="rounded-full bg-[#d9a441] px-3 py-1.5 text-xs font-bold text-black"
          >
            Add Product
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <label className="text-xs font-bold text-white/70" htmlFor="product-catalog-asset-product">
            Produto
          </label>
          <select
            id="product-catalog-asset-product"
            data-testid="gxeon-product-catalog-asset-product"
            value={assetForm.productId}
            onChange={(event) => setAssetForm({ ...assetForm, productId: event.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-sm text-white"
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.productName}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs font-bold text-white/70" htmlFor="product-catalog-asset-title">
            Título do asset
          </label>
          <input
            id="product-catalog-asset-title"
            data-testid="gxeon-product-catalog-asset-title"
            value={assetForm.title}
            onChange={(event) => setAssetForm({ ...assetForm, title: event.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-sm text-white"
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
    const asset = normalizeProductCatalogAsset(assetDraft);
    setAssets((items) => [...items, asset]);
    setProducts((items) =>
      items.map((p) =>
        p.id === asset.productId
          ? { ...p, assetIds: [...new Set([...p.assetIds, asset.id])], updatedAt: new Date().toISOString() }
          : p,
      ),
    );
    setAssetDraft(emptyAssetDraft);
    setStatus(`Asset ${asset.title} adicionado com ID novo.`);
  };
  const importSource = (source: (typeof IMPORT_SOURCES)[number]) => {
    const raw = window.localStorage.getItem(source.storageKey);

    if (!raw) {
      setStatus(`Nenhum rascunho local encontrado para ${source.label}. Nada foi importado.`);
      return;
    }

    const data = readJson(raw) as Record<string, unknown>;
    const product = normalizeProductCatalogItem({
      productName: firstString(data.productName, data.name, data.idea, data.title) || `${source.label} importado`,
      niche: asString(data.niche),
      audience: firstString(data.audience, data.targetAudience),
      problem: asString(data.problem),
      offer: firstString(data.offer, data.coreOffer),
      promise: asString(data.promise),
      basePrice: firstString(data.basePrice, data.desiredPrice, data.price),
      status: source.status === 'beta_ready' ? 'needs_review' : source.status,
      sourceModules: [source.moduleName],
      approvalStatus: 'pending_manual_review',
      betaPipelineStatus: 'manual_review_required',
      revenueStatus: 'manual_review_required',
      nextAction: 'manual review',
      tags: [source.label, 'imported'],
    });
    const asset = normalizeProductCatalogAsset({
      productId: product.id,
      assetType: source.assetType,
      title: `${source.label} local draft`,
      sourceModule: source.moduleName,
      summary: `Importação local explícita de ${source.label}; revisar manualmente antes de qualquer distribuição.`,
      contentPreview: serializeCatalogPreview(data),
      tags: [source.label, 'local-only'],
      status: 'needs_review',
      localOnly: true,
      humanApprovalRequired: true,
    });
    const linked = { ...product, assetIds: [asset.id] };
    setProducts((items) => [...items, linked]);
    setAssets((items) => [...items, asset]);
    setStatus(`${source.label} importado localmente com IDs novos e revisão manual obrigatória.`);
  };
  const save = () => {
    localStorage.setItem(PRODUCT_CATALOG_ITEMS_STORAGE_KEY, JSON.stringify(products));
    localStorage.setItem(PRODUCT_CATALOG_ASSETS_STORAGE_KEY, JSON.stringify(assets));
    setStatus('Catálogo salvo no localStorage.');
  };
  const load = () => {
    setProducts(readJson(localStorage.getItem(PRODUCT_CATALOG_ITEMS_STORAGE_KEY) || '[]') as ProductCatalogItem[]);
    setAssets(readJson(localStorage.getItem(PRODUCT_CATALOG_ASSETS_STORAGE_KEY) || '[]') as ProductCatalogAsset[]);
    setStatus('Catálogo carregado do localStorage.');
  };
  const copyMarkdown = () =>
    navigator.clipboard?.writeText(exportPayload.markdown).then(() => setStatus('Markdown copiado.'));

  return (
    <section className="rounded-2xl border border-[#d9a441]/20 bg-black/35 p-3" data-testid="gxeon-product-catalog-mvp">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d9a441]">APPFORGE-013</p>
          <h3 className="text-base font-black text-white">Product Catalog</h3>
          <p className="text-xs text-white/58">
            Catálogo local-only com importação explícita, sem uploads, APIs, pagamentos ou publicação automática.
          </p>
        </div>
        <span className="rounded-full border border-[#d9a441]/25 px-2 py-1 text-[10px] font-bold text-[#d9a441]">
          {products.length} produtos / {assets.length} assets
        </span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-2">
          <p className="mb-2 text-xs font-bold text-white">Adicionar produto</p>
          <input
            className="mb-1 w-full rounded bg-black/30 p-2 text-xs text-white"
            placeholder="Nome do produto"
            value={productDraft.productName}
            onChange={(e) => setProductDraft({ ...productDraft, productName: e.target.value })}
          />
          <input
            className="mb-1 w-full rounded bg-black/30 p-2 text-xs text-white"
            placeholder="Nicho"
            value={productDraft.niche}
            onChange={(e) => setProductDraft({ ...productDraft, niche: e.target.value })}
          />
          <input
            className="mb-1 w-full rounded bg-black/30 p-2 text-xs text-white"
            placeholder="Tags separadas por vírgula"
            onChange={(e) => setProductDraft({ ...productDraft, tags: parseTags(e.target.value) })}
          />
          <button className="rounded bg-[#d9a441] px-3 py-1 text-xs font-bold text-black" onClick={addProduct}>
            Add Product
          </button>
        </div>
        <div className="rounded-xl border border-white/10 p-2">
          <p className="mb-2 text-xs font-bold text-white">Adicionar asset</p>
          <select
            className="mb-1 w-full rounded bg-black/30 p-2 text-xs text-white"
            value={assetDraft.productId}
            onChange={(e) => setAssetDraft({ ...assetDraft, productId: e.target.value })}
          >
            <option value="">Selecione produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productName}
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
            className="mt-3 rounded-full bg-[#d9a441] px-3 py-1.5 text-xs font-black text-black"
          >
            className="rounded-full bg-[#d9a441] px-3 py-1.5 text-xs font-bold text-black"
          >
            className="mb-1 w-full rounded bg-black/30 p-2 text-xs text-white"
            placeholder="Título do asset"
            value={assetDraft.title}
            onChange={(e) => setAssetDraft({ ...assetDraft, title: e.target.value })}
          />
          <button className="rounded bg-[#d9a441] px-3 py-1 text-xs font-bold text-black" onClick={addAsset}>
            Add Asset
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div
          data-testid="gxeon-product-catalog-products"
          className="rounded-xl border border-white/10 p-3 text-xs text-white/70"
        >
          Produtos: {products.length}
        </div>
        <div
          data-testid="gxeon-product-catalog-assets"
          className="rounded-xl border border-white/10 p-3 text-xs text-white/70"
        >
          Assets: {assets.length}
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
      <div className="mt-3 flex flex-wrap gap-1.5">
        {IMPORT_SOURCES.map((s) => (
          <button
            key={s.storageKey}
            className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/70"
            onClick={() => importSource(s)}
          >
            Importar {s.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button onClick={save} className="rounded border border-white/10 px-2 py-1 text-xs text-white">
          Save
        </button>
        <button onClick={load} className="rounded border border-white/10 px-2 py-1 text-xs text-white">
          Load
        </button>
        <button
          onClick={() => setStatus(JSON.stringify(exportPayload))}
          className="rounded border border-white/10 px-2 py-1 text-xs text-white"
        >
          Export JSON
        </button>
        <button onClick={copyMarkdown} className="rounded border border-white/10 px-2 py-1 text-xs text-white">
          Copy Markdown
        </button>
        <button
          onClick={() => {
            setProducts([]);
            setAssets([]);
            setStatus('Catálogo limpo localmente.');
          }}
          className="rounded border border-white/10 px-2 py-1 text-xs text-white"
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
      <p className="mt-2 text-xs text-white/60" role="status">
        {status}
      </p>
    </section>
  );
}
