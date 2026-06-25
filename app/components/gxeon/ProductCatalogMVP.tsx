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
  stringifyProductCatalogJson,
  summarizeProductCatalog,
  type ProductCatalogAsset,
  type ProductCatalogAssetType,
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

const productForm = () => createProductCatalogItem({ productName: '', status: 'draft' }, '');
const assetForm = () => createProductCatalogAsset({ title: '', status: 'draft' }, '');
const split = (v: string) =>
  v
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

function compactFromStored(raw: string) {
  const data = JSON.parse(raw);
  const text = JSON.stringify(data);
  const name =
    data.productName ||
    data.name ||
    data.idea ||
    data.draft?.idea ||
    data.draft?.productName ||
    data[0]?.productName ||
    'Imported local product';

  return { name, text: text.slice(0, 900), data };
}

export function ProductCatalogMvp() {
  const [collapsed, setCollapsed] = useState(false);
  const [items, setItems] = useState<ProductCatalogItem[]>([]);
  const [assets, setAssets] = useState<ProductCatalogAsset[]>([]);
  const [form, setForm] = useState<ProductCatalogItem>(productForm());
  const [asset, setAsset] = useState<ProductCatalogAsset>(assetForm());
  const [status, setStatus] = useState('Catálogo local pronto; nenhuma importação automática foi executada.');
  const summary = useMemo(() => summarizeProductCatalog(items, assets), [items, assets]);
  const update = (patch: Partial<ProductCatalogItem>) => setForm((v) => ({ ...v, ...patch }));
  const updateAsset = (patch: Partial<ProductCatalogAsset>) => setAsset((v) => ({ ...v, ...patch }));
  const addProduct = () => {
    const item = createProductCatalogItem(form);
    setItems((v) => [item, ...v.filter((x) => x.id !== item.id)]);
    setForm(productForm());
    setStatus('Produto adicionado localmente; use Save Catalog para persistir.');
  };
  const addAsset = () => {
    const a = createProductCatalogAsset(asset);
    setAssets((v) => [a, ...v.filter((x) => x.id !== a.id)]);
    setItems((v) =>
      v.map((i) => (i.id === a.productId ? { ...i, assetIds: Array.from(new Set([...i.assetIds, a.id])) } : i)),
    );
    setAsset(assetForm());
    setStatus('Asset adicionado localmente.');
  };
  const save = () => {
    localStorage.setItem(PRODUCT_CATALOG_STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(PRODUCT_CATALOG_ASSET_STORAGE_KEY, JSON.stringify(assets));
    setStatus('Catálogo salvo apenas no localStorage do navegador.');
  };
  const load = () => {
    setItems(
      JSON.parse(localStorage.getItem(PRODUCT_CATALOG_STORAGE_KEY) || '[]').map((i: ProductCatalogItem) =>
        normalizeProductCatalogItem(i),
      ),
    );
    setAssets(
      JSON.parse(localStorage.getItem(PRODUCT_CATALOG_ASSET_STORAGE_KEY) || '[]').map((a: ProductCatalogAsset) =>
        normalizeProductCatalogAsset(a),
      ),
    );
    setStatus('Catálogo carregado somente das chaves locais do Product Catalog.');
  };
  const clear = () => {
    if (confirm('Clear only Product Catalog local keys?')) {
      localStorage.removeItem(PRODUCT_CATALOG_STORAGE_KEY);
      localStorage.removeItem(PRODUCT_CATALOG_ASSET_STORAGE_KEY);
      setItems([]);
      setAssets([]);
      setStatus('Somente as chaves locais do Product Catalog foram removidas.');
    }
  };
  const exportJson = () => {
    const blob = new Blob([stringifyProductCatalogJson(items, assets)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gxeon-product-catalog-local.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exportado via download do navegador; sem upload.');
  };
  const copyMarkdown = async () => {
    const md = buildProductCatalogMarkdown(items, assets);

    try {
      await navigator.clipboard.writeText(md);
      setStatus('Markdown copiado para clipboard local.');
    } catch {
      setStatus(md);
    }
  };
  const importModule = (label: string, key: string, type: ProductCatalogAssetType) => {
    const raw = localStorage.getItem(key);

    if (!raw) {
      setStatus(`Nenhum rascunho local encontrado para ${label}.`);
      return;
    }

    const compact = compactFromStored(raw);
    const item = createProductCatalogItem({
      productName: compact.name,
      status: label === 'Approval Ledger' ? 'needs_review' : 'draft',
      sourceModules: [label],
      proofNotes: label === 'Approval Ledger' ? 'Imported approval source; human review still required.' : '',
      nextAction: 'Review imported compact record manually.',
    });
    const a = createProductCatalogAsset({
      productId: item.id,
      assetType: type,
      title: `${label} compact import`,
      sourceModule: label,
      summary: 'Compact local-only import from existing browser draft/log.',
      contentPreview: compact.text,
      tags: ['imported', 'local-only'],
    });
    setItems((v) => [item, ...v.filter((x) => x.slug !== item.slug)]);
    setAssets((v) => [a, ...v]);
    setStatus(`${label} importado como registro compacto local; sem envio externo.`);
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
          <p className="text-xs text-white/60">
            Local-only: não faz upload, publica, vende, sincroniza, chama APIs, banco, webhooks, n8n, email, WhatsApp ou
            marketplace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full border border-[#d9a441]/30 px-3 py-1 text-xs"
        >
          {collapsed ? 'Expandir' : 'Recolher'}
        </button>
      </div>
      {!collapsed && (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {Object.entries(summary).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-black/30 p-2">
                <p className="text-[10px] text-white/45">{k}</p>
                <p className="text-lg font-black text-[#f4d58d]">{v}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {['Save Catalog', 'Load Catalog', 'Export JSON', 'Copy Markdown', 'Clear Catalog'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={
                  (
                    {
                      'Save Catalog': save,
                      'Load Catalog': load,
                      'Export JSON': exportJson,
                      'Copy Markdown': copyMarkdown,
                      'Clear Catalog': clear,
                    } as Record<string, () => void>
                  )[label]
                }
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-white/10 p-2">
            <p className="mb-2 text-xs font-bold text-[#d9a441]">Importações explícitas</p>
            <div className="flex flex-wrap gap-1.5">
              {IMPORTS.map(([label, key, type]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => importModule(label, key, type)}
                  className="rounded-full border border-[#d9a441]/20 px-2 py-1 text-[11px]"
                >
                  Import {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 p-2">
              <p className="mb-2 text-xs font-bold text-[#d9a441]">Add Product</p>
              {[
                'productName',
                'niche',
                'audience',
                'problem',
                'offer',
                'promise',
                'basePrice',
                'tags',
                'riskNotes',
                'proofNotes',
                'nextAction',
              ].map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={
                    Array.isArray((form as any)[field]) ? (form as any)[field].join(', ') : (form as any)[field] || ''
                  }
                  onChange={(e) =>
                    update({ [field]: field === 'tags' ? split(e.target.value) : e.target.value } as any)
                  }
                  className="mb-1 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-xs"
                />
              ))}
              <select
                value={form.status}
                onChange={(e) => update({ status: e.target.value as ProductCatalogStatus })}
                className="mb-1 w-full rounded-lg bg-black p-2 text-xs"
              >
                {PRODUCT_CATALOG_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                multiple
                value={form.channels}
                onChange={(e) =>
                  update({ channels: Array.from(e.currentTarget.selectedOptions).map((o) => o.value) as any })
                }
                className="mb-2 w-full rounded-lg bg-black p-2 text-xs"
              >
                {PRODUCT_CATALOG_CHANNELS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addProduct}
                className="rounded-full bg-[#d9a441] px-3 py-1 text-xs font-black text-black"
              >
                Add Product
              </button>
            </div>
            <div className="rounded-xl border border-white/10 p-2">
              <p className="mb-2 text-xs font-bold text-[#d9a441]">Add Asset</p>
              <select
                value={asset.productId}
                onChange={(e) => updateAsset({ productId: e.target.value })}
                className="mb-1 w-full rounded-lg bg-black p-2 text-xs"
              >
                <option value="">Select product</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.productName}
                  </option>
                ))}
              </select>
              <select
                value={asset.assetType}
                onChange={(e) => updateAsset({ assetType: e.target.value as ProductCatalogAssetType })}
                className="mb-1 w-full rounded-lg bg-black p-2 text-xs"
              >
                {PRODUCT_CATALOG_ASSET_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              {['title', 'sourceModule', 'summary', 'contentPreview', 'tags', 'status'].map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={
                    Array.isArray((asset as any)[field])
                      ? (asset as any)[field].join(', ')
                      : (asset as any)[field] || ''
                  }
                  onChange={(e) =>
                    updateAsset({ [field]: field === 'tags' ? split(e.target.value) : e.target.value } as any)
                  }
                  className="mb-1 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-xs"
                />
              ))}
              <button
                type="button"
                onClick={addAsset}
                className="rounded-full bg-[#d9a441] px-3 py-1 text-xs font-black text-black"
              >
                Add Asset
              </button>
            </div>
          </div>
          <p className="rounded-lg border border-[#d9a441]/20 bg-[#d9a441]/10 p-2 text-xs text-[#f4d58d]">{status}</p>
          <div className="grid gap-2 lg:grid-cols-2">
            {items.map((i) => (
              <article key={i.id} className="rounded-xl border border-white/10 bg-black/25 p-2">
                <div className="flex justify-between gap-2">
                  <b>{i.productName}</b>
                  <button
                    type="button"
                    onClick={() => confirm('Delete product?') && setItems((v) => v.filter((x) => x.id !== i.id))}
                    className="text-xs text-red-300"
                  >
                    delete
                  </button>
                </div>
                <p className="text-xs text-white/55">
                  {i.offer || i.problem || 'Sem resumo'} · {i.channels.join(', ')}
                </p>
                <select
                  value={i.status}
                  onChange={(e) =>
                    setItems((v) =>
                      v.map((x) => (x.id === i.id ? { ...x, status: e.target.value as ProductCatalogStatus } : x)),
                    )
                  }
                  className="mt-2 rounded bg-black p-1 text-xs"
                >
                  {PRODUCT_CATALOG_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </article>
            ))}
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {assets.map((a) => (
              <article key={a.id} className="rounded-xl border border-[#d9a441]/14 bg-black/25 p-2">
                <div className="flex justify-between">
                  <b>{a.title}</b>
                  <button
                    type="button"
                    onClick={() => confirm('Delete asset?') && setAssets((v) => v.filter((x) => x.id !== a.id))}
                    className="text-xs text-red-300"
                  >
                    delete
                  </button>
                </div>
                <p className="text-xs text-white/55">
                  {a.assetType} · {a.sourceModule}
                </p>
                <select
                  value={a.status}
                  onChange={(e) =>
                    setAssets((v) => v.map((x) => (x.id === a.id ? { ...x, status: e.target.value as any } : x)))
                  }
                  className="mt-2 rounded bg-black p-1 text-xs"
                >
                  <option>draft</option>
                  <option>reviewed</option>
                  <option>approved</option>
                  <option>archived</option>
                </select>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
