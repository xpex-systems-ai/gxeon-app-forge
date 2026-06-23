import React, { useMemo, useState } from 'react';
import {
  CHECKOUT_BLUEPRINT_DRAFT_STORAGE_KEY,
  CTA_MODES,
  CONTENT_FACTORY_STORAGE_KEY,
  LANDING_BUILDER_STORAGE_KEY,
  LANDING_GOALS,
  CAMPAIGN_GOALS,
  CONTENT_CHANNELS,
  POSTING_CADENCES,
  MARKETPLACE_PACK_DRAFT_STORAGE_KEY,
  CAMPAIGN_TONES,
  PRODUCT_BUILDER_DRAFT_STORAGE_KEY,
  buildContentFactoryJson,
  buildContentFactoryMarkdown,
  buildContentFactoryOutput,
  buildContentFactoryPrompt,
  createEmptyContentFactoryDraft,
  normalizeContentFactoryDraft,
  stringifyContentFactoryJson,
  validateContentFactoryDraft,
  type ContentFactoryDraft,
} from '~/lib/gxeon/contentFactory';

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
const TONE_LABELS = {
  premium: 'Premium',
  direct: 'Direto',
  institutional: 'Institucional',
  technical: 'Técnico',
  popular: 'Popular',
  story: 'Story',
  authority: 'Autoridade',
};
const CAMPAIGN_GOAL_LABELS = {
  awareness: 'Awareness',
  validation: 'Validação',
  waitlist: 'Waitlist',
  launch: 'Lançamento',
  presale: 'Pré-venda',
  nurture: 'Nutrição',
  retargeting: 'Retargeting',
  internal: 'Interno',
};
const CADENCE_LABELS = { '3_days': '3 dias', '7_days': '7 dias', '14_days': '14 dias', '30_days': '30 dias' };
const CTA_LABELS = {
  manual_contact: 'Contato manual',
  waitlist: 'Waitlist',
  request_access: 'Solicitar acesso',
  checkout_later: 'Checkout depois',
  download_preview: 'Download preview',
};

