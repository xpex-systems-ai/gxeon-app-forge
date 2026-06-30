import React, { useMemo, useState } from 'react';
import {
  buildHotmartDistributionMarkdown,
  buildHotmartDistributionPrompt,
  createEmptyHotmartDistributionDraft,
  stringifyHotmartDistributionJson,
  validateHotmartDistributionDraft,
  type HotmartDistributionDraft,
} from '~/lib/gxeon/hotmartDistribution';

interface HotmartDistributionOsMvpProps {
  setPrompt?: (prompt: string) => void;
}

export function HotmartDistributionOsMvp({ setPrompt }: HotmartDistributionOsMvpProps) {
  const [draft, setDraft] = useState<HotmartDistributionDraft>(() => createEmptyHotmartDistributionDraft());
  const validation = useMemo(() => validateHotmartDistributionDraft(draft), [draft]);
  const updateDraft = (patch: Partial<HotmartDistributionDraft>) =>
    setDraft((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));

  return (
    <section
      className="rounded-2xl border border-[#d9a441]/20 bg-[#07080d]/92 p-3"
      data-testid="gxeon-hotmart-distribution-os"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d9a441]">APPFORGE-015</p>
          <h3 className="text-base font-black text-white">Hotmart Distribution OS</h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/60">
            Planejamento local-only para produto, kit de afiliados, assets, compliance e fila de lançamento. Não chama
            API Hotmart, não publica, não cria checkout, não processa pagamento e exige aprovação humana.
          </p>
        </div>
        <span className="rounded-full border border-[#d9a441]/25 px-2.5 py-1 text-[10px] font-bold uppercase text-[#f4d58d]">
          Manual-first
        </span>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input
          className="rounded-xl border border-white/10 bg-black/30 p-2 text-sm text-white"
          placeholder="Produto"
          value={draft.productName}
          onChange={(event) => updateDraft({ productName: event.target.value })}
        />
        <input
          className="rounded-xl border border-white/10 bg-black/30 p-2 text-sm text-white"
          placeholder="Público-alvo"
          value={draft.targetAudience}
          onChange={(event) => updateDraft({ targetAudience: event.target.value })}
        />
        <input
          className="rounded-xl border border-white/10 bg-black/30 p-2 text-sm text-white"
          placeholder="Nicho"
          value={draft.niche}
          onChange={(event) => updateDraft({ niche: event.target.value })}
        />
        <input
          className="rounded-xl border border-white/10 bg-black/30 p-2 text-sm text-white"
          placeholder="Promessa"
          value={draft.promise}
          onChange={(event) => updateDraft({ promise: event.target.value })}
        />
      </div>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <textarea
          className="min-h-20 rounded-xl border border-white/10 bg-black/30 p-2 text-sm text-white"
          placeholder="Rascunho do produto"
          value={draft.productDraft}
          onChange={(event) => updateDraft({ productDraft: event.target.value })}
        />
        <textarea
          className="min-h-20 rounded-xl border border-white/10 bg-black/30 p-2 text-sm text-white"
          placeholder="Kit de afiliados"
          value={draft.affiliateKit}
          onChange={(event) => updateDraft({ affiliateKit: event.target.value })}
        />
        <textarea
          className="min-h-20 rounded-xl border border-white/10 bg-black/30 p-2 text-sm text-white"
          placeholder="Asset pack"
          value={draft.assetPack}
          onChange={(event) => updateDraft({ assetPack: event.target.value })}
        />
        <textarea
          className="min-h-20 rounded-xl border border-white/10 bg-black/30 p-2 text-sm text-white"
          placeholder="Compliance"
          value={draft.complianceNotes}
          onChange={(event) => updateDraft({ complianceNotes: event.target.value })}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-[#d9a441]/40 px-3 py-1.5 text-xs font-bold text-[#f4d58d]"
          onClick={() => setPrompt?.(buildHotmartDistributionPrompt(draft))}
        >
          Enviar prompt manual
        </button>
        <button
          type="button"
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70"
          onClick={() => navigator.clipboard?.writeText(stringifyHotmartDistributionJson(draft))}
        >
          Copiar JSON seguro
        </button>
        <button
          type="button"
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70"
          onClick={() => navigator.clipboard?.writeText(buildHotmartDistributionMarkdown(draft))}
        >
          Copiar Markdown
        </button>
      </div>

      <p className="mt-2 text-[11px] text-white/45">
        Campos pendentes: {validation.missingRecommendedFields.join(', ') || 'nenhum'} · Ações externas bloqueadas:{' '}
        Hotmart API, autopublish, checkout, payment, webhook.
      </p>
    </section>
  );
}
