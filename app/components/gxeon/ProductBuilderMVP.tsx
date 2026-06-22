import React, { useMemo, useState } from 'react';
import {
  PRODUCT_BUILDER_STORAGE_KEY,
  PRODUCT_TYPES,
  PRODUCT_TONES,
  buildProductBlueprintJson,
  buildProductBlueprintMarkdown,
  buildProductBlueprintOutput,
  buildProductBlueprintPrompt,
  createEmptyProductBuilderDraft,
  normalizeProductBuilderDraft,
  stringifyProductBlueprintJson,
  validateProductBuilderDraft,
  type ProductBuilderDraft,
} from '~/lib/gxeon/productBuilder';

interface ProductBuilderMVPProps {
  setPrompt: (prompt: string) => void;
}

const CHANNEL_OPTIONS = ['Instagram', 'YouTube', 'Email', 'WhatsApp', 'Landing Page', 'Marketplace manual'];

const PRODUCT_TYPE_LABELS: Record<(typeof PRODUCT_TYPES)[number], string> = {
  ebook: 'Ebook',
  course: 'Curso',
  mentorship: 'Mentoria',
  saas: 'SaaS',
  template: 'Template',
  affiliate_store: 'Loja afiliada',
  dashboard: 'Dashboard',
  community: 'Comunidade',
  service: 'Serviço',
  other: 'Outro',
};

const TONE_LABELS: Record<(typeof PRODUCT_TONES)[number], string> = {
  direct: 'Direto',
  premium: 'Premium',
  technical: 'Técnico',
  popular: 'Popular',
  institutional: 'Institucional',
  persuasive: 'Persuasivo',
};

