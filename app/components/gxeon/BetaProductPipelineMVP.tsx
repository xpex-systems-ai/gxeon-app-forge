import React, { useMemo, useState } from 'react';
import { APPROVAL_LEDGER_STORAGE_KEY } from '~/lib/gxeon/approvalLedger';
import { CHECKOUT_BLUEPRINT_STORAGE_KEY } from '~/lib/gxeon/checkoutBlueprint';
import { CONTENT_FACTORY_STORAGE_KEY } from '~/lib/gxeon/contentFactory';
import { INTEGRATION_READINESS_STORAGE_KEY } from '~/lib/gxeon/integrationReadiness';
import { LANDING_BUILDER_STORAGE_KEY } from '~/lib/gxeon/landingBuilder';
import { MARKETPLACE_PACK_STORAGE_KEY } from '~/lib/gxeon/marketplacePack';
import { PRODUCT_BUILDER_STORAGE_KEY } from '~/lib/gxeon/productBuilder';
import {
  BETA_PRODUCT_PIPELINE_STORAGE_KEY,
  BETA_PRODUCT_PRIORITIES,
  BETA_PRODUCT_STAGES,
  READINESS_KEYS,
  buildBetaPipelineMarkdown,
  createBetaPipelineItem,
  isBetaItemNeedsReview,
  normalizeBetaPipelineItem,
  stringifyBetaPipelineJson,
  summarizeBetaPipelineItems,
  type BetaProductPipelineItem,
  type BetaProductPriority,
  type BetaProductStage,
} from '~/lib/gxeon/betaProductPipeline';

const checkpointModules = [
  { label: 'Product Builder', key: PRODUCT_BUILDER_STORAGE_KEY, readiness: 'productBlueprint', stage: 'product_draft' },
  { label: 'Marketplace Pack', key: MARKETPLACE_PACK_STORAGE_KEY, readiness: 'marketplacePack', stage: 'pack_ready' },
  {
    label: 'Checkout Blueprint',
    key: CHECKOUT_BLUEPRINT_STORAGE_KEY,
    readiness: 'checkoutBlueprint',
    stage: 'checkout_ready',
  },
  { label: 'Landing Builder', key: LANDING_BUILDER_STORAGE_KEY, readiness: 'landingBlueprint', stage: 'landing_ready' },
  { label: 'Content Factory', key: CONTENT_FACTORY_STORAGE_KEY, readiness: 'contentPack', stage: 'content_ready' },
  {
    label: 'Integration Readiness',
    key: INTEGRATION_READINESS_STORAGE_KEY,
    readiness: 'integrationDryRun',
    stage: 'integration_dry_run_ready',
  },
  {
    label: 'Approval Ledger',
    key: APPROVAL_LEDGER_STORAGE_KEY,
    readiness: 'approvalLedgerEntry',
    stage: 'needs_review',
  },
] as const;
const emptyForm = () => createBetaPipelineItem({ productName: '', owner: 'Operator' });
const fieldClass =
  'rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none focus:border-[#d9a441]/60';

function compactDraft(raw: string, label: string) {
  const parsed = JSON.parse(raw);
  const source = Array.isArray(parsed) ? parsed[0] || {} : parsed;

  return {
    productName: String(source.productName || source.idea || source.sourceProductIdea || `${label} checkpoint`),
    niche: String(source.niche || source.sourceNiche || ''),
    audience: String(source.targetAudience || source.sourceAudience || ''),
    offer: String(source.offer || source.coreOffer || source.summary || '').slice(0, 300),
    basePrice: String(source.desiredPrice || source.basePrice || ''),
    evidenceNotes: `${label} compact checkpoint imported locally; full markdown/prompts/secrets excluded.`,
  };
}

