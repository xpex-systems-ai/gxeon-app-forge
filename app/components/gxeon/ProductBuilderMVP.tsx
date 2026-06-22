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
  const [status, setStatus] = useState('Preencha os campos e gere um blueprint local.');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

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
    setDraft(normalizedDraft);
    setGeneratedAt(new Date().toISOString());
    setStatus('Blueprint gerado localmente. Nada foi enviado ao LLM.');
  };

  const sendToComposer = () => {
    const nextPrompt = prompt || buildProductBlueprintPrompt(normalizedDraft);
    setPrompt(nextPrompt);
    setStatus('Prompt enviado para o compositor. Revise e envie manualmente quando quiser.');
  };

  const copyMarkdown = async () => {
    const nextMarkdown = markdown || buildProductBlueprintMarkdown(normalizedDraft);

    try {
      await navigator.clipboard.writeText(nextMarkdown);
      setStatus('Markdown copiado para a área de transferência.');
    } catch (error) {
      console.error('Product Builder clipboard error:', error);
      setStatus('Não foi possível copiar automaticamente. Use a prévia para copiar manualmente.');
    }
  };

  const exportJson = () => {
    const json = stringifyProductBlueprintJson(normalizedDraft);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gxeon-product-blueprint-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exportado localmente pelo navegador.');
  };

  const saveDraft = () => {
    localStorage.setItem(PRODUCT_BUILDER_STORAGE_KEY, JSON.stringify(normalizedDraft));
    setStatus('Rascunho salvo somente neste navegador.');
  };

  const loadDraft = () => {
    const stored = localStorage.getItem(PRODUCT_BUILDER_STORAGE_KEY);

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
    <div className="mb-3 rounded-2xl border border-[#d9a441]/25 bg-black/35 p-3">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
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
        <div className="mt-3 space-y-3">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-xs leading-5 text-white/62">
            Gera uma prévia e um prompt profissional no navegador. Rascunho salvo apenas em localStorage:{' '}
            <code>{PRODUCT_BUILDER_STORAGE_KEY}</code>. Sem pagamentos, marketplaces, banco de dados ou envio
            automático.
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
              <h3 className="mb-2 text-sm font-black text-white">Prévia do Blueprint</h3>
              <div className="grid gap-2 md:grid-cols-2">
                <Preview title="Nomes" lines={blueprint.nameSuggestions} />
                <Preview title="Entregáveis" lines={blueprint.deliverables} />
                <Preview title="Landing page" lines={blueprint.landingPageStructure} />
                <Preview title="Checklist humano" lines={blueprint.humanApprovalChecklist} />
              </div>
              <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-black/45 p-2 text-[11px] text-white/62">
                {buildProductBlueprintJson(normalizedDraft).prompt}
              </pre>
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
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
      <p className="font-bold text-[#d9a441]">{title}</p>
      <ul className="mt-1 list-disc pl-4">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