export function ProductBuilderMvp({ setPrompt }: ProductBuilderMVPProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [draft, setDraft] = useState<ProductBuilderDraft>(() => createEmptyProductBuilderDraft());
  const [status, setStatus] = useState(
    'Preencha os campos essenciais e gere um blueprint local, seguro e manual-first.',
  );
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [allowSparseBlueprint, setAllowSparseBlueprint] = useState(false);

  const normalizedDraft = useMemo(() => normalizeProductBuilderDraft(draft, draft.updatedAt), [draft]);
  const blueprint = useMemo(
    () => (generatedAt ? buildProductBlueprintOutput(normalizedDraft) : null),
    [generatedAt, normalizedDraft],
  );
  const markdown = useMemo(
    () => (generatedAt ? buildProductBlueprintMarkdown(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );
  const prompt = useMemo(
    () => (generatedAt ? buildProductBlueprintPrompt(normalizedDraft) : ''),
    [generatedAt, normalizedDraft],
  );

  const updateDraft = (patch: Partial<ProductBuilderDraft>) => {
    setDraft((current) => normalizeProductBuilderDraft({ ...current, ...patch }, new Date().toISOString()));
  };

  const toggleChannel = (channel: string) => {
    const channels = normalizedDraft.channels.includes(channel)
      ? normalizedDraft.channels.filter((item) => item !== channel)
      : [...normalizedDraft.channels, channel];
    updateDraft({ channels });
  };

  const generateBlueprint = () => {
    const validation = validateProductBuilderDraft(normalizedDraft);

    if (!validation.isStrongBlueprintReady && !allowSparseBlueprint) {
      setAllowSparseBlueprint(true);
      setStatus(
        'Preencha ideia, nicho, público e problema para um blueprint mais forte. Clique em Gerar Blueprint novamente para continuar com fallback seguro.',
      );

      return;
    }

    setDraft(normalizedDraft);
    setGeneratedAt(new Date().toISOString());
    setAllowSparseBlueprint(false);
    setStatus(
      validation.isStrongBlueprintReady
        ? 'Blueprint premium gerado localmente. Nada foi enviado ao LLM.'
        : 'Blueprint gerado com fallback seguro. Revise os campos antes de usar comercialmente.',
    );
  };

  const sendToComposer = () => {
    const nextPrompt = prompt || buildProductBlueprintPrompt(normalizedDraft);
    setPrompt(nextPrompt);
    setStatus('Prompt enviado para o compositor. Revise e envie manualmente quando quiser.');
  };

  const copyText = async (value: string, successMessage: string) => {
    if (!navigator.clipboard?.writeText) {
      setStatus('Área de transferência indisponível neste navegador. Copie manualmente pelo bloco de prévia.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setStatus(successMessage);
    } catch (error) {
      console.error('Product Builder clipboard error:', error);
      setStatus('Não foi possível copiar automaticamente. Copie manualmente pelo bloco de prévia.');
    }
  };

  const copyMarkdown = () => {
    void copyText(
      markdown || buildProductBlueprintMarkdown(normalizedDraft),
      'Markdown copiado. Revise antes de publicar ou vender.',
    );
  };

  const copyPrompt = () => {
    void copyText(
      prompt || buildProductBlueprintPrompt(normalizedDraft),
      'Prompt copiado. Cole no Composer e envie manualmente quando quiser.',
    );
  };

  const exportJson = () => {
    let url: string | null = null;
    let link: HTMLAnchorElement | null = null;

    try {
      const json = stringifyProductBlueprintJson(normalizedDraft);
      const blob = new Blob([json], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      link = document.createElement('a');
      link.href = url;
      link.download = `gxeon-product-blueprint-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      setStatus('JSON exportado localmente. Arquivo sem chaves, cookies ou integrações reais.');
    } catch (error) {
      console.error('Product Builder export error:', error);
      setStatus('Não foi possível exportar o JSON neste navegador. Tente novamente ou copie o Markdown.');
    } finally {
      link?.remove();

      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(PRODUCT_BUILDER_STORAGE_KEY, JSON.stringify(normalizedDraft));
      setStatus('Rascunho salvo somente neste navegador. Nenhuma chave ou segredo é armazenado.');
    } catch (error) {
      console.error('Product Builder draft save error:', error);
      setStatus('Não foi possível salvar o rascunho local. O navegador pode estar em modo privado ou sem espaço.');
    }
  };

  const loadDraft = () => {
    let stored: string | null = null;

    try {
      stored = localStorage.getItem(PRODUCT_BUILDER_STORAGE_KEY);
    } catch (error) {
      console.error('Product Builder draft read error:', error);
      setStatus('Não foi possível acessar o rascunho local. Verifique permissões de armazenamento do navegador.');

      return;
    }

    if (!stored) {
      setStatus('Nenhum rascunho local encontrado neste navegador.');
      return;
    }

    try {
      setDraft(normalizeProductBuilderDraft(JSON.parse(stored), new Date().toISOString()));
      setStatus('Rascunho local carregado.');
    } catch (error) {
      console.error('Product Builder draft load error:', error);
      setStatus('Rascunho local inválido.');
    }
  };

  const clearDraft = () => {
    setDraft(createEmptyProductBuilderDraft());
    setGeneratedAt(null);
    setStatus('Formulário limpo. Nenhum dado foi enviado.');
  };

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-[#d9a441]/25 bg-[linear-gradient(135deg,#05060a_0%,#0d0b08_54%,#171006_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 border-b border-[#d9a441]/15 bg-black/25 p-3 text-left"
        aria-expanded={isOpen}
      >
        <span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a441]">
            Product Builder MVP
          </span>
          <span className="block text-sm font-black text-white">Blueprint de produto digital manual-first</span>
        </span>
        <span className="rounded-full border border-[#d9a441]/30 px-2 py-1 text-[10px] text-[#d9a441]">
          {isOpen ? 'Recolher' : 'Abrir'}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-3 p-3">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-xs leading-5 text-white/62">
            Central local para lapidar oferta, avatar, preço e go-to-market manual. Rascunho apenas em localStorage:{' '}
            <code>{PRODUCT_BUILDER_STORAGE_KEY}</code>. Sem pagamentos, APIs de marketplace, banco de dados ou
            auto-send.
          </p>

          <div className="grid gap-2 md:grid-cols-2">
            <Field
              label="Ideia"
              value={draft.idea}
              onChange={(idea) => updateDraft({ idea })}
              placeholder="Ex: curso de IA para corretores"
            />
            <Field
              label="Nicho"
              value={draft.niche}
              onChange={(niche) => updateDraft({ niche })}
              placeholder="Ex: mercado imobiliário"
            />
            <Field
              label="Público-alvo"
              value={draft.targetAudience}
              onChange={(targetAudience) => updateDraft({ targetAudience })}
              placeholder="Ex: corretores autônomos iniciantes"
            />
            <Field
              label="Problema"
              value={draft.problem}
              onChange={(problem) => updateDraft({ problem })}
              placeholder="Ex: dificuldade para gerar leads qualificados"
            />
            <label className="text-xs font-semibold text-white/70">
              Tipo de produto
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#07080d] px-3 py-2 text-white"
                value={draft.productType}
                onChange={(event) =>
                  updateDraft({ productType: event.target.value as ProductBuilderDraft['productType'] })
                }
              >
                {PRODUCT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PRODUCT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-white/70">
              Tom
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#07080d] px-3 py-2 text-white"
                value={draft.tone}
                onChange={(event) => updateDraft({ tone: event.target.value as ProductBuilderDraft['tone'] })}
              >
                {PRODUCT_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {TONE_LABELS[tone]}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Oferta"
              value={draft.offer}
              onChange={(offer) => updateDraft({ offer })}
              placeholder="Ex: método com aulas, templates e checklist"
            />
            <Field
              label="Promessa"
              value={draft.promise}
              onChange={(promise) => updateDraft({ promise })}
              placeholder="Ex: organizar aquisição de leads com IA sem prometer renda"
            />
            <Field
              label="Preço desejado"
              value={draft.desiredPrice}
              onChange={(desiredPrice) => updateDraft({ desiredPrice })}
              placeholder="Ex: R$ 297 ou hipótese a validar"
            />
            <Field
              label="Formato de entrega"
              value={draft.deliveryFormat}
              onChange={(deliveryFormat) => updateDraft({ deliveryFormat })}
              placeholder="Ex: PDF + vídeos + planilha"
            />
          </div>

          <fieldset className="rounded-xl border border-white/10 p-2">
            <legend className="px-1 text-xs font-semibold text-white/70">Canais</legend>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_OPTIONS.map((channel) => (
                <label
                  key={channel}
                  className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs text-white/65"
                >
                  <input
                    type="checkbox"
                    checked={normalizedDraft.channels.includes(channel)}
                    onChange={() => toggleChannel(channel)}
                  />
                  {channel}
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
              placeholder="Ex: validar copy com sócio antes de publicar; não ativar checkout real."
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Action onClick={generateBlueprint}>Gerar Blueprint</Action>
            <Action onClick={sendToComposer}>Enviar para Composer</Action>
            <Action onClick={copyMarkdown}>Copiar Markdown</Action>
            <Action onClick={copyPrompt}>Copiar Prompt</Action>
            <Action onClick={exportJson}>Exportar JSON</Action>
            <Action onClick={saveDraft}>Salvar Rascunho</Action>
            <Action onClick={loadDraft}>Carregar Rascunho</Action>
            <Action onClick={clearDraft}>Limpar</Action>
          </div>

          <p className="text-xs text-[#d9a441]" role="status">
            {status}
          </p>

          {blueprint && (
            <div className="rounded-xl border border-[#d9a441]/20 bg-[#07080d] p-3 text-xs text-white/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-white">Prévia do Blueprint</h3>
                <span className="rounded-full border border-[#d9a441]/25 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  Prévia local — nada enviado ao LLM
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Preview title="Nomes" lines={blueprint.nameSuggestions} />
                <Preview title="Avatar" lines={[blueprint.avatar]} />
                <Preview title="Oferta" lines={[blueprint.coreOffer, blueprint.promise, blueprint.transformation]} />
                <Preview title="Preço" lines={[blueprint.pricingHypothesis]} />
                <Preview title="Landing" lines={blueprint.landingPageStructure} />
                <Preview title="Marketplace Pack" lines={blueprint.marketplacePackFields} />
                <Preview title="Conteúdo" lines={blueprint.contentAngles} />
                <Preview title="Checklist Humano" lines={blueprint.humanApprovalChecklist} />
                <Preview title="Próximos Passos" lines={blueprint.nextSteps} />
              </div>
              <details className="mt-3 rounded-lg border border-white/10 bg-black/35 p-2">
                <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.12em] text-[#d9a441]">
                  Prompt bruto copiável
                </summary>
                <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-black/45 p-2 text-[11px] text-white/62">
                  {buildProductBlueprintJson(normalizedDraft).prompt}
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
