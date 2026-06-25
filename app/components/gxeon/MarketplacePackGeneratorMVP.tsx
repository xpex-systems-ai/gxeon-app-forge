import React, { useMemo, useState } from 'react';
import {
  MARKETPLACE_PACK_STORAGE_KEY,
  MARKETPLACE_PACK_TONES,
  MARKETPLACE_PLATFORM_LABELS,
  MARKETPLACE_PLATFORMS,
  PRODUCT_BUILDER_DRAFT_STORAGE_KEY,
  buildMarketplacePackJson,
  buildMarketplacePackMarkdown,
  buildMarketplacePackOutput,
  buildMarketplacePackPrompt,
  createEmptyMarketplacePackDraft,
  normalizeMarketplacePackDraft,
  stringifyMarketplacePackJson,
  validateMarketplacePackDraft,
  type MarketplacePackDraft,
  type MarketplacePlatform,
} from '~/lib/gxeon/marketplacePack';

interface MarketplacePackGeneratorMVPProps {
  setPrompt: (prompt: string) => void;
}

const TONE_LABELS: Record<(typeof MARKETPLACE_PACK_TONES)[number], string> = {
  direct: 'Direto',
  premium: 'Premium',
  technical: 'Técnico',
  popular: 'Popular',
  institutional: 'Institucional',
  persuasive: 'Persuasivo',
};

