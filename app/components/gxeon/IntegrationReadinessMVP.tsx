import React, { useMemo, useState } from 'react';
import {
  APPROVAL_MODES,
  CHECKOUT_BLUEPRINT_DRAFT_STORAGE_KEY,
  CONTENT_FACTORY_DRAFT_STORAGE_KEY,
  ENVIRONMENT_MODES,
  INTEGRATION_GOALS,
  INTEGRATION_READINESS_STORAGE_KEY,
  LANDING_BUILDER_DRAFT_STORAGE_KEY,
  MARKETPLACE_PACK_DRAFT_STORAGE_KEY,
  PRODUCT_BUILDER_DRAFT_STORAGE_KEY,
  RISK_LEVELS,
  buildIntegrationReadinessMarkdown,
  buildIntegrationReadinessOutput,
  buildIntegrationReadinessPrompt,
  createEmptyIntegrationReadinessDraft,
  normalizeIntegrationReadinessDraft,
  stringifyIntegrationReadinessJson,
  validateIntegrationReadinessDraft,
  type IntegrationPlatform,
  type IntegrationReadinessDraft,
} from '~/lib/gxeon/integrationReadiness';

interface Props {
  setPrompt: (prompt: string) => void;
}

const labels: Record<string, string> = {
  hotmart: 'Hotmart',
  kiwify: 'Kiwify',
  stripe: 'Stripe',
  mercado_pago: 'Mercado Pago',
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  clickbank: 'ClickBank',
  gumroad: 'Gumroad',
  lemon_squeezy: 'Lemon Squeezy',
  n8n: 'n8n',
  generic: 'Generic',
};
const visiblePlatforms: IntegrationPlatform[] = [
  'hotmart',
  'kiwify',
  'eduzz',
  'braip',
  'perfect_pay',
  'stripe',
  'mercado_pago',
  'shopify',
  'woocommerce',
  'clickbank',
  'gumroad',
  'lemon_squeezy',
  'n8n',
  'email',
  'whatsapp',
  'instagram',
  'linkedin',
  'youtube',
  'generic',
];

