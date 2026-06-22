import React, { useMemo, useState } from 'react';
import {
  CHECKOUT_BLUEPRINT_DRAFT_STORAGE_KEY,
  CTA_MODES,
  LANDING_BUILDER_STORAGE_KEY,
  LANDING_GOALS,
  MARKETPLACE_PACK_DRAFT_STORAGE_KEY,
  PAGE_STYLES,
  PRODUCT_BUILDER_DRAFT_STORAGE_KEY,
  buildLandingBuilderJson,
  buildLandingBuilderMarkdown,
  buildLandingBuilderOutput,
  buildLandingBuilderPrompt,
  createEmptyLandingBuilderDraft,
  normalizeLandingBuilderDraft,
  stringifyLandingBuilderJson,
  validateLandingBuilderDraft,
  type LandingBuilderDraft,
} from '~/lib/gxeon/landingBuilder';

interface Props {
  setPrompt: (prompt: string) => void;
}

const GOAL_LABELS = {
  waitlist: 'Lista de espera',
  validation: 'Validação',
  sales_page: 'Página de venda',
  lead_capture: 'Captura de leads',
  presale: 'Pré-venda manual',
  internal: 'Interno',
};
const STYLE_LABELS = {
  premium: 'Premium',
  direct: 'Direto',
  institutional: 'Institucional',
  minimal: 'Minimal',
  bold: 'Bold',
  technical: 'Técnico',
};
const CTA_LABELS = {
  manual_contact: 'Contato manual',
  waitlist: 'Waitlist',
  request_access: 'Solicitar acesso',
  checkout_later: 'Checkout depois',
  download_preview: 'Download preview',
};

