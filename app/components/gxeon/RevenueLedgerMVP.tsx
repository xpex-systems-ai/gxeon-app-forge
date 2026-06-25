import React, { useMemo, useState } from 'react';
import { APPROVAL_LEDGER_STORAGE_KEY } from '~/lib/gxeon/approvalLedger';
import { BETA_PRODUCT_PIPELINE_STORAGE_KEY } from '~/lib/gxeon/betaProductPipeline';
import { CHECKOUT_BLUEPRINT_STORAGE_KEY } from '~/lib/gxeon/checkoutBlueprint';
import { MARKETPLACE_PACK_STORAGE_KEY } from '~/lib/gxeon/marketplacePack';
import { PRODUCT_BUILDER_STORAGE_KEY } from '~/lib/gxeon/productBuilder';
import {
  REVENUE_CHANNELS,
  REVENUE_CURRENCIES,
  REVENUE_LEDGER_STATUSES,
  REVENUE_LEDGER_STORAGE_KEY,
  REVENUE_PROOF_TYPES,
  buildRevenueLedgerMarkdown,
  calculateRevenueLedgerSummary,
  createRevenueLedgerEntry,
  normalizeRevenueLedgerEntry,
  stringifyRevenueLedgerJson,
  type RevenueLedgerEntry,
  type RevenueLedgerStatus,
  type RevenueProofType,
} from '~/lib/gxeon/revenueLedger';

const fieldClass =
  'rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none focus:border-[#d9a441]/60';
const emptyForm = () => createRevenueLedgerEntry({ productName: '', operatorConfirmedBy: 'Operator' });
const imports = [
  { label: 'Beta Pipeline', key: BETA_PRODUCT_PIPELINE_STORAGE_KEY, sourceModule: 'Beta Product Pipeline' },
  { label: 'Approval Ledger', key: APPROVAL_LEDGER_STORAGE_KEY, sourceModule: 'Approval Ledger' },
  { label: 'Checkout Blueprint', key: CHECKOUT_BLUEPRINT_STORAGE_KEY, sourceModule: 'Checkout Blueprint' },
  { label: 'Marketplace Pack', key: MARKETPLACE_PACK_STORAGE_KEY, sourceModule: 'Marketplace Pack' },
  { label: 'Product Builder', key: PRODUCT_BUILDER_STORAGE_KEY, sourceModule: 'Product Builder' },
];

function compactDraft(raw: string, sourceModule: string) {
  const parsed = JSON.parse(raw);
  const source = Array.isArray(parsed)
    ? parsed[0] || {}
    : parsed.items?.[0] || parsed.entries?.[0] || parsed.draft || parsed;

  return createRevenueLedgerEntry({
    productName: String(source.productName || source.idea || source.sourceProductIdea || `${sourceModule} checkpoint`),
    pipelineItemId: String(source.id || ''),
    sourceModule,
    plannedPrice: String(
      source.basePrice || source.desiredPrice || source.sourcePrice || source.plannedPrice || '',
    ) as any,
    buyerOrSegment: String(source.audience || source.targetAudience || source.sourceAudience || ''),
    offerSummary: String(source.offer || source.summary || source.sourceOffer || source.promise || '').slice(0, 280),
    riskNotes: `${sourceModule} compact checkpoint imported locally; full prompts, markdown and secret-like fields excluded.`,
    nextAction: 'Review manually before any commercial follow-up.',
    status: 'planned',
  });
}

