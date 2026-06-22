import React, { useMemo, useState } from 'react';
import {
  CHECKOUT_BLUEPRINT_STORAGE_KEY,
  CHECKOUT_GOALS,
  CHECKOUT_PLATFORM_LABELS,
  CHECKOUT_PLATFORMS,
  MARKETPLACE_PACK_DRAFT_STORAGE_KEY,
  PRICING_MODELS,
  PRODUCT_BUILDER_DRAFT_STORAGE_KEY,
  buildCheckoutBlueprintJson,
  buildCheckoutBlueprintMarkdown,
  buildCheckoutBlueprintOutput,
  buildCheckoutBlueprintPrompt,
  createEmptyCheckoutBlueprintDraft,
  normalizeCheckoutBlueprintDraft,
  stringifyCheckoutBlueprintJson,
  validateCheckoutBlueprintDraft,
  type CheckoutBlueprintDraft,
  type CheckoutPlatform,
} from '~/lib/gxeon/checkoutBlueprint';

interface Props {
  setPrompt: (prompt: string) => void;
}

const GOAL_LABELS: Record<(typeof CHECKOUT_GOALS)[number], string> = {
  validation: 'Validação',
  presale: 'Pré-venda',
  launch: 'Lançamento',
  evergreen: 'Evergreen',
  beta: 'Beta',
  internal: 'Interno',
};
const MODEL_LABELS: Record<(typeof PRICING_MODELS)[number], string> = {
  one_time: 'Pagamento único',
  subscription: 'Assinatura',
  installment: 'Parcelamento',
  freemium: 'Freemium',
  consultation: 'Consulta',
  hybrid: 'Híbrido',
};

