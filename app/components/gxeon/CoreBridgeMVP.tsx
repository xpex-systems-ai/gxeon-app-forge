import React, { useMemo, useState } from 'react';
import {
  CORE_BRIDGE_OPPORTUNITY_STORAGE_KEY,
  CORE_BRIDGE_PRODUCT_READY_STORAGE_KEY,
  CORE_BRIDGE_SAFETY_FLAGS,
  MOCK_CORE_OPPORTUNITY_PAYLOAD,
  MOCK_FORGE_PRODUCT_READY_PAYLOAD,
  buildCoreBridgeJson,
  buildCoreBridgeMarkdown,
  normalizeCoreOpportunityPayload,
  normalizeForgeProductReadyPayload,
  type ForgeProductReadyPayload,
} from '~/lib/gxeon/coreBridge';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white/80 outline-none focus:border-[#d9a441]/60';

export function CoreBridgeMvp() {
  const [isOpen, setIsOpen] = useState(false);
  const [opportunityText, setOpportunityText] = useState(JSON.stringify(MOCK_CORE_OPPORTUNITY_PAYLOAD, null, 2));
  const [productDraft, setProductDraft] = useState<ForgeProductReadyPayload>(MOCK_FORGE_PRODUCT_READY_PAYLOAD);
  const [status, setStatus] = useState('Core Bridge local-only: mock contracts only; no external actions.');

  const opportunity = useMemo(() => {
    try {
      return normalizeCoreOpportunityPayload(JSON.parse(opportunityText));
    } catch {
      return normalizeCoreOpportunityPayload(MOCK_CORE_OPPORTUNITY_PAYLOAD);
    }
  }, [opportunityText]);
  const productReady = useMemo(() => normalizeForgeProductReadyPayload(productDraft), [productDraft]);
  const markdown = useMemo(() => buildCoreBridgeMarkdown(opportunity, productReady), [opportunity, productReady]);
  const json = useMemo(() => buildCoreBridgeJson(opportunity, productReady), [opportunity, productReady]);

  const copy = async (value: string, ok: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(ok);
    } catch {
      setStatus('Clipboard indisponível. Use a prévia local para copiar manualmente.');
    }
  };

  const save = () => {
    localStorage.setItem(CORE_BRIDGE_OPPORTUNITY_STORAGE_KEY, JSON.stringify(opportunity));
    localStorage.setItem(CORE_BRIDGE_PRODUCT_READY_STORAGE_KEY, JSON.stringify(productReady));
    setStatus('Rascunhos salvos no localStorage deste navegador.');
  };

  const load = () => {
    const rawOpportunity = localStorage.getItem(CORE_BRIDGE_OPPORTUNITY_STORAGE_KEY);
    const rawProduct = localStorage.getItem(CORE_BRIDGE_PRODUCT_READY_STORAGE_KEY);

    if (rawOpportunity) {
      setOpportunityText(JSON.stringify(normalizeCoreOpportunityPayload(JSON.parse(rawOpportunity)), null, 2));
    }

    if (rawProduct) {
      setProductDraft(normalizeForgeProductReadyPayload(JSON.parse(rawProduct)));
    }

    setStatus(rawOpportunity || rawProduct ? 'Rascunhos carregados localmente.' : 'Nenhum rascunho local encontrado.');
  };

  const clear = () => {
    localStorage.removeItem(CORE_BRIDGE_OPPORTUNITY_STORAGE_KEY);
    localStorage.removeItem(CORE_BRIDGE_PRODUCT_READY_STORAGE_KEY);
    setOpportunityText(JSON.stringify(MOCK_CORE_OPPORTUNITY_PAYLOAD, null, 2));
    setProductDraft(MOCK_FORGE_PRODUCT_READY_PAYLOAD);
    setStatus('Estado local limpo; payload mock restaurado.');
  };

  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `gxeon-core-bridge-local-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exportado via download local do navegador; nenhum upload foi executado.');
  };

  const updateProduct = (patch: Partial<ForgeProductReadyPayload['product']>) =>
    setProductDraft((current) =>
      normalizeForgeProductReadyPayload({ ...current, product: { ...current.product, ...patch } }),
    );
  const updateIntegration = (patch: Partial<ForgeProductReadyPayload['integrationRequest']>) =>
    setProductDraft((current) =>
      normalizeForgeProductReadyPayload({
        ...current,
        integrationRequest: { ...current.integrationRequest, ...patch },
      }),
    );
  const updateApproval = (patch: Partial<ForgeProductReadyPayload['approval']>) =>
    setProductDraft((current) =>
      normalizeForgeProductReadyPayload({ ...current, approval: { ...current.approval, ...patch } }),
    );

  const cards = [
    ['Repo', `${opportunity.repo.owner}/${opportunity.repo.name}`],
    ['License', opportunity.repo.license],
    ['Stack', opportunity.technical.stack.join(', ')],
    ['Risk level', `${opportunity.technical.securityRisk} security`],
    ['Product potential', opportunity.commercial.pricingHypothesis],
    ['Suggested product', opportunity.commercial.suggestedProduct],
    ['Channel fit', opportunity.commercial.distributionChannel],
  ];

  return (
    <section
      data-testid="gxeon-core-bridge-mvp"
      className="my-3 rounded-2xl border border-[#d9a441]/25 bg-black/40 p-3 text-xs text-bolt-elements-textSecondary"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <b className="text-[#d9a441]">Core Bridge MVP</b>
          <br />
          Contratos locais Core-to-Forge e Forge-to-Core, sem Core API real.
        </span>
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#d9a441]">{label}</p>
                <p className="mt-1 font-semibold text-white/78">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <label className="block">
              <span className="text-[#d9a441]">CoreOpportunityPayload mock JSON</span>
              <textarea
                className={`${inputClass} mt-1 min-h-72 font-mono`}
                value={opportunityText}
                onChange={(event) => setOpportunityText(event.target.value)}
              />
            </label>
            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-2">
              <p className="font-bold text-[#d9a441]">ForgeProductReadyPayload draft</p>
              <input
                className={inputClass}
                value={productReady.product.name}
                onChange={(event) => updateProduct({ name: event.target.value })}
                placeholder="Product name"
              />
              <input
                className={inputClass}
                value={productReady.product.catalogId}
                onChange={(event) => updateProduct({ catalogId: event.target.value })}
                placeholder="Catalog ID"
              />
              <input
                className={inputClass}
                value={productReady.product.deliveryType}
                onChange={(event) => updateProduct({ deliveryType: event.target.value })}
                placeholder="Delivery type"
              />
              <select
                className={inputClass}
                value={productReady.integrationRequest.target}
                onChange={(event) =>
                  updateIntegration({
                    target: event.target.value as ForgeProductReadyPayload['integrationRequest']['target'],
                  })
                }
              >
                <option value="hotmart_future">hotmart_future</option>
                <option value="core_future">core_future</option>
                <option value="manual_review">manual_review</option>
              </select>
              <input
                className={inputClass}
                value={productReady.approval.nextAction}
                onChange={(event) => updateApproval({ nextAction: event.target.value })}
                placeholder="Next action"
              />
              <div className="flex flex-wrap gap-2">
                {Object.entries(CORE_BRIDGE_SAFETY_FLAGS).map(([key]) => (
                  <span
                    key={key}
                    className="rounded-full border border-[#d9a441]/20 px-2 py-1 text-[10px] text-[#f4d58d]"
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpportunityText(JSON.stringify(MOCK_CORE_OPPORTUNITY_PAYLOAD, null, 2))}
              className="rounded-full border border-white/10 px-3 py-1.5 text-white/70"
            >
              Generate mock Core payload
            </button>
            <button
              type="button"
              onClick={() => copy(markdown, 'Markdown copiado localmente.')}
              className="rounded-full border border-[#d9a441]/30 px-3 py-1.5 text-[#f4d58d]"
            >
              Copy Markdown
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="rounded-full border border-[#d9a441]/30 px-3 py-1.5 text-[#f4d58d]"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => copy(json, 'JSON copiado localmente.')}
              className="rounded-full border border-white/10 px-3 py-1.5 text-white/70"
            >
              Copy JSON
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-full border border-white/10 px-3 py-1.5 text-white/70"
            >
              Save
            </button>
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-white/10 px-3 py-1.5 text-white/70"
            >
              Load
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-full border border-white/10 px-3 py-1.5 text-white/70"
            >
              Clear
            </button>
          </div>
          <p className="rounded-lg border border-white/10 bg-black/25 p-2 text-white/58">{status}</p>
          <pre className="max-h-72 overflow-auto rounded-xl border border-white/10 bg-[#05060a] p-2 text-[11px] text-white/60">
            {markdown}
          </pre>
        </div>
      )}
    </section>
  );
}