export function ContentFactoryMvp({ setPrompt }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ContentFactoryDraft>(() => createEmptyContentFactoryDraft());
  const [status, setStatus] = useState(
    'Content Factory local: gera posts, emails, roteiros, prompt, Markdown e JSON sem postagem, envio ou APIs.',
  );
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [allowSparse, setAllowSparse] = useState(false);
  const normalizedDraft = useMemo(() => normalizeContentFactoryDraft(draft, draft.updatedAt), [draft]);
  const content = useMemo(
    () => (generatedAt ? buildContentFactoryOutput(normalizedDraft) : null),
    [generatedAt, normalizedDraft],
  );
  const prompt = useMemo(
    () => (generatedAt ? buildContentFactoryPrompt(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );
  const markdown = useMemo(
    () => (generatedAt ? buildContentFactoryMarkdown(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );
  const updateDraft = (patch: Partial<ContentFactoryDraft>) =>
    setDraft((current) => normalizeContentFactoryDraft({ ...current, ...patch }, new Date().toISOString()));
  const togglePlatform = (platform: string) =>
    updateDraft({
      selectedPlatforms: normalizedDraft.selectedPlatforms.includes(platform)
        ? normalizedDraft.selectedPlatforms.filter((p) => p !== platform)
        : [...normalizedDraft.selectedPlatforms, platform],
    });
  const toggleChannel = (channel: string) =>
    updateDraft({
      contentChannels: normalizedDraft.contentChannels.includes(channel)
        ? normalizedDraft.contentChannels.filter((p) => p !== channel)
        : [...normalizedDraft.contentChannels, channel],
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
    const validation = validateContentFactoryDraft(normalizedDraft);

    if (!validation.isStrongContentFactoryReady && !allowSparse) {
      setAllowSparse(true);
      setStatus(
        `Campos recomendados pendentes: ${validation.missingRecommendedFields.join(', ')}. Clique novamente para gerar fallback seguro.`,
      );

      return;
    }

    setDraft(normalizedDraft);
    setGeneratedAt(new Date().toISOString());
    setAllowSparse(false);
    setStatus('Content Pack gerado localmente. Nada foi postado, enviado, agendado, impulsionado ou publicado.');
  };
  const sendToComposer = () => {
    setPrompt(prompt || buildContentFactoryPrompt(normalizedDraft));
    setStatus('Prompt enviado ao Composer real. Revise e envie manualmente; nada foi auto-enviado.');
  };
  const saveDraft = () => {
    localStorage.setItem(CONTENT_FACTORY_STORAGE_KEY, JSON.stringify(normalizedDraft));
    setStatus('Rascunho salvo apenas no localStorage do navegador.');
  };
  const loadDraft = () => {
    const stored = localStorage.getItem(CONTENT_FACTORY_STORAGE_KEY);

    if (!stored) {
      setStatus('Nenhum rascunho local encontrado.');
      return;
    }

    setDraft(normalizeContentFactoryDraft(JSON.parse(stored), new Date().toISOString()));
    setStatus('Rascunho local carregado por ação explícita.');
  };
  const importStored = (key: string, mapper: (value: any) => Partial<ContentFactoryDraft>, label: string) => {
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
    const blob = new Blob([stringifyContentFactoryJson(normalizedDraft)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gxeon-content-factory-pack.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exportado por download local.');
  };
  const clear = () => {
    setDraft(createEmptyContentFactoryDraft());
    setGeneratedAt(null);
    setAllowSparse(false);
    setStatus('Formulário limpo. Nenhum servidor foi alterado.');
  };
  const platformOptions = [
    'Hotmart',
    'Kiwify',
    'Gumroad',
    'Shopify',
    'Content Page',
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
            Content Factory MVP
          </span>
          <span className="block text-sm font-black text-white">
            Content and launch pack local — sem postagem, envio ou APIs
          </span>
        </span>
        <span className="rounded-full border border-[#d9a441]/30 px-2 py-1 text-[10px] text-[#d9a441]">
          {isOpen ? 'Recolher' : 'Abrir'}
        </span>
      </button>
      {isOpen && (
        <div className="space-y-3 p-3">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-xs leading-5 text-white/62">
            Módulo manual-first: importa rascunhos locais somente por botão, gera preview/export local e não posta, não
            envia email/WhatsApp, não cria anúncios e não chama API externa. Rascunho:{' '}
            <code>{CONTENT_FACTORY_STORAGE_KEY}</code>.
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
              label="Objetivo da campanha"
              value={draft.campaignGoal}
              onChange={(campaignGoal) => updateDraft({ campaignGoal })}
              options={CAMPAIGN_GOALS}
              labels={CAMPAIGN_GOAL_LABELS}
            />
            <Select
              label="Tom da campanha"
              value={draft.campaignTone}
              onChange={(campaignTone) => updateDraft({ campaignTone })}
              options={CAMPAIGN_TONES}
              labels={TONE_LABELS}
            />
            <Select
              label="Cadência"
              value={draft.postingCadence}
              onChange={(postingCadence) => updateDraft({ postingCadence })}
              options={POSTING_CADENCES}
              labels={CADENCE_LABELS}
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
          <fieldset className="rounded-xl border border-white/10 p-2">
            <legend className="px-1 text-xs font-semibold text-white/70">Canais de conteúdo</legend>
            <div className="flex flex-wrap gap-2">
              {CONTENT_CHANNELS.map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs text-white/65"
                >
                  <input
                    type="checkbox"
                    checked={normalizedDraft.contentChannels.includes(p)}
                    onChange={() => toggleChannel(p)}
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
            <Action onClick={generate}>Gerar Content Pack</Action>
            <Action onClick={sendToComposer}>Enviar para Composer</Action>
            <Action
              onClick={() => void copyText(prompt || buildContentFactoryPrompt(normalizedDraft), 'Prompt copiado.')}
            >
              Copiar Prompt
            </Action>
            <Action
              onClick={() =>
                void copyText(markdown || buildContentFactoryMarkdown(normalizedDraft), 'Markdown copiado.')
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
                    contentChannels: v.channels,
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
            <Action
              onClick={() =>
                importStored(
                  LANDING_BUILDER_STORAGE_KEY,
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
                    landingGoal: v.landingGoal,
                    ctaMode: v.ctaMode,
                    proofNotes: v.proofNotes,
                    approvalNotes: v.approvalNotes,
                  }),
                  'Landing Builder',
                )
              }
            >
              Importar Landing Builder
            </Action>
            <Action onClick={clear}>Limpar</Action>
          </div>
          <p className="text-xs text-[#d9a441]" role="status">
            {status}
          </p>
          {content && (
            <div className="rounded-xl border border-[#d9a441]/20 bg-[#07080d] p-3 text-xs text-white/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-white">Prévia do Content Pack</h3>
                <span className="rounded-full border border-[#d9a441]/25 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  Prévia local — não enviada/publicada
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Preview title="Posicionamento" lines={content.positioning} />
                <Preview title="Ângulos" lines={content.contentAngles} />
                <Preview title="Instagram" lines={content.instagramPosts.map((s) => `${s.title}: ${s.caption}`)} />
                <Preview title="Email" lines={content.emailSequence.map((s) => `${s.subject}: ${s.cta}`)} />
                <Preview
                  title="Calendário"
                  lines={content.launchCalendar.map((s) => `${s.day}: ${s.task} (${s.status})`)}
                />
                <Preview title="Riscos" lines={content.riskWarnings} />
              </div>
              <details className="mt-3 rounded-lg border border-white/10 bg-black/35 p-2">
                <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  JSON local e prompt
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-black/45 p-2 text-[11px] text-white/62">
                  {JSON.stringify(buildContentFactoryJson(normalizedDraft), null, 2)}
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