export function RevenueLedgerMvp() {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<RevenueLedgerEntry[]>([]);
  const [form, setForm] = useState<RevenueLedgerEntry>(() => emptyForm());
  const [status, setStatus] = useState(
    'Revenue Ledger local-only: no database, APIs, checkout, payment processing, webhooks, n8n, email, WhatsApp, social posting or publication.',
  );
  const summary = useMemo(() => calculateRevenueLedgerSummary(entries), [entries]);
  const updateForm = (patch: Partial<RevenueLedgerEntry>) =>
    setForm((cur) => normalizeRevenueLedgerEntry({ ...cur, ...patch, updatedAt: new Date().toISOString() }));
  const addEntry = (entry = form) => {
    setEntries((cur) => [createRevenueLedgerEntry(entry), ...cur]);
    setForm(emptyForm());
    setStatus('Entry added locally. Use Save Ledger for browser localStorage persistence.');
  };
  const updateEntry = (id: string, patch: Partial<RevenueLedgerEntry>) =>
    setEntries((cur) =>
      cur.map((e) =>
        e.id === id ? normalizeRevenueLedgerEntry({ ...e, ...patch, updatedAt: new Date().toISOString() }) : e,
      ),
    );
  const importFrom = (key: string, sourceModule: string) => {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      setStatus(`No local ${sourceModule} draft found. Nothing imported.`);

      return;
    }

    addEntry(compactDraft(raw, sourceModule));
    setStatus(`${sourceModule} compact checkpoint imported as planned revenue hypothesis only.`);
  };
  const save = () => {
    window.localStorage.setItem(REVENUE_LEDGER_STORAGE_KEY, stringifyRevenueLedgerJson(entries));
    setStatus('Ledger saved locally in this browser only.');
  };
  const load = () => {
    const raw = window.localStorage.getItem(REVENUE_LEDGER_STORAGE_KEY);

    if (!raw) {
      setStatus('No saved Revenue Ledger found in localStorage.');

      return;
    }

    const parsed = JSON.parse(raw);
    setEntries(
      (parsed.entries || parsed || []).map((e: Partial<RevenueLedgerEntry>) => normalizeRevenueLedgerEntry(e)),
    );
    setStatus('Ledger loaded from localStorage.');
  };
  const exportJson = () => {
    const blob = new Blob([stringifyRevenueLedgerJson(entries)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gxeon-revenue-ledger-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exported by browser download only.');
  };
  const copyMarkdown = async () => {
    const md = buildRevenueLedgerMarkdown(entries);

    try {
      await navigator.clipboard.writeText(md);
      setStatus('Markdown copied locally to clipboard.');
    } catch {
      setStatus('Clipboard unavailable. Export JSON or copy after browser permission is enabled.');
    }
  };
  const clear = () => {
    if (window.confirm('Clear local Revenue Ledger entries?')) {
      setEntries([]);
      window.localStorage.removeItem(REVENUE_LEDGER_STORAGE_KEY);
      setStatus('Revenue Ledger cleared locally; only its localStorage entry was removed.');
    }
  };

  return (
    <section
      data-testid="gxeon-revenue-ledger-container"
      className="my-3 rounded-2xl border border-[#d9a441]/20 bg-[#05060a] p-3"
      id="revenue-ledger"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d9a441]">Revenue Ledger MVP</span>
          <h3 className="text-base font-black text-white">Local revenue hypotheses + manual confirmations</h3>
        </span>
        <span className="rounded-full border border-[#d9a441]/25 px-2 py-1 text-[10px] text-[#d9a441]">
          {isOpen ? 'Close' : 'Open'}
        </span>
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3">
          <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2 text-xs text-amber-100">
            operator_confirmed is manual evidence only, not payment processor settlement. This is not financial advice
            or tax documentation. Check banks, dashboards and processors outside this MVP.
          </p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ['Planned', summary.plannedTotal],
              ['Confirmed', summary.operatorConfirmedTotal],
              ['Costs', summary.estimatedCostTotal],
              ['Net', summary.netEstimateTotal],
              ['Pending', summary.pendingManualConfirmation],
              ['Lost/Cancelled', summary.lostOrCancelled],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-black/30 p-2">
                <p className="text-[10px] uppercase text-white/45">{label}</p>
                <p className="text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <input
              className={fieldClass}
              placeholder="Product name"
              value={form.productName}
              onChange={(e) => updateForm({ productName: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Pipeline item ID"
              value={form.pipelineItemId}
              onChange={(e) => updateForm({ pipelineItemId: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Source module"
              value={form.sourceModule}
              onChange={(e) => updateForm({ sourceModule: e.target.value })}
            />
            <select
              className={fieldClass}
              value={form.channel}
              onChange={(e) => updateForm({ channel: e.target.value as any })}
            >
              {REVENUE_CHANNELS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <select
              className={fieldClass}
              value={form.status}
              onChange={(e) => updateForm({ status: e.target.value as any })}
            >
              {REVENUE_LEDGER_STATUSES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <select
              className={fieldClass}
              value={form.currency}
              onChange={(e) => updateForm({ currency: e.target.value as any })}
            >
              {REVENUE_CURRENCIES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <input
              className={fieldClass}
              placeholder="Planned price"
              value={form.plannedPrice}
              onChange={(e) => updateForm({ plannedPrice: e.target.value as any })}
            />
            <input
              className={fieldClass}
              placeholder="Confirmed amount"
              value={form.manualConfirmedAmount}
              onChange={(e) => updateForm({ manualConfirmedAmount: e.target.value as any })}
            />
            <input
              className={fieldClass}
              placeholder="Estimated cost"
              value={form.estimatedCost}
              onChange={(e) => updateForm({ estimatedCost: e.target.value as any })}
            />
            <input
              className={fieldClass}
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => updateForm({ quantity: e.target.value as any })}
            />
            <input
              className={fieldClass}
              placeholder="Buyer or segment"
              value={form.buyerOrSegment}
              onChange={(e) => updateForm({ buyerOrSegment: e.target.value })}
            />
            <select
              className={fieldClass}
              value={form.proofType}
              onChange={(e) => updateForm({ proofType: e.target.value as any })}
            >
              {REVENUE_PROOF_TYPES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <textarea
              className={`${fieldClass} md:col-span-3`}
              placeholder="Offer summary"
              value={form.offerSummary}
              onChange={(e) => updateForm({ offerSummary: e.target.value })}
            />
            <textarea
              className={`${fieldClass} md:col-span-3`}
              placeholder="Proof notes"
              value={form.proofNotes}
              onChange={(e) => updateForm({ proofNotes: e.target.value })}
            />
            <textarea
              className={`${fieldClass} md:col-span-3`}
              placeholder="Risk notes"
              value={form.riskNotes}
              onChange={(e) => updateForm({ riskNotes: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Next action"
              value={form.nextAction}
              onChange={(e) => updateForm({ nextAction: e.target.value })}
            />
            <input
              className={fieldClass}
              placeholder="Operator confirmed by"
              value={form.operatorConfirmedBy}
              onChange={(e) => updateForm({ operatorConfirmedBy: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button data-testid="gxeon-revenue-ledger-add-entry" className={fieldClass} onClick={() => addEntry()}>
              Add Entry
            </button>
            <button className={fieldClass} onClick={save}>
              Save Ledger
            </button>
            <button className={fieldClass} onClick={load}>
              Load Ledger
            </button>
            <button className={fieldClass} onClick={exportJson}>
              Export JSON
            </button>
            <button className={fieldClass} onClick={copyMarkdown}>
              Copy Markdown
            </button>
            <button className={fieldClass} onClick={clear}>
              Clear Ledger
            </button>
            {imports.map((item) => (
              <button key={item.key} className={fieldClass} onClick={() => importFrom(item.key, item.sourceModule)}>
                Import {item.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/55">{status}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-white/10 bg-black/30 p-2 text-xs text-white/65"
              >
                <div className="flex items-start justify-between gap-2">
                  <strong className="text-white">{entry.productName}</strong>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete local revenue entry?')) {
                        setEntries((cur) => cur.filter((e) => e.id !== entry.id));
                      }
                    }}
                    className="text-red-300"
                  >
                    Delete
                  </button>
                </div>
                <p>
                  {entry.currency} planned {entry.plannedPrice} x {entry.quantity} • confirmed{' '}
                  {entry.manualConfirmedAmount} • net {entry.netEstimate}
                </p>
                <p>
                  Channel: {entry.channel} • Proof: {entry.proofType}
                </p>
                <div className="mt-2 flex gap-2">
                  <select
                    className={fieldClass}
                    value={entry.status}
                    onChange={(e) => updateEntry(entry.id, { status: e.target.value as RevenueLedgerStatus })}
                  >
                    {REVENUE_LEDGER_STATUSES.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <select
                    className={fieldClass}
                    value={entry.proofType}
                    onChange={(e) => updateEntry(entry.id, { proofType: e.target.value as RevenueProofType })}
                  >
                    {REVENUE_PROOF_TYPES.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-2">Next: {entry.nextAction}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