export function CheckoutBlueprintMvp({ setPrompt }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<CheckoutBlueprintDraft>(() => createEmptyCheckoutBlueprintDraft());
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [allowSparse, setAllowSparse] = useState(false);
  const [status, setStatus] = useState(
    'Gere um blueprint local. Nenhum checkout real, gateway ou marketplace será acionado.',
  );
  const normalizedDraft = useMemo(() => normalizeCheckoutBlueprintDraft(draft, draft.updatedAt), [draft]);
  const blueprint = useMemo(
    () => (generatedAt ? buildCheckoutBlueprintOutput(normalizedDraft) : null),
    [generatedAt, normalizedDraft],
  );
  const prompt = useMemo(
    () => (generatedAt ? buildCheckoutBlueprintPrompt(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );
  const markdown = useMemo(
    () => (generatedAt ? buildCheckoutBlueprintMarkdown(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );
  const updateDraft = (patch: Partial<CheckoutBlueprintDraft>) =>
    setDraft((current) => normalizeCheckoutBlueprintDraft({ ...current, ...patch }, new Date().toISOString()));
  const togglePlatform = (platform: CheckoutPlatform) =>
    updateDraft({
      selectedPlatforms: normalizedDraft.selectedPlatforms.includes(platform)
        ? normalizedDraft.selectedPlatforms.filter((p) => p !== platform)
        : [...normalizedDraft.selectedPlatforms, platform],
    });
  const generate = () => {
    const validation = validateCheckoutBlueprintDraft(normalizedDraft);

    if (!validation.isStrongCheckoutBlueprintReady && !allowSparse) {
      setAllowSparse(true);
      setStatus(
        `Campos recomendados ausentes: ${validation.missingRecommendedFields.join(', ')}. Clique novamente para gerar com fallback seguro.`,
      );

      return;
    }

    setDraft(normalizedDraft);
    setGeneratedAt(new Date().toISOString());
    setAllowSparse(false);
    setStatus(
      validation.isStrongCheckoutBlueprintReady
        ? 'Checkout Blueprint gerado localmente. Nenhum pagamento, link ou API foi acionado.'
        : 'Blueprint gerado com fallback seguro. Revisão humana obrigatória.',
    );
  };
  const sendToComposer = () => {
    setPrompt(prompt || buildCheckoutBlueprintPrompt(normalizedDraft));
    setStatus('Prompt enviado ao Composer real e focado. Revise e envie manualmente; nada foi auto-enviado.');
  };
  const copyText = async (value: string, message: string) => {
    if (!navigator.clipboard?.writeText) {
      setStatus('Clipboard indisponível. Copie pelo bloco de prévia.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setStatus(message);
    } catch (error) {
      console.error('Checkout Blueprint clipboard error:', error);
      setStatus('Não foi possível copiar automaticamente. Copie manualmente.');
    }
  };
  const exportJson = () => {
    let url: string | null = null;
    let link: HTMLAnchorElement | null = null;

    try {
      const blob = new Blob([stringifyCheckoutBlueprintJson(normalizedDraft)], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      link = document.createElement('a');
      link.href = url;
      link.download = `gxeon-checkout-blueprint-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      setStatus('JSON exportado localmente. Nenhum checkout real foi criado.');
    } catch (error) {
      console.error('Checkout Blueprint export error:', error);
      setStatus('Não foi possível exportar JSON neste navegador.');
    } finally {
      link?.remove();

      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  };
  const saveDraft = () => {
    try {
      localStorage.setItem(CHECKOUT_BLUEPRINT_STORAGE_KEY, JSON.stringify(normalizedDraft));
      setStatus('Rascunho salvo apenas no navegador local.');
    } catch (error) {
      console.error('Checkout Blueprint save error:', error);
      setStatus('Não foi possível salvar o rascunho local.');
    }
  };
  const loadDraft = () => {
    try {
      const stored = localStorage.getItem(CHECKOUT_BLUEPRINT_STORAGE_KEY);

      if (!stored) {
        setStatus('Nenhum rascunho local de Checkout Blueprint encontrado.');
        return;
      }

      setDraft(normalizeCheckoutBlueprintDraft(JSON.parse(stored), new Date().toISOString()));
      setStatus('Rascunho local de Checkout Blueprint carregado.');
    } catch (error) {
      console.error('Checkout Blueprint load error:', error);
      setStatus('Rascunho local inválido ou storage indisponível.');
    }
  };
  const importProduct = () => {
    try {
      const stored = localStorage.getItem(PRODUCT_BUILDER_DRAFT_STORAGE_KEY);

      if (!stored) {
        setStatus('Nenhum rascunho local do Product Builder encontrado.');
        return;
      }

      const p = JSON.parse(stored) as Record<string, unknown>;
      updateDraft({
        sourceProductIdea: String(p.idea || ''),
        sourceNiche: String(p.niche || ''),
        sourceAudience: String(p.targetAudience || ''),
        sourceProblem: String(p.problem || ''),
        sourceOffer: String(p.offer || ''),
        sourcePromise: String(p.promise || ''),
        basePrice: String(p.desiredPrice || ''),
        deliveryFormat: String(p.deliveryFormat || ''),
        approvalNotes: 'Importado de rascunho local do Product Builder. Revisar manualmente.',
      });
      setStatus('Dados importados somente do rascunho local do Product Builder; nenhuma credencial foi lida.');
    } catch (error) {
      console.error('Checkout Product import error:', error);
      setStatus('Não foi possível importar Product Builder local.');
    }
  };
  const importMarketplace = () => {
    try {
      const stored = localStorage.getItem(MARKETPLACE_PACK_DRAFT_STORAGE_KEY);

      if (!stored) {
        setStatus('Nenhum rascunho local do Marketplace Pack encontrado.');
        return;
      }

      const p = JSON.parse(stored) as Record<string, unknown>;
      updateDraft({
        sourceProductIdea: String(p.sourceProductIdea || ''),
        sourceNiche: String(p.sourceNiche || ''),
        sourceAudience: String(p.sourceAudience || ''),
        sourceProblem: String(p.sourceProblem || ''),
        sourceOffer: String(p.sourceOffer || ''),
        sourcePromise: String(p.sourcePromise || ''),
        basePrice: String(p.sourcePrice || ''),
        deliveryFormat: String(p.deliveryFormat || ''),
        selectedPlatforms: Array.isArray(p.selectedPlatforms) ? (p.selectedPlatforms as CheckoutPlatform[]) : [],
        marketplaceCategory: String(p.mainCategory || ''),
        tone: String(p.tone || 'direct'),
        approvalNotes: 'Importado de rascunho local do Marketplace Pack. Revisar antes de qualquer checkout real.',
      });
      setStatus('Dados importados somente do rascunho local do Marketplace Pack; nenhuma API foi chamada.');
    } catch (error) {
      console.error('Checkout Marketplace import error:', error);
      setStatus('Não foi possível importar Marketplace Pack local.');
    }
  };
  const clear = () => {
    setDraft(createEmptyCheckoutBlueprintDraft());
    setGeneratedAt(null);
    setAllowSparse(false);
    setStatus('Formulário limpo. Nada foi enviado, cobrado ou persistido em servidor.');
  };

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-[#d9a441]/25 bg-[linear-gradient(135deg,#05060a_0%,#100d06_60%,#191104_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-[#d9a441]/15 bg-black/25 p-3 text-left"
        aria-expanded={isOpen}
      >
        <span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a441]">
            Checkout Blueprint MVP
          </span>
          <span className="block text-sm font-black text-white">Preço, planos, bump e pós-compra — manual-first</span>
        </span>
        <span className="rounded-full border border-[#d9a441]/30 px-2 py-1 text-[10px] text-[#d9a441]">
          {isOpen ? 'Recolher' : 'Abrir'}
        </span>
      </button>
      {isOpen && (
        <div className="space-y-3 p-3">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-xs leading-5 text-white/62">
            Módulo local: importa somente rascunhos do navegador por clique explícito, não cria link real, não ativa
            pagamentos, não chama gateways/marketplaces e não usa banco. Rascunho:{' '}
            <code>{CHECKOUT_BLUEPRINT_STORAGE_KEY}</code>.
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
            <Field
              label="Categoria marketplace"
              value={draft.marketplaceCategory}
              onChange={(marketplaceCategory) => updateDraft({ marketplaceCategory })}
            />
            <Field label="Tom" value={draft.tone} onChange={(tone) => updateDraft({ tone })} />
            <Select
              label="Objetivo"
              value={draft.checkoutGoal}
              onChange={(checkoutGoal) => updateDraft({ checkoutGoal })}
              options={CHECKOUT_GOALS}
              labels={GOAL_LABELS}
            />
            <Select
              label="Modelo de preço"
              value={draft.pricingModel}
              onChange={(pricingModel) => updateDraft({ pricingModel })}
              options={PRICING_MODELS}
              labels={MODEL_LABELS}
            />
          </div>
          <fieldset className="rounded-xl border border-white/10 p-2">
            <legend className="px-1 text-xs font-semibold text-white/70">Plataformas para notas manuais</legend>
            <div className="flex flex-wrap gap-2">
              {CHECKOUT_PLATFORMS.map((platform) => (
                <label
                  key={platform}
                  className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs text-white/65"
                >
                  <input
                    type="checkbox"
                    checked={normalizedDraft.selectedPlatforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                  />
                  {CHECKOUT_PLATFORM_LABELS[platform]}
                </label>
              ))}
            </div>
          </fieldset>
          <Area
            label="Política de garantia/reembolso"
            value={draft.guaranteePolicy}
            onChange={(guaranteePolicy) => updateDraft({ guaranteePolicy })}
          />
          <Area
            label="Modelo de suporte/onboarding"
            value={draft.supportModel}
            onChange={(supportModel) => updateDraft({ supportModel })}
          />
          <Area
            label="Notas de aprovação humana"
            value={draft.approvalNotes}
            onChange={(approvalNotes) => updateDraft({ approvalNotes })}
          />
          <div className="flex flex-wrap gap-2">
            <Action onClick={generate}>Gerar Checkout Blueprint</Action>
            <Action onClick={sendToComposer}>Enviar para Composer</Action>
            <Action
              onClick={() =>
                void copyText(
                  prompt || buildCheckoutBlueprintPrompt(normalizedDraft),
                  'Prompt copiado para envio manual.',
                )
              }
            >
              Copiar Prompt
            </Action>
            <Action
              onClick={() =>
                void copyText(
                  markdown || buildCheckoutBlueprintMarkdown(normalizedDraft),
                  'Markdown copiado para revisão manual.',
                )
              }
            >
              Copiar Markdown
            </Action>
            <Action onClick={exportJson}>Exportar JSON</Action>
            <Action onClick={saveDraft}>Salvar Rascunho</Action>
            <Action onClick={loadDraft}>Carregar Rascunho</Action>
            <Action onClick={importProduct}>Usar rascunho local do Product Builder</Action>
            <Action onClick={importMarketplace}>Usar rascunho local do Marketplace Pack</Action>
            <Action onClick={clear}>Limpar</Action>
          </div>
          <p className="text-xs text-[#d9a441]" role="status">
            {status}
          </p>
          {blueprint && (
            <div className="rounded-xl border border-[#d9a441]/20 bg-[#07080d] p-3 text-xs text-white/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-white">Prévia do Checkout Blueprint</h3>
                <span className="rounded-full border border-[#d9a441]/25 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  Prévia local — sem checkout real
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Preview title="Preço" lines={blueprint.pricingHypothesis} />
                <Preview
                  title="Planos"
                  lines={blueprint.plans.map((p) => `${p.name}: ${p.price} — ${p.positioning}`)}
                />
                <Preview title="Order bumps" lines={blueprint.orderBumps} />
                <Preview title="Upsells" lines={blueprint.upsells} />
                <Preview title="Downsells" lines={blueprint.downsells} />
                <Preview title="Thank-you page" lines={blueprint.thankYouPage} />
                <Preview title="Garantia" lines={blueprint.guaranteeAndRefund} />
                <Preview
                  title="Aprovação e riscos"
                  lines={[...blueprint.humanApprovalChecklist, ...blueprint.riskWarnings]}
                />
              </div>
              <details className="mt-3 rounded-lg border border-white/10 bg-black/35 p-2">
                <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  JSON local e prompt copiável
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-black/45 p-2 text-[11px] text-white/62">
                  {JSON.stringify(buildCheckoutBlueprintJson(normalizedDraft), null, 2)}
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
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
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
      className="rounded-full border border-[#d9a441]/25 bg-[#d9a441]/10 px-3 py-1.5 text-xs font-semibold text-[#f4d28a] transition-theme hover:bg-[#d9a441]/20"
    >
      {children}
    </button>
  );
}

function Preview({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-[#d9a441]/15 bg-black/30 p-2">
      <p className="font-bold text-[#d9a441]">{title}</p>
      <ul className="mt-1 list-disc pl-4">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
