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
      setStatus('Informe o título do asset antes de adicionar ao catálogo.');
      return;
    }

    if (!assetForm.productId.trim()) {
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
          />
          <button
            type="button"
            data-testid="gxeon-product-catalog-add-product"
            onClick={addProduct}
            className="mt-3 rounded-full bg-[#d9a441] px-3 py-1.5 text-xs font-black text-black"
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
          />
          <button
            type="button"
            data-testid="gxeon-product-catalog-add-asset"
            onClick={addAsset}
            className="mt-3 rounded-full bg-[#d9a441] px-3 py-1.5 text-xs font-black text-black"
          >
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
    </section>
  );
}