export function IntegrationReadinessMvp({ setPrompt }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<IntegrationReadinessDraft>(() => createEmptyIntegrationReadinessDraft());
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [status, setStatus] = useState(
    'Integration Readiness local: schemas, payloads DRY_RUN_ONLY e gates humanos; nenhuma integração real.',
  );
  const normalized = useMemo(() => normalizeIntegrationReadinessDraft(draft, draft.updatedAt), [draft]);
  const output = useMemo(
    () => (generatedAt ? buildIntegrationReadinessOutput(normalized) : null),
    [generatedAt, normalized],
  );
  const prompt = useMemo(() => buildIntegrationReadinessPrompt(normalized), [normalized]);
  const markdown = useMemo(() => buildIntegrationReadinessMarkdown(normalized), [normalized]);
  const update = (patch: Partial<IntegrationReadinessDraft>) =>
    setDraft((current) => normalizeIntegrationReadinessDraft({ ...current, ...patch }, new Date().toISOString()));
  const toggle = (platform: IntegrationPlatform) =>
    update({
      selectedPlatforms: normalized.selectedPlatforms.includes(platform)
        ? normalized.selectedPlatforms.filter((p) => p !== platform)
        : [...normalized.selectedPlatforms, platform],
    });
  const importDraft = (key: string, mapper: (value: any) => Partial<IntegrationReadinessDraft>, label: string) => {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        setStatus(`${label}: nenhum rascunho local encontrado.`);
        return;
      }

      update(mapper(JSON.parse(raw)));
      setStatus(
        `${label}: contexto compacto importado manualmente. Nenhum dado secreto ou Markdown completo é importado.`,
      );
    } catch {
      setStatus(`${label}: falha ao ler rascunho local.`);
    }
  };
  const copy = async (value: string, ok: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(ok);
    } catch {
      setStatus('Clipboard indisponível. Copie manualmente pela prévia.');
    }
  };
  const exportJson = () => {
    const blob = new Blob([stringifyIntegrationReadinessJson(normalized)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gxeon-integration-readiness-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('JSON exportado localmente. Nenhum upload ou API foi chamado.');
  };
  const generate = () => {
    const validation = validateIntegrationReadinessDraft(normalized);
    setGeneratedAt(new Date().toISOString());
    setStatus(
      validation.isStrongReadinessReady
        ? 'Readiness gerado localmente. DRY_RUN_ONLY: sem API, checkout, webhook, n8n, post ou mensagem.'
        : `Readiness gerado com fallback seguro. Campos recomendados pendentes: ${validation.missingRecommendedFields.join(', ')}.`,
    );
  };
  const send = () => {
    setPrompt(prompt);
    requestAnimationFrame(() => document.querySelector<HTMLTextAreaElement>('#composer textarea')?.focus());
    setStatus('Prompt enviado ao Composer sem auto-envio. Revise antes de qualquer ação.');
  };
  const save = () => {
    localStorage.setItem(INTEGRATION_READINESS_STORAGE_KEY, JSON.stringify(normalized));
    setStatus('Rascunho salvo apenas no localStorage deste navegador.');
  };
  const load = () => {
    const raw = localStorage.getItem(INTEGRATION_READINESS_STORAGE_KEY);

    if (!raw) {
      setStatus('Nenhum rascunho local salvo.');
      return;
    }

    setDraft(normalizeIntegrationReadinessDraft(JSON.parse(raw)));
    setStatus('Rascunho carregado localmente.');
  };

  return (
    <section
      data-testid="gxeon-integration-readiness-container"
      className="my-3 rounded-2xl border border-[#d9a441]/25 bg-black/40 p-3 text-xs text-bolt-elements-textSecondary"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <b className="text-[#d9a441]">Integration Readiness MVP</b>
          <br />
          Blueprints API-ready seguros, DRY_RUN_ONLY, sem credenciais e sem conexões reais.
        </span>
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              [
                'Product Builder',
                PRODUCT_BUILDER_DRAFT_STORAGE_KEY,
                (v: any) => ({
                  sourceProductIdea: v.idea,
                  sourceNiche: v.niche,
                  sourceAudience: v.targetAudience,
                  sourceProblem: v.problem,
                  sourceOffer: v.offer,
                  sourcePromise: v.promise,
                  basePrice: v.desiredPrice,
                  deliveryFormat: v.deliveryFormat,
                }),
              ],
              [
                'Marketplace Pack',
                MARKETPLACE_PACK_DRAFT_STORAGE_KEY,
                (v: any) => ({
                  sourceProductIdea: v.productName,
                  sourceNiche: v.niche,
                  sourceAudience: v.targetAudience,
                  sourceOffer: v.shortDescription,
                }),
              ],
              [
                'Checkout Blueprint',
                CHECKOUT_BLUEPRINT_DRAFT_STORAGE_KEY,
                (v: any) => ({ sourceOffer: v.offerSummary, basePrice: v.basePrice, deliveryFormat: v.deliveryFormat }),
              ],
              [
                'Landing Builder',
                LANDING_BUILDER_DRAFT_STORAGE_KEY,
                (v: any) => ({
                  sourceProductIdea: v.productName,
                  sourceAudience: v.targetAudience,
                  sourcePromise: v.heroPromise,
                  sourceOffer: v.offerSummary,
                }),
              ],
              [
                'Content Factory',
                CONTENT_FACTORY_DRAFT_STORAGE_KEY,
                (v: any) => ({
                  sourceProductIdea: v.productName,
                  sourceAudience: v.targetAudience,
                  sourceOffer: v.offerSummary,
                  operatorNotes: v.campaignNotes,
                }),
              ],
            ].map(([label, key, mapper]) => (
              <button
                key={label as string}
                type="button"
                onClick={() => importDraft(key as string, mapper as any, label as string)}
                className="rounded-full border border-[#d9a441]/20 px-2 py-1"
              >
                Importar {label as string}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                'sourceProductIdea',
                'sourceNiche',
                'sourceAudience',
                'sourceProblem',
                'sourceOffer',
                'sourcePromise',
                'basePrice',
                'deliveryFormat',
              ] as const
            ).map((field) => (
              <input
                key={field}
                value={normalized[field]}
                onChange={(e) => update({ [field]: e.target.value })}
                placeholder={field}
                className="rounded-lg border border-white/10 bg-black/40 p-2"
              />
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <select
              value={normalized.integrationGoal}
              onChange={(e) => update({ integrationGoal: e.target.value as any })}
            >
              {INTEGRATION_GOALS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select value={normalized.approvalMode} onChange={(e) => update({ approvalMode: e.target.value as any })}>
              {APPROVAL_MODES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select value={normalized.riskLevel} onChange={(e) => update({ riskLevel: e.target.value as any })}>
              {RISK_LEVELS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select
              value={normalized.environmentMode}
              onChange={(e) => update({ environmentMode: e.target.value as any })}
            >
              {ENVIRONMENT_MODES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1">
            {visiblePlatforms.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => toggle(p)}
                className={`rounded-full border px-2 py-1 ${normalized.selectedPlatforms.includes(p) ? 'border-[#d9a441] text-[#d9a441]' : 'border-white/10'}`}
              >
                {labels[p] || p}
              </button>
            ))}
          </div>
          <textarea
            value={normalized.operatorNotes}
            onChange={(e) => update({ operatorNotes: e.target.value })}
            placeholder="operatorNotes"
            className="h-16 w-full rounded-lg border border-white/10 bg-black/40 p-2"
          />
          <textarea
            value={normalized.approvalNotes}
            onChange={(e) => update({ approvalNotes: e.target.value })}
            placeholder="approvalNotes"
            className="h-16 w-full rounded-lg border border-white/10 bg-black/40 p-2"
          />
          <div className="flex flex-wrap gap-2">
            {[
              ['Gerar Integration Readiness', generate],
              ['Enviar para Composer', send],
              ['Copiar Prompt', () => copy(prompt, 'Prompt copiado.')],
              ['Copiar Markdown', () => copy(markdown, 'Markdown copiado.')],
              ['Exportar JSON', exportJson],
              ['Salvar Rascunho', save],
              ['Carregar Rascunho', load],
              [
                'Limpar',
                () => {
                  setDraft(createEmptyIntegrationReadinessDraft());
                  setGeneratedAt(null);
                  setStatus('Limpo localmente.');
                },
              ],
            ].map(([l, fn]) => (
              <button
                key={l as string}
                type="button"
                data-testid={l === 'Gerar Integration Readiness' ? 'gxeon-integration-readiness-dry-run' : undefined}
                onClick={fn as any}
                className="rounded-lg border border-[#d9a441]/25 bg-[#d9a441]/10 px-3 py-1.5 text-[#d9a441]"
              >
                {l as string}
              </button>
            ))}
          </div>
          <p className="rounded-lg border border-white/10 p-2">{status}</p>
          {output && (
            <pre className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-black/50 p-3 text-[11px]">
              {JSON.stringify(
                {
                  platformAdapterMap: output.platformAdapterMap,
                  payloadPreviews: output.payloadPreviews,
                  credentialRequirements: output.credentialRequirements,
                  webhookBlueprints: output.webhookBlueprints,
                  n8nWorkflowDrafts: output.n8nWorkflowDrafts,
                  humanApprovalGates: output.humanApprovalGates,
                  complianceChecklist: output.complianceChecklist,
                },
                null,
                2,
              )}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
