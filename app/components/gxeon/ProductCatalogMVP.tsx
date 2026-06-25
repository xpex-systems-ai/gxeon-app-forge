import React, { useMemo, useState } from 'react';
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

    if (!assetDraft.productId) {
      setStatus('Selecione um produto antes de adicionar o asset.');
      return;
    }

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
      <p className="mt-2 text-xs text-white/60" role="status">
        {status}
      </p>
    </section>
  );
}
