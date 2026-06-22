import React, { useMemo, useState } from 'react';
import {
  APPROVAL_LEDGER_STORAGE_KEY,
  LEDGER_ITEM_STATUSES,
  LEDGER_ITEM_TYPES,
  LEDGER_RISK_LEVELS,
  buildApprovalLedgerMarkdown,
  createLedgerEntry,
  normalizeLedgerEntry,
  stringifyApprovalLedgerJson,
  summarizeLedgerEntries,
  type ApprovalLedgerEntry,
  type LedgerItemStatus,
} from '~/lib/gxeon/approvalLedger';
import { PRODUCT_BUILDER_STORAGE_KEY } from '~/lib/gxeon/productBuilder';
import { MARKETPLACE_PACK_STORAGE_KEY } from '~/lib/gxeon/marketplacePack';
import { CHECKOUT_BLUEPRINT_STORAGE_KEY } from '~/lib/gxeon/checkoutBlueprint';
import { LANDING_BUILDER_STORAGE_KEY } from '~/lib/gxeon/landingBuilder';
import { CONTENT_FACTORY_STORAGE_KEY } from '~/lib/gxeon/contentFactory';
import { INTEGRATION_READINESS_STORAGE_KEY } from '~/lib/gxeon/integrationReadiness';

const checkpointModules = [
  { label: 'Product Builder', key: PRODUCT_BUILDER_STORAGE_KEY, type: 'product_blueprint' as const },
  { label: 'Marketplace Pack', key: MARKETPLACE_PACK_STORAGE_KEY, type: 'marketplace_pack' as const },
  { label: 'Checkout Blueprint', key: CHECKOUT_BLUEPRINT_STORAGE_KEY, type: 'checkout_blueprint' as const },
  { label: 'Landing Builder', key: LANDING_BUILDER_STORAGE_KEY, type: 'landing_blueprint' as const },
  { label: 'Content Factory', key: CONTENT_FACTORY_STORAGE_KEY, type: 'content_pack' as const },
  { label: 'Integration Readiness', key: INTEGRATION_READINESS_STORAGE_KEY, type: 'integration_readiness' as const },
];

const emptyForm = () =>
  createLedgerEntry({
    productName: '',
    summary: '',
    sourceModule: 'Manual operator entry',
    riskLevel: 'medium',
    approvalRequired: true,
  });

function compactDraftSummary(draft: Record<string, unknown>) {
  const productName = String(draft.idea || draft.sourceProductIdea || draft.productName || 'Checkpoint sem nome');
  const parts = [
    'niche',
    'sourceNiche',
    'targetAudience',
    'sourceAudience',
    'basePrice',
    'desiredPrice',
    'integrationGoal',
    'campaignGoal',
  ]
    .map((key) => (draft[key] ? `${key}: ${String(draft[key]).slice(0, 90)}` : ''))
    .filter(Boolean);

  return {
    productName,
    summary: parts.join(' | ') || 'Local draft found; compact checkpoint created without full markdown or secrets.',
  };
}