export function MarketplacePackGeneratorMvp({ setPrompt }: MarketplacePackGeneratorMVPProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<MarketplacePackDraft>(() => createEmptyMarketplacePackDraft());
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [allowSparsePack, setAllowSparsePack] = useState(false);
  const [status, setStatus] = useState(
    'Gere um Marketplace Pack local. Nada será publicado ou enviado automaticamente.',
  );

  const normalizedDraft = useMemo(() => normalizeMarketplacePackDraft(draft, draft.updatedAt), [draft]);
  const pack = useMemo(
    () => (generatedAt ? buildMarketplacePackOutput(normalizedDraft) : null),
    [generatedAt, normalizedDraft],
  );
  const markdown = useMemo(
    () => (generatedAt ? buildMarketplacePackMarkdown(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );
  const prompt = useMemo(
    () => (generatedAt ? buildMarketplacePackPrompt(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );

  const updateDraft = (patch: Partial<MarketplacePackDraft>) => {
    setDraft((current) => normalizeMarketplacePackDraft({ ...current, ...patch }, new Date().toISOString()));
  };

  const togglePlatform = (platform: MarketplacePlatform) => {
    const selectedPlatforms = normalizedDraft.selectedPlatforms.includes(platform)
      ? normalizedDraft.selectedPlatforms.filter((item) => item !== platform)
      : [...normalizedDraft.selectedPlatforms, platform];
    updateDraft({ selectedPlatforms });
  };

  const generatePack = () => {
    const validation = validateMarketplacePackDraft(normalizedDraft);

    if (!validation.isStrongMarketplacePackReady && !allowSparsePack) {
      setAllowSparsePack(true);
      setStatus(
        `Campos recomendados ausentes: ${validation.missingRecommendedFields.join(', ')}. Clique em Gerar Marketplace Pack novamente para continuar com fallback seguro.`,
      );

      return;
    }

    setDraft(normalizedDraft);
    setGeneratedAt(new Date().toISOString());
    setAllowSparsePack(false);
    setStatus(
      validation.isStrongMarketplacePackReady
        ? 'Marketplace Pack gerado localmente. Nenhuma API de marketplace, pagamento ou publicação foi acionada.'
        : 'Marketplace Pack gerado com fallback seguro. Revise tudo antes de publicar manualmente.',
    );
  };

  const sendToComposer = () => {
    setPrompt(prompt || buildMarketplacePackPrompt(normalizedDraft));
    setStatus('Prompt enviado ao Composer real. Revise e envie manualmente; nada foi auto-enviado.');
  };

  const copyText = async (value: string, successMessage: string) => {
    if (!navigator.clipboard?.writeText) {
      setStatus('Clipboard indisponível. Copie manualmente pelo bloco de prévia.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setStatus(successMessage);
    } catch (error) {
      console.error('Marketplace Pack clipboard error:', error);
      setStatus('Não foi possível copiar automaticamente. Copie manualmente pelo bloco de prévia.');
    }
  };

  const exportJson = () => {
    let url: string | null = null;
    let link: HTMLAnchorElement | null = null;

    try {
      const blob = new Blob([stringifyMarketplacePackJson(normalizedDraft)], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      link = document.createElement('a');
      link.href = url;
      link.download = `gxeon-marketplace-pack-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      setStatus('JSON exportado localmente com flags de segurança. Nenhuma integração real foi chamada.');
    } catch (error) {
      console.error('Marketplace Pack export error:', error);
      setStatus('Não foi possível exportar o JSON neste navegador.');
    } finally {
      link?.remove();

      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(MARKETPLACE_PACK_STORAGE_KEY, JSON.stringify(normalizedDraft));
      setStatus('Rascunho salvo apenas no navegador local. Nenhum segredo ou credencial é armazenado.');
    } catch (error) {
      console.error('Marketplace Pack draft save error:', error);
      setStatus('Não foi possível salvar o rascunho local.');
    }
  };

  const loadDraft = () => {
    try {
      const stored = localStorage.getItem(MARKETPLACE_PACK_STORAGE_KEY);

      if (!stored) {
        setStatus('Nenhum rascunho local de Marketplace Pack encontrado.');
        return;
      }

      setDraft(normalizeMarketplacePackDraft(JSON.parse(stored), new Date().toISOString()));
      setStatus('Rascunho local de Marketplace Pack carregado.');
    } catch (error) {
      console.error('Marketplace Pack draft load error:', error);
      setStatus('Rascunho local inválido ou storage indisponível.');
    }
  };

  const importProductBuilderDraft = () => {
    try {
      const stored = localStorage.getItem(PRODUCT_BUILDER_DRAFT_STORAGE_KEY);

      if (!stored) {
        setStatus('Nenhum rascunho local do Product Builder encontrado neste navegador.');
        return;
      }

      const productDraft = JSON.parse(stored) as Record<string, unknown>;
      updateDraft({
        sourceProductIdea: String(productDraft.idea || ''),
        sourceNiche: String(productDraft.niche || ''),
        sourceAudience: String(productDraft.targetAudience || ''),
        sourceProblem: String(productDraft.problem || ''),
        sourceOffer: String(productDraft.offer || ''),
        sourcePromise: String(productDraft.promise || ''),
        sourcePrice: String(productDraft.desiredPrice || ''),
        deliveryFormat: String(productDraft.deliveryFormat || ''),
        approvalNotes: 'Dados importados de rascunho local do Product Builder. Revisar manualmente antes de publicar.',
      });
      setStatus('Dados importados somente do rascunho local do Product Builder; nenhuma credencial foi lida.');
    } catch (error) {
      console.error('Product Builder local import error:', error);
      setStatus('Não foi possível importar o rascunho local do Product Builder.');
    }
  };

  const clearDraft = () => {
    setDraft(createEmptyMarketplacePackDraft());
    setGeneratedAt(null);
    setAllowSparsePack(false);
    setStatus('Formulário limpo. Nada foi enviado, publicado ou persistido em servidor.');
  };

  return (
    <div
      data-testid="gxeon-marketplace-pack-container"
      className="mb-3 overflow-hidden rounded-2xl border border-[#d9a441]/25 bg-[linear-gradient(135deg,#05060a_0%,#0c0a06_52%,#150f05_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
    >
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 border-b border-[#d9a441]/15 bg-black/25 p-3 text-left"
        aria-expanded={isOpen}
      >
        <span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a441]">
            Marketplace Pack Generator MVP
          </span>
          <span className="block text-sm font-black text-white">Copy, metadata e checklist para revisão manual</span>
        </span>
        <span className="rounded-full border border-[#d9a441]/30 px-2 py-1 text-[10px] text-[#d9a441]">
          {isOpen ? 'Recolher' : 'Abrir'}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-3 p-3">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-xs leading-5 text-white/62">
            Módulo local e manual-first: sem API de marketplace, sem publicação automática, sem checkout, sem pagamento
            real e sem banco de dados. Rascunho local: <code>{MARKETPLACE_PACK_STORAGE_KEY}</code>.
          </p>

          <div className="grid gap-2 md:grid-cols-2">
            <Field
              label="Ideia do produto"
              value={draft.sourceProductIdea}
              onChange={(sourceProductIdea) => updateDraft({ sourceProductIdea })}
              placeholder="Ex: Curso de IA para corretores"
            />
            <Field
              label="Nicho"
              value={draft.sourceNiche}
              onChange={(sourceNiche) => updateDraft({ sourceNiche })}
              placeholder="Ex: mercado imobiliário"
            />
            <Field
              label="Público"
              value={draft.sourceAudience}
              onChange={(sourceAudience) => updateDraft({ sourceAudience })}
              placeholder="Ex: corretores autônomos"
            />
            <Field
              label="Problema"
              value={draft.sourceProblem}
              onChange={(sourceProblem) => updateDraft({ sourceProblem })}
              placeholder="Ex: baixa previsibilidade de leads"
            />
            <Field
              label="Oferta"
              value={draft.sourceOffer}
              onChange={(sourceOffer) => updateDraft({ sourceOffer })}
              placeholder="Ex: aulas + templates + checklist"
            />
            <Field
              label="Promessa"
              value={draft.sourcePromise}
              onChange={(sourcePromise) => updateDraft({ sourcePromise })}
              placeholder="Ex: organizar captação sem prometer renda"
            />
            <Field
              label="Preço"
              value={draft.sourcePrice}
              onChange={(sourcePrice) => updateDraft({ sourcePrice })}
              placeholder="Ex: R$ 297 a validar"
            />
            <Field
              label="Formato de entrega"
              value={draft.deliveryFormat}
              onChange={(deliveryFormat) => updateDraft({ deliveryFormat })}
              placeholder="Ex: vídeos, PDF e planilha"
            />
            <Field
              label="Categoria"
              value={draft.mainCategory}
              onChange={(mainCategory) => updateDraft({ mainCategory })}
              placeholder="Ex: Educação / Negócios"
            />
            <label className="text-xs font-semibold text-white/70">
              Tom
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#07080d] px-3 py-2 text-white"
                value={draft.tone}
                onChange={(event) => updateDraft({ tone: event.target.value as MarketplacePackDraft['tone'] })}
              >
                {MARKETPLACE_PACK_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {TONE_LABELS[tone]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="rounded-xl border border-white/10 p-2">
            <legend className="px-1 text-xs font-semibold text-white/70">Plataformas para checklist manual</legend>
            <div className="flex flex-wrap gap-2">
              {MARKETPLACE_PLATFORMS.map((platform) => (
                <label
                  key={platform}
                  className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs text-white/65"
                >
                  <input
                    type="checkbox"
                    checked={normalizedDraft.selectedPlatforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                  />
                  {MARKETPLACE_PLATFORM_LABELS[platform]}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block text-xs font-semibold text-white/70">
            Notas de aprovação humana
            <textarea
              className="mt-1 min-h-16 w-full rounded-xl border border-white/10 bg-[#07080d] px-3 py-2 text-white"
              value={draft.approvalNotes}
              onChange={(event) => updateDraft({ approvalNotes: event.target.value })}
              placeholder="Ex: revisar com jurídico; publicar manualmente somente depois da aprovação."
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Action data-testid="gxeon-marketplace-pack-generate" onClick={generatePack}>
              Gerar Marketplace Pack
            </Action>
            <Action onClick={sendToComposer}>Enviar para Composer</Action>
            <Action
              onClick={() =>
                void copyText(
                  prompt || buildMarketplacePackPrompt(normalizedDraft),
                  'Prompt copiado. Cole e envie manualmente quando quiser.',
                )
              }
            >
              Copiar Prompt
            </Action>
            <Action
              onClick={() =>
                void copyText(
                  markdown || buildMarketplacePackMarkdown(normalizedDraft),
                  'Markdown copiado para revisão manual.',
                )
              }
            >
              Copiar Markdown
            </Action>
            <Action data-testid="gxeon-marketplace-pack-export-json" onClick={exportJson}>
              Exportar JSON
            </Action>
            <Action data-testid="gxeon-marketplace-pack-save-draft" onClick={saveDraft}>
              Salvar Rascunho
            </Action>
            <Action onClick={loadDraft}>Carregar Rascunho</Action>
            <Action data-testid="gxeon-marketplace-pack-import-product" onClick={importProductBuilderDraft}>
              Usar rascunho local do Product Builder
            </Action>
            <Action onClick={clearDraft}>Limpar</Action>
          </div>

          <p className="text-xs text-[#d9a441]" role="status">
            {status}
          </p>

          {pack && (
            <div className="rounded-xl border border-[#d9a441]/20 bg-[#07080d] p-3 text-xs text-white/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-white">Prévia do Marketplace Pack</h3>
                <span className="rounded-full border border-[#d9a441]/25 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  Prévia local — sem publicação
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Preview title="Títulos curtos" lines={pack.shortCommercialTitles} />
                <Preview
                  title="Copy"
                  lines={[pack.productTitle, pack.shortDescription, pack.seoTitle, pack.seoDescription]}
                />
                <Preview title="Categorias e tags" lines={[...pack.categories, ...pack.tags]} />
                <Preview title="FAQ" lines={pack.faq} />
                <Preview title="Garantia" lines={pack.guaranteeNotes} />
                <Preview title="Assets" lines={pack.assetChecklist} />
                <Preview title="Affiliate copy" lines={pack.affiliateCopy} />
                <Preview title="Launch posts" lines={pack.launchPosts} />
                <Preview title="Aprovação humana" lines={pack.humanApprovalChecklist} />
                <Preview title="Riscos" lines={pack.riskWarnings} />
                <Preview title="Próximos passos" lines={pack.nextSteps} />
              </div>
              <details className="mt-3 rounded-lg border border-white/10 bg-black/35 p-2">
                <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  JSON local e prompt copiável
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-black/45 p-2 text-[11px] text-white/62">
                  {JSON.stringify(buildMarketplacePackJson(normalizedDraft), null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="text-xs font-semibold text-white/70">
      {label}
      <input
        className="mt-1 w-full rounded-xl border border-white/10 bg-[#07080d] px-3 py-2 text-white placeholder:text-white/30"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Action({
  children,
  onClick,
  ...props
}: { children: React.ReactNode; onClick: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...props}
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