export function BetaProductPipelineMvp() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<BetaProductPipelineItem[]>([]);
  const [form, setForm] = useState<BetaProductPipelineItem>(() => emptyForm());
  const [status, setStatus] = useState(
    'Beta Pipeline local-only: no database, APIs, payments, webhooks, n8n, email, WhatsApp, social posting or publication.',
  );
  const summary = useMemo(() => summarizeBetaPipelineItems(items), [items]);
  const updateForm = (patch: Partial<BetaProductPipelineItem>) =>
    setForm((cur) => normalizeBetaPipelineItem({ ...cur, ...patch, updatedAt: new Date().toISOString() }));
  const addProduct = (item = form) => {
    setItems((cur) => [createBetaPipelineItem(item), ...cur]);
    setForm(emptyForm());
    setStatus('Product added locally. Use Save Pipeline for browser localStorage persistence.');
  };
  const updateItem = (id: string, patch: Partial<BetaProductPipelineItem>) =>
    setItems((cur) =>
      cur.map((item) =>
        item.id === id ? normalizeBetaPipelineItem({ ...item, ...patch, updatedAt: new Date().toISOString() }) : item,
      ),
    );
  const importCheckpoint = (module: (typeof checkpointModules)[number]) => {
    const raw = localStorage.getItem(module.key);

    if (!raw) {
      setStatus(`No local ${module.label} draft found. Nothing imported.`);
      return;
    }

    const compact = compactDraft(raw, module.label);
    const existing = items.find((i) => i.productName.toLowerCase() === compact.productName.toLowerCase());
    const patch = {
      ...compact,
      stage: module.stage as BetaProductStage,
      readiness: { ...(existing?.readiness || form.readiness), [module.readiness]: true },
    };

    if (existing) {
      updateItem(existing.id, patch);
    } else {
      addProduct(patch);
    }

    setStatus(
      `${module.label} compact checkpoint imported/enriched locally without full markdown, prompts or secret-like fields.`,
    );
  };
  const save = () => {
    localStorage.setItem(BETA_PRODUCT_PIPELINE_STORAGE_KEY, JSON.stringify(items));
    setStatus('Pipeline saved to this browser only.');
  };
  const load = () => {
    const raw = localStorage.getItem(BETA_PRODUCT_PIPELINE_STORAGE_KEY);
    setItems(raw ? JSON.parse(raw).map((i: Partial<BetaProductPipelineItem>) => normalizeBetaPipelineItem(i)) : []);
    setStatus(raw ? 'Pipeline loaded from localStorage.' : 'No saved local pipeline found.');
  };
  const exportJson = () => {
    const blob = new Blob([stringifyBetaPipelineJson(items)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gxeon-beta-product-pipeline.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exported by browser download only.');
  };
  const copyMarkdown = async () => {
    const md = buildBetaPipelineMarkdown(items);

    try {
      await navigator.clipboard.writeText(md);
      setStatus('Markdown copied locally to clipboard.');
    } catch {
      setStatus('Clipboard unavailable; use Export JSON or browser console fallback.');
    }
  };
  const clear = () => {
    if (confirm('Clear local Beta Product Pipeline items?')) {
      setItems([]);
      localStorage.removeItem(BETA_PRODUCT_PIPELINE_STORAGE_KEY);
      setStatus('Pipeline cleared locally.');
    }
  };

  return (
    <section className="my-3 rounded-2xl border border-[#d9a441]/25 bg-[#05060a] p-3 text-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a441]">
            Local-only beta pipeline
          </span>
          <h3 className="text-base font-black">Beta Product Pipeline MVP</h3>
        </span>
        <span className="rounded-full border border-[#d9a441]/25 px-2 py-1 text-xs">
          {isOpen ? 'Collapse' : 'Open'}
        </span>
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3">
          <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2 text-xs text-amber-100">
            Operational planning only; not legal/tax/financial advice. Manual publication must follow platform rules.
            Checkout/payment/marketplace publication are out of scope.
          </p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(summary).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-black/30 p-2">
                <p className="text-[10px] uppercase text-white/45">{k}</p>
                <p className="text-lg font-black text-[#d9a441]">{v}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className={fieldClass}
              placeholder="Product name"
              value={form.productName}
              onChange={(e) => updateForm({ productName: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Niche"
              value={form.niche}
              onChange={(e) => updateForm({ niche: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Audience"
              value={form.audience}
              onChange={(e) => updateForm({ audience: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Offer"
              value={form.offer}
              onChange={(e) => updateForm({ offer: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Base price hypothesis"
              value={form.basePrice}
              onChange={(e) => updateForm({ basePrice: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Owner"
              value={form.owner}
              onChange={(e) => updateForm({ owner: e.target.value })}
            />
            <select
              className={fieldClass}
              value={form.stage}
              onChange={(e) => updateForm({ stage: e.target.value as BetaProductStage })}
            >
              {BETA_PRODUCT_STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              className={fieldClass}
              value={form.priority}
              onChange={(e) => updateForm({ priority: e.target.value as BetaProductPriority })}
            >
              {BETA_PRODUCT_PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <textarea
              className={fieldClass}
              placeholder="Blockers"
              value={form.blockers}
              onChange={(e) => updateForm({ blockers: e.target.value })}
            />
            <textarea
              className={fieldClass}
              placeholder="Next action"
              value={form.nextAction}
              onChange={(e) => updateForm({ nextAction: e.target.value })}
            />
            <textarea
              className={fieldClass}
              placeholder="Launch notes"
              value={form.launchNotes}
              onChange={(e) => updateForm({ launchNotes: e.target.value })}
            />
            <textarea
              className={fieldClass}
              placeholder="Evidence notes"
              value={form.evidenceNotes}
              onChange={(e) => updateForm({ evidenceNotes: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {READINESS_KEYS.map((key) => (
              <label key={key} className="rounded-full border border-white/10 px-2 py-1 text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={form.readiness[key]}
                  onChange={(e) => updateForm({ readiness: { ...form.readiness, [key]: e.target.checked } })}
                />
                {key}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {['Add Product', 'Save Pipeline', 'Load Pipeline', 'Export JSON', 'Copy Markdown', 'Clear Pipeline'].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  onClick={
                    {
                      'Add Product': () => addProduct(),
                      'Save Pipeline': save,
                      'Load Pipeline': load,
                      'Export JSON': exportJson,
                      'Copy Markdown': copyMarkdown,
                      'Clear Pipeline': clear,
                    }[label]
                  }
                  className="rounded-full border border-[#d9a441]/25 px-3 py-1.5 text-xs hover:bg-[#d9a441]/10"
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {checkpointModules.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => importCheckpoint(m)}
                className="rounded-full border border-white/10 px-2 py-1 text-[11px]"
              >
                Import {m.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/55">{status}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className={`rounded-xl border p-2 ${isBetaItemNeedsReview(item) ? 'border-amber-400/40 bg-amber-400/10' : 'border-white/10 bg-black/30'}`}
              >
                <div className="flex justify-between gap-2">
                  <strong>{item.productName}</strong>
                  <span className="text-[#d9a441]">{item.readinessScore}%</span>
                </div>
                {item.stage === 'approved_for_beta' && !item.readiness.humanApproval && (
                  <p className="text-xs text-amber-200">Human approval required before beta execution.</p>
                )}
                <p className="text-xs text-white/55">
                  {item.niche} • {item.audience}
                </p>
                <div className="mt-2 flex gap-2">
                  <select
                    className={fieldClass}
                    value={item.stage}
                    onChange={(e) => updateItem(item.id, { stage: e.target.value as BetaProductStage })}
                  >
                    {BETA_PRODUCT_STAGES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    className={fieldClass}
                    value={item.priority}
                    onChange={(e) => updateItem(item.id, { priority: e.target.value as BetaProductPriority })}
                  >
                    {BETA_PRODUCT_PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      confirm('Delete local item?') && setItems((cur) => cur.filter((i) => i.id !== item.id))
                    }
                    className="rounded-lg border border-red-400/30 px-2 text-xs text-red-200"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 text-xs text-white/60">Next: {item.nextAction || 'Define local next action.'}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