export function ApprovalLedgerMvp() {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<ApprovalLedgerEntry[]>([]);
  const [form, setForm] = useState<ApprovalLedgerEntry>(() => emptyForm());
  const [status, setStatus] = useState(
    'Approval Ledger local-only: nenhum banco, API, pagamento, webhook, n8n ou publicação.',
  );
  const summary = useMemo(() => summarizeLedgerEntries(entries), [entries]);
  const updateForm = (patch: Partial<ApprovalLedgerEntry>) =>
    setForm((current) => normalizeLedgerEntry({ ...current, ...patch }));
  const addEntry = (entry: Partial<ApprovalLedgerEntry> = form) => {
    setEntries((current) => [createLedgerEntry(entry), ...current]);
    setForm(emptyForm());
    setStatus('Entrada adicionada localmente; salve para persistir no localStorage do navegador.');
  };
  const saveLedger = () => {
    localStorage.setItem(APPROVAL_LEDGER_STORAGE_KEY, JSON.stringify(entries));
    setStatus('Ledger salvo somente no localStorage deste navegador.');
  };
  const loadLedger = () => {
    const raw = localStorage.getItem(APPROVAL_LEDGER_STORAGE_KEY);

    if (!raw) {
      setStatus('Nenhum ledger local salvo encontrado.');
      return;
    }

    const parsed = JSON.parse(raw) as Partial<ApprovalLedgerEntry>[];
    setEntries(parsed.map((entry) => normalizeLedgerEntry(entry)));
    setStatus('Ledger carregado localmente; nenhuma rede foi acionada.');
  };
  const exportJson = () => {
    const blob = new Blob([stringifyApprovalLedgerJson(entries)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gxeon-approval-ledger-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exportado via download do navegador, sem envio externo.');
  };
  const copyMarkdown = async () => {
    const markdown = buildApprovalLedgerMarkdown(entries);

    try {
      await navigator.clipboard.writeText(markdown);
      setStatus('Markdown copiado para a área de transferência.');
    } catch {
      setStatus(
        `Clipboard indisponível. Markdown gerado com ${markdown.length} caracteres para copiar manualmente via exportação.`,
      );
    }
  };
  const clearLedger = () => {
    if (confirm('Limpar ledger local desta tela?')) {
      setEntries([]);
      localStorage.removeItem(APPROVAL_LEDGER_STORAGE_KEY);
      setStatus('Ledger local limpo após confirmação humana.');
    }
  };
  const importCheckpoint = (checkpoint: (typeof checkpointModules)[number]) => {
    const raw = localStorage.getItem(checkpoint.key);

    if (!raw) {
      setStatus(`Nenhum draft local encontrado para ${checkpoint.label}.`);
      return;
    }

    const draft = JSON.parse(raw) as Record<string, unknown>;
    const compact = compactDraftSummary(draft);
    addEntry({
      type: checkpoint.type,
      status: checkpoint.type === 'integration_readiness' ? 'needs_review' : 'generated',
      productName: compact.productName,
      summary: compact.summary,
      sourceModule: checkpoint.label,
      riskLevel: checkpoint.type === 'integration_readiness' ? 'high' : 'medium',
      approvalRequired: true,
      nextAction: 'Operador deve revisar evidências, riscos e aprovar manualmente antes de ativação real.',
    });
  };
  const setEntryStatus = (id: string, nextStatus: LedgerItemStatus) =>
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? normalizeLedgerEntry({ ...entry, status: nextStatus }) : entry)),
    );
  const deleteEntry = (id: string) => {
    if (confirm('Excluir esta entrada local do ledger?')) {
      setEntries((current) => current.filter((entry) => entry.id !== id));
    }
  };

  return (
    <section className="my-3 rounded-2xl border border-[#d9a441]/25 bg-[#05060a] p-3 text-white shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a441]">
            Approval & Operations Ledger
          </span>
          <br />
          <span className="text-sm font-black">Local-only human approval record</span>
        </span>
        <span className="rounded-full border border-[#d9a441]/30 px-2 py-1 text-xs text-[#d9a441]">
          {isOpen ? 'Fechar' : 'Abrir'}
        </span>
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3 text-xs">
          <p className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-2 text-amber-100">
            Registro operacional somente local; não é aconselhamento legal, fiscal, financeiro ou aprovação automática.
            Entradas com risco alto exigem revisão humana.
          </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {Object.entries(summary).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-black/35 p-2">
                <div className="text-white/45">{k}</div>
                <div className="text-lg font-black text-[#d9a441]">{v}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {(
              [
                'productName',
                'summary',
                'sourceModule',
                'approvedBy',
                'approvalNotes',
                'evidenceNotes',
                'nextAction',
              ] as const
            ).map((field) => (
              <input
                key={field}
                value={form[field]}
                onChange={(e) => updateForm({ [field]: e.target.value })}
                placeholder={field}
                className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-white"
              />
            ))}
            <select
              value={form.type}
              onChange={(e) => updateForm({ type: e.target.value as ApprovalLedgerEntry['type'] })}
              className="rounded-lg border border-white/10 bg-black/40 px-2 py-2"
            >
              {LEDGER_ITEM_TYPES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) => updateForm({ status: e.target.value as LedgerItemStatus })}
              className="rounded-lg border border-white/10 bg-black/40 px-2 py-2"
            >
              {LEDGER_ITEM_STATUSES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              value={form.riskLevel}
              onChange={(e) =>
                updateForm({
                  riskLevel: e.target.value as ApprovalLedgerEntry['riskLevel'],
                  status: e.target.value === 'high' ? 'needs_review' : form.status,
                })
              }
              className="rounded-lg border border-white/10 bg-black/40 px-2 py-2"
            >
              {LEDGER_RISK_LEVELS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-2 py-2">
              <input
                type="checkbox"
                checked={form.approvalRequired}
                onChange={(e) => updateForm({ approvalRequired: e.target.checked })}
              />{' '}
              approvalRequired
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addEntry()} className="rounded-full bg-[#d9a441] px-3 py-1.5 font-bold text-black">
              Add Entry
            </button>
            {[
              ['Save Ledger', saveLedger],
              ['Load Ledger', loadLedger],
              ['Export JSON', exportJson],
              ['Copy Markdown', copyMarkdown],
              ['Clear Ledger', clearLedger],
            ].map(([label, fn]) => (
              <button
                key={label as string}
                onClick={fn as () => void}
                className="rounded-full border border-[#d9a441]/30 px-3 py-1.5 text-[#d9a441]"
              >
                {label as string}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {checkpointModules.map((checkpoint) => (
              <button
                key={checkpoint.key}
                onClick={() => importCheckpoint(checkpoint)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/70"
              >
                Import {checkpoint.label}
              </button>
            ))}
          </div>
          <p className="text-white/55">{status}</p>
          <div className="space-y-2">
            {entries.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-white/10 bg-black/35 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-white">{entry.productName}</h3>
                    <p className="text-white/55">
                      {entry.type} • {entry.sourceModule} • risk {entry.riskLevel}
                    </p>
                  </div>
                  <select
                    value={entry.status}
                    onChange={(e) => setEntryStatus(entry.id, e.target.value as LedgerItemStatus)}
                    className="rounded-lg bg-black px-2 py-1"
                  >
                    {LEDGER_ITEM_STATUSES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-white/70">{entry.summary}</p>
                {entry.approvalRequired && (
                  <p className="mt-2 text-amber-200">Human approval required before any real-world activation.</p>
                )}
                <button onClick={() => deleteEntry(entry.id)} className="mt-2 text-red-300">
                  Delete local entry
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
