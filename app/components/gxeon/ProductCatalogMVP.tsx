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
  serializeCatalogPreview,
  stringifyProductCatalogJson,
  summarizeProductCatalog,
  type ProductCatalogAsset,
  type ProductCatalogAssetType,
  type ProductCatalogChannel,
  type ProductCatalogItem,
  type ProductCatalogStatus,
} from '~/lib/gxeon/productCatalog';

const IMPORTS = [
  ['Product Builder', PRODUCT_BUILDER_STORAGE_KEY, 'product_blueprint'],
  ['Marketplace Pack', MARKETPLACE_PACK_STORAGE_KEY, 'marketplace_pack'],
  ['Checkout Blueprint', CHECKOUT_BLUEPRINT_STORAGE_KEY, 'checkout_blueprint'],
  ['Landing Builder', LANDING_BUILDER_STORAGE_KEY, 'landing_blueprint'],
  ['Content Factory', CONTENT_FACTORY_STORAGE_KEY, 'content_pack'],
  ['Integration Readiness', INTEGRATION_READINESS_STORAGE_KEY, 'integration_dry_run'],
  ['Approval Ledger', APPROVAL_LEDGER_STORAGE_KEY, 'approval_record'],
  ['Beta Product Pipeline', BETA_PRODUCT_PIPELINE_STORAGE_KEY, 'beta_pipeline_record'],
  ['Revenue Ledger', REVENUE_LEDGER_STORAGE_KEY, 'revenue_record'],
] as const;

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white/80 outline-none focus:border-[#d9a441]/60';
const buttonClass = 'rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/70';

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

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function compactFromStored(raw: string) {
  const data = JSON.parse(raw);
  const name =
    data.productName ||
    data.name ||
    data.idea ||
    data.draft?.idea ||
    data.draft?.productName ||
    'Imported local product';

  return { name, preview: serializeCatalogPreview(data) };
}

export function ProductCatalogMvp() {
  const [collapsed, setCollapsed] = useState(false);
  const [items, setItems] = useState<ProductCatalogItem[]>(() =>
    readLocalStorage<ProductCatalogItem[]>(PRODUCT_CATALOG_STORAGE_KEY, []).map((item) =>
      normalizeProductCatalogItem(item),
    ),
  );
  const [assets, setAssets] = useState<ProductCatalogAsset[]>(() =>
    readLocalStorage<ProductCatalogAsset[]>(PRODUCT_CATALOG_ASSET_STORAGE_KEY, []).map((asset) =>
      normalizeProductCatalogAsset(asset),
    ),
  );
  const [form, setForm] = useState<ProductCatalogItem>(() => createProductCatalogItem({ productName: '' }, ''));
  const [asset, setAsset] = useState<ProductCatalogAsset>(() => createProductCatalogAsset({ title: '' }, ''));
  const [status, setStatus] = useState('Catálogo local pronto; nenhuma importação automática foi executada.');

  const summary = useMemo(() => summarizeProductCatalog(items, assets), [items, assets]);
  const markdown = useMemo(() => buildProductCatalogMarkdown(items, assets), [items, assets]);
  const json = useMemo(() => stringifyProductCatalogJson(items, assets), [items, assets]);

  const update = (patch: Partial<ProductCatalogItem>) => setForm((current) => ({ ...current, ...patch }));
  const updateAsset = (patch: Partial<ProductCatalogAsset>) => setAsset((current) => ({ ...current, ...patch }));

  const save = (nextItems = items, nextAssets = assets) => {
    writeLocalStorage(PRODUCT_CATALOG_STORAGE_KEY, nextItems);
    writeLocalStorage(PRODUCT_CATALOG_ASSET_STORAGE_KEY, nextAssets);
    setStatus('Catálogo salvo apenas no localStorage deste navegador.');
  };

  const addProduct = () => {
    const nextItem = createProductCatalogItem(form);
    const nextItems = [nextItem, ...items];
    setItems(nextItems);
    setForm(createProductCatalogItem({ productName: '' }, ''));
    save(nextItems, assets);
  };

  const addAsset = () => {
    const nextAsset = createProductCatalogAsset(asset);
    const nextAssets = [nextAsset, ...assets];
    setAssets(nextAssets);
    setAsset(createProductCatalogAsset({ title: '' }, ''));
    save(items, nextAssets);
  };

  const load = () => {
    setItems(
      readLocalStorage<ProductCatalogItem[]>(PRODUCT_CATALOG_STORAGE_KEY, []).map((item) =>
        normalizeProductCatalogItem(item),
      ),
    );
    setAssets(
      readLocalStorage<ProductCatalogAsset[]>(PRODUCT_CATALOG_ASSET_STORAGE_KEY, []).map((entry) =>
        normalizeProductCatalogAsset(entry),
      ),
    );
    setStatus('Catálogo carregado localmente.');
  };

  const clear = () => {
    setItems([]);
    setAssets([]);
    save([], []);
    setStatus('Catálogo local limpo. Nenhum serviço externo foi chamado.');
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus('Markdown do catálogo copiado localmente.');
    } catch {
      setStatus('Clipboard indisponível; copie manualmente pela prévia.');
    }
  };

  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `gxeon-product-catalog-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exportado localmente. Nenhum upload foi executado.');
  };

  const importLocalDraft = (label: string, storageKey: string, assetType: ProductCatalogAssetType) => {
    const raw = typeof window === 'undefined' ? null : window.localStorage.getItem(storageKey);

    if (!raw) {
      setStatus(`${label}: nenhum rascunho local encontrado.`);
      return;
    }

    try {
      const compact = compactFromStored(raw);
      const product = createProductCatalogItem({
        productName: compact.name,
        status: 'needs_review',
        sourceModules: [label],
        nextAction: 'manual_catalog_review',
      });
      const importedAsset = createProductCatalogAsset({
        productId: product.id,
        assetType,
        title: `${label} local import`,
        sourceModule: label,
        contentPreview: compact.preview,
        status: 'draft',
      });
      const nextItems = [product, ...items];
      const nextAssets = [importedAsset, ...assets];
      setItems(nextItems);
      setAssets(nextAssets);
      save(nextItems, nextAssets);
      setStatus(`${label}: importação local adicionada para revisão humana.`);
    } catch {
      setStatus(`${label}: falha ao ler rascunho local.`);
    }
  };

  return (
    <section
      data-testid="gxeon-product-catalog-mvp"
      className="my-3 rounded-2xl border border-[#d9a441]/25 bg-black/40 p-3 text-xs text-bolt-elements-textSecondary"
    >
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <b className="text-[#d9a441]">Product Catalog MVP</b>
          <br />
          Biblioteca local de produtos, ofertas, assets, status e próximos passos.
        </span>
        <span>{collapsed ? '+' : '−'}</span>
      </button>

      {!collapsed && (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#d9a441]">Produtos</p>
              <p className="text-lg font-black text-white">{summary.totalProducts}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#d9a441]">Assets</p>
              <p className="text-lg font-black text-white">{summary.totalAssets}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#d9a441]">Beta ready</p>
              <p className="text-lg font-black text-white">{summary.betaReadyProducts}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#d9a441]">Review</p>
              <p className="text-lg font-black text-white">{summary.needsReviewProducts}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {IMPORTS.map(([label, storageKey, assetType]) => (
              <button
                key={label}
                type="button"
                onClick={() => importLocalDraft(label, storageKey, assetType)}
                className={buttonClass}
              >
                Import {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-2">
              <p className="font-bold text-[#d9a441]">Produto local</p>
              <input
                className={inputClass}
                value={form.productName}
                onChange={(event) => update({ productName: event.target.value })}
                placeholder="Nome do produto"
              />
              <select
                className={inputClass}
                value={form.status}
                onChange={(event) => update({ status: event.target.value as ProductCatalogStatus })}
              >
                {PRODUCT_CATALOG_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                value={form.niche}
                onChange={(event) => update({ niche: event.target.value })}
                placeholder="Nicho"
              />
              <input
                className={inputClass}
                value={form.audience}
                onChange={(event) => update({ audience: event.target.value })}
                placeholder="Audiência"
              />
              <textarea
                className={`${inputClass} min-h-20`}
                value={form.offer}
                onChange={(event) => update({ offer: event.target.value })}
                placeholder="Oferta manual"
              />
              <input
                className={inputClass}
                value={form.tags.join(', ')}
                onChange={(event) => update({ tags: splitList(event.target.value) })}
                placeholder="Tags separadas por vírgula"
              />
              <select
                className={inputClass}
                value={form.channels[0] ?? 'internal'}
                onChange={(event) => update({ channels: [event.target.value as ProductCatalogChannel] })}
              >
                {PRODUCT_CATALOG_CHANNELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addProduct}
                className="rounded-full border border-[#d9a441]/30 px-3 py-1.5 text-[#f4d58d]"
              >
                Add product
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-2">
              <p className="font-bold text-[#d9a441]">Asset local</p>
              <select
                className={inputClass}
                value={asset.productId}
                onChange={(event) => updateAsset({ productId: event.target.value })}
              >
                <option value="">Sem produto vinculado</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.productName}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                value={asset.title}
                onChange={(event) => updateAsset({ title: event.target.value })}
                placeholder="Título do asset"
              />
              <select
                className={inputClass}
                value={asset.assetType}
                onChange={(event) => updateAsset({ assetType: event.target.value as ProductCatalogAssetType })}
              >
                {PRODUCT_CATALOG_ASSET_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <textarea
                className={`${inputClass} min-h-24`}
                value={asset.contentPreview}
                onChange={(event) => updateAsset({ contentPreview: event.target.value })}
                placeholder="Prévia local do conteúdo"
              />
              <button
                type="button"
                onClick={addAsset}
                className="rounded-full border border-[#d9a441]/30 px-3 py-1.5 text-[#f4d58d]"
              >
                Add asset
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => save()} className={buttonClass}>
              Save
            </button>
            <button type="button" onClick={load} className={buttonClass}>
              Load
            </button>
            <button type="button" onClick={clear} className={buttonClass}>
              Clear
            </button>
            <button type="button" onClick={copyMarkdown} className={buttonClass}>
              Copy Markdown
            </button>
            <button type="button" onClick={exportJson} className={buttonClass}>
              Export JSON
            </button>
          </div>

          <p className="rounded-lg border border-white/10 bg-black/25 p-2 text-white/58">{status}</p>

          <div className="grid gap-2 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#05060a] p-2">
              <p className="mb-2 font-bold text-[#d9a441]">Produtos</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <article key={item.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                    <h4 className="font-bold text-white">{item.productName}</h4>
                    <p className="text-white/55">
                      {item.status} • {item.channels.join(', ')}
                    </p>
                    <p className="mt-1 text-white/45">{item.nextAction}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#05060a] p-2">
              <p className="mb-2 font-bold text-[#d9a441]">Assets</p>
              <div className="space-y-2">
                {assets.map((entry) => (
                  <article key={entry.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                    <h4 className="font-bold text-white">{entry.title}</h4>
                    <p className="text-white/55">{entry.assetType} • local-only</p>
                    <p className="mt-1 text-white/45">{entry.contentPreview || entry.summary || 'Sem prévia.'}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <pre className="max-h-52 overflow-auto rounded-xl border border-white/10 bg-[#05060a] p-2 text-[11px] text-white/60">
            {markdown}
          </pre>
        </div>
      )}
    </section>
  );
}