export function LandingBuilderMvp({ setPrompt }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<LandingBuilderDraft>(() => createEmptyLandingBuilderDraft());
  const [status, setStatus] = useState(
    'Landing Builder local: gera blueprint, prompt, Markdown e JSON sem deploy, checkout ou APIs.',
  );
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [allowSparse, setAllowSparse] = useState(false);
  const normalizedDraft = useMemo(() => normalizeLandingBuilderDraft(draft, draft.updatedAt), [draft]);
  const landing = useMemo(
    () => (generatedAt ? buildLandingBuilderOutput(normalizedDraft) : null),
    [generatedAt, normalizedDraft],
  );
  const prompt = useMemo(
    () => (generatedAt ? buildLandingBuilderPrompt(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );
  const markdown = useMemo(
    () => (generatedAt ? buildLandingBuilderMarkdown(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );
  const updateDraft = (patch: Partial<LandingBuilderDraft>) =>
    setDraft((current) => normalizeLandingBuilderDraft({ ...current, ...patch }, new Date().toISOString()));
  const togglePlatform = (platform: string) =>
    updateDraft({
      selectedPlatforms: normalizedDraft.selectedPlatforms.includes(platform)
        ? normalizedDraft.selectedPlatforms.filter((p) => p !== platform)
        : [...normalizedDraft.selectedPlatforms, platform],
    });
  const copyText = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(message);
    } catch {
      setStatus('Clipboard indisponível. Copie manualmente pela prévia.');
    }
  };
  const generate = () => {
    const validation = validateLandingBuilderDraft(normalizedDraft);

    if (!validation.isStrongLandingBuilderReady && !allowSparse) {
      setAllowSparse(true);
      setStatus(
        `Campos recomendados pendentes: ${validation.missingRecommendedFields.join(', ')}. Clique novamente para gerar fallback seguro.`,
      );

      return;
    }

    setDraft(normalizedDraft);
    setGeneratedAt(new Date().toISOString());
    setAllowSparse(false);
    setStatus('Landing Blueprint gerado localmente. Nada foi publicado, enviado ou cobrado.');
  };
  const sendToComposer = () => {
    setPrompt(prompt || buildLandingBuilderPrompt(normalizedDraft));
    setStatus('Prompt enviado ao Composer real. Revise e envie manualmente; nada foi auto-enviado.');
  };
  const saveDraft = () => {
    localStorage.setItem(LANDING_BUILDER_STORAGE_KEY, JSON.stringify(normalizedDraft));
    setStatus('Rascunho salvo apenas no localStorage do navegador.');
  };
  const loadDraft = () => {
    const stored = localStorage.getItem(LANDING_BUILDER_STORAGE_KEY);

    if (!stored) {
      setStatus('Nenhum rascunho local encontrado.');
      return;
    }

    setDraft(normalizeLandingBuilderDraft(JSON.parse(stored), new Date().toISOString()));
    setStatus('Rascunho local carregado por ação explícita.');
  };
  const importStored = (key: string, mapper: (value: any) => Partial<LandingBuilderDraft>, label: string) => {
    const stored = localStorage.getItem(key);

    if (!stored) {
      setStatus(`Nenhum rascunho local de ${label} encontrado.`);
      return;
    }

    const value = JSON.parse(stored);
    updateDraft(mapper(value));
    setStatus(`${label} importado localmente por clique explícito. Revise antes de gerar.`);
  };
  const exportJson = () => {
    const blob = new Blob([stringifyLandingBuilderJson(normalizedDraft)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gxeon-landing-builder-blueprint.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exportado por download local.');
  };
  const clear = () => {
    setDraft(createEmptyLandingBuilderDraft());
    setGeneratedAt(null);
    setAllowSparse(false);
    setStatus('Formulário limpo. Nenhum servidor foi alterado.');
  };
  const platformOptions = [
    'Hotmart',
    'Kiwify',
    'Gumroad',
    'Shopify',
    'Landing Page',
    'WhatsApp',
    'Email',
    'Marketplace manual',
  ];

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-[#d9a441]/25 bg-[linear-gradient(135deg,#05060a_0%,#120f07_65%,#1b1204_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-[#d9a441]/15 bg-black/25 p-3 text-left"
        aria-expanded={isOpen}
      >
        <span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a441]">
            Landing Builder MVP
          </span>
          <span className="block text-sm font-black text-white">
            Sales page blueprint local — sem deploy, checkout ou APIs
          </span>
        </span>
        <span className="rounded-full border border-[#d9a441]/30 px-2 py-1 text-[10px] text-[#d9a441]">
          {isOpen ? 'Recolher' : 'Abrir'}
        </span>
      </button>
      {isOpen && (
        <div className="space-y-3 p-3">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-xs leading-5 text-white/62">
            Módulo manual-first: importa rascunhos locais somente por botão, gera preview/export local e não publica
            página, não cria checkout, não cobra e não chama API externa. Rascunho:{' '}
            <code>{LANDING_BUILDER_STORAGE_KEY}</code>.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <Field
              label="Ideia do produto"
              value={draft.sourceProductIdea}
              onChange={(sourceProductIdea) => updateDraft({ sourceProductIdea })}
            />
            <Field label="Nicho" value={draft.sourceNiche} onChange={(sourceNiche) => updateDraft({ sourceNiche })} />
            <Field
              label="Público"
              value={draft.sourceAudience}
              onChange={(sourceAudience) => updateDraft({ sourceAudience })}
            />
            <Field
              label="Problema"
              value={draft.sourceProblem}
              onChange={(sourceProblem) => updateDraft({ sourceProblem })}
            />
            <Field label="Oferta" value={draft.sourceOffer} onChange={(sourceOffer) => updateDraft({ sourceOffer })} />
            <Field
              label="Promessa"
              value={draft.sourcePromise}
              onChange={(sourcePromise) => updateDraft({ sourcePromise })}
            />
            <Field label="Preço-base" value={draft.basePrice} onChange={(basePrice) => updateDraft({ basePrice })} />
            <Field
              label="Formato de entrega"
              value={draft.deliveryFormat}
              onChange={(deliveryFormat) => updateDraft({ deliveryFormat })}
            />
            <Select
              label="Objetivo da landing"
              value={draft.landingGoal}
              onChange={(landingGoal) => updateDraft({ landingGoal })}
              options={LANDING_GOALS}
              labels={GOAL_LABELS}
            />
            <Select
              label="Estilo"
              value={draft.pageStyle}
              onChange={(pageStyle) => updateDraft({ pageStyle })}
              options={PAGE_STYLES}
              labels={STYLE_LABELS}
            />
            <Select
              label="CTA"
              value={draft.ctaMode}
              onChange={(ctaMode) => updateDraft({ ctaMode })}
              options={CTA_MODES}
              labels={CTA_LABELS}
            />
          </div>
          <fieldset className="rounded-xl border border-white/10 p-2">
            <legend className="px-1 text-xs font-semibold text-white/70">Plataformas selecionadas</legend>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs text-white/65"
                >
                  <input
                    type="checkbox"
                    checked={normalizedDraft.selectedPlatforms.includes(p)}
                    onChange={() => togglePlatform(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </fieldset>
          <Area
            label="Notas de prova"
            value={draft.proofNotes}
            onChange={(proofNotes) => updateDraft({ proofNotes })}
          />
          <Area
            label="Notas de aprovação"
            value={draft.approvalNotes}
            onChange={(approvalNotes) => updateDraft({ approvalNotes })}
          />
          <div className="flex flex-wrap gap-2">
            <Action onClick={generate}>Gerar Landing Blueprint</Action>
            <Action onClick={sendToComposer}>Enviar para Composer</Action>
            <Action
              onClick={() => void copyText(prompt || buildLandingBuilderPrompt(normalizedDraft), 'Prompt copiado.')}
            >
              Copiar Prompt
            </Action>
            <Action
              onClick={() =>
                void copyText(markdown || buildLandingBuilderMarkdown(normalizedDraft), 'Markdown copiado.')
              }
            >
              Copiar Markdown
            </Action>
            <Action onClick={exportJson}>Exportar JSON</Action>
            <Action onClick={saveDraft}>Salvar Rascunho</Action>
            <Action onClick={loadDraft}>Carregar Rascunho</Action>
            <Action
              onClick={() =>
                importStored(
                  PRODUCT_BUILDER_DRAFT_STORAGE_KEY,
                  (v) => ({
                    sourceProductIdea: v.idea,
                    sourceNiche: v.niche,
                    sourceAudience: v.targetAudience,
                    sourceProblem: v.problem,
                    sourceOffer: v.offer,
                    sourcePromise: v.promise,
                    basePrice: v.desiredPrice,
                    deliveryFormat: v.deliveryFormat,
                    selectedPlatforms: v.channels,
                  }),
                  'Product Builder',
                )
              }
            >
              Importar Product Builder
            </Action>
            <Action
              onClick={() =>
                importStored(
                  MARKETPLACE_PACK_DRAFT_STORAGE_KEY,
                  (v) => ({
                    sourceProductIdea: v.sourceProductIdea,
                    sourceNiche: v.sourceNiche,
                    sourceAudience: v.sourceAudience,
                    sourceProblem: v.sourceProblem,
                    sourceOffer: v.sourceOffer,
                    sourcePromise: v.sourcePromise,
                    basePrice: v.sourcePrice,
                    deliveryFormat: v.deliveryFormat,
                    selectedPlatforms: v.selectedPlatforms,
                  }),
                  'Marketplace Pack',
                )
              }
            >
              Importar Marketplace Pack
            </Action>
            <Action
              onClick={() =>
                importStored(
                  CHECKOUT_BLUEPRINT_DRAFT_STORAGE_KEY,
                  (v) => ({
                    sourceProductIdea: v.sourceProductIdea,
                    sourceNiche: v.sourceNiche,
                    sourceAudience: v.sourceAudience,
                    sourceProblem: v.sourceProblem,
                    sourceOffer: v.sourceOffer,
                    sourcePromise: v.sourcePromise,
                    basePrice: v.basePrice,
                    deliveryFormat: v.deliveryFormat,
                    selectedPlatforms: v.selectedPlatforms,
                  }),
                  'Checkout Blueprint',
                )
              }
            >
              Importar Checkout Blueprint
            </Action>
            <Action onClick={clear}>Limpar</Action>
          </div>
          <p className="text-xs text-[#d9a441]" role="status">
            {status}
          </p>
          {landing && (
            <div className="rounded-xl border border-[#d9a441]/20 bg-[#07080d] p-3 text-xs text-white/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-white">Prévia da Landing Blueprint</h3>
                <span className="rounded-full border border-[#d9a441]/25 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  Prévia local — não publicada
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Preview title="Hero" lines={landing.hero} />
                <Preview title="CTA" lines={landing.ctaCopy} />
                <Preview title="FAQ" lines={landing.faq} />
                <Preview title="Prova" lines={landing.proofPlaceholders} />
                <Preview title="Seções" lines={landing.pageSections.map((s) => `${s.section}: ${s.purpose}`)} />
                <Preview title="Riscos" lines={landing.riskWarnings} />
              </div>
              <details className="mt-3 rounded-lg border border-white/10 bg-black/35 p-2">
                <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  JSON local e prompt
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-black/45 p-2 text-[11px] text-white/62">
                  {JSON.stringify(buildLandingBuilderJson(normalizedDraft), null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-xs font-semibold text-white/70">
      {label}
      <input
        className="mt-1 w-full rounded-xl border border-white/10 bg-[#07080d] px-3 py-2 text-white placeholder:text-white/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs font-semibold text-white/70">
      {label}
      <textarea
        className="mt-1 min-h-16 w-full rounded-xl border border-white/10 bg-[#07080d] px-3 py-2 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  labels: Record<T, string>;
}) {
  return (
    <label className="text-xs font-semibold text-white/70">
      {label}
      <select
        className="mt-1 w-full rounded-xl border border-white/10 bg-[#07080d] px-3 py-2 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o]}
          </option>
        ))}
      </select>
    </label>
  );
}

function Action({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-[#d9a441]/25 bg-[#d9a441]/10 px-3 py-1.5 text-xs font-semibold text-[#f4d084] transition-theme hover:bg-[#d9a441]/20"
    >
      {children}
    </button>
  );
}

function Preview({ title, lines }: { title: string; lines: string[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-black/25 p-2">
      <h4 className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">{title}</h4>
      <ul className="list-disc space-y-1 pl-4">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
