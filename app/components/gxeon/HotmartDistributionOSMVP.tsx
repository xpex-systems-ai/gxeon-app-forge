import React, { useMemo, useState } from 'react';
import {
  HOTMART_DISTRIBUTION_STORAGE_KEY,
  buildAffiliateKit,
  buildAffiliateKitMarkdown,
  buildHotmartAssetPack,
  buildHotmartComposerPrompt,
  buildHotmartDistributionJson,
  buildHotmartManualPublishMarkdown,
  buildHotmartProductDraft,
  buildTrafficManagerBriefMarkdown,
  createHotmartLaunchQueueItem,
  generateHotmartProductIdeas,
  type HotmartDeliveryFormat,
  type HotmartProductIdea,
} from '~/lib/gxeon/hotmartDistribution';

interface Props {
  setPrompt: (prompt: string) => void;
}

const NICHES = ['gestores de tráfego', 'afiliados', 'produtores digitais', 'agências', 'negócios locais'];
const AUDIENCES = ['traffic managers', 'affiliates', 'infoproduct producers', 'consultants', 'agencies'];
const FORMATS: HotmartDeliveryFormat[] = [
  'hybrid_pack',
  'ai_system_pack',
  'dashboard_template',
  'template_pack',
  'prompt_pack',
  'course',
];

export function HotmartDistributionOsMvp({ setPrompt }: Props) {
  const [niche, setNiche] = useState(NICHES[0]);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [format, setFormat] = useState<HotmartDeliveryFormat>('hybrid_pack');
  const [ideas, setIdeas] = useState<HotmartProductIdea[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('Gere ideias e monte um pacote Hotmart local-only.');

  const selectedIdea = ideas.find((idea) => idea.id === selectedId) ?? ideas[0];
  const draft = useMemo(
    () => (selectedIdea ? buildHotmartProductDraft(selectedIdea, 'generated_batch') : null),
    [selectedIdea],
  );
  const kit = useMemo(() => (draft ? buildAffiliateKit(draft) : null), [draft]);
  const assetPack = useMemo(() => (draft ? buildHotmartAssetPack(draft) : null), [draft]);
  const queue = useMemo(
    () => (draft && assetPack ? createHotmartLaunchQueueItem(draft, assetPack) : null),
    [draft, assetPack],
  );
  const markdown = draft && assetPack ? buildHotmartManualPublishMarkdown(draft, assetPack) : '';

  const generateIdeas = () => {
    const next = generateHotmartProductIdeas(niche, audience, format);
    setIdeas(next);
    setSelectedId(next[0]?.id ?? '');
    setStatus('10 ideias geradas localmente. Nenhuma API externa foi chamada.');
  };

  const copy = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(message);
    } catch {
      setStatus('Clipboard indisponível. Copie manualmente pela prévia.');
    }
  };

  const exportJson = () => {
    if (!draft || !assetPack) {
      return;
    }

    const blob = new Blob([buildHotmartDistributionJson(draft, assetPack, queue ?? undefined)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gxeon-hotmart-distribution-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('JSON local exportado sem token, segredo, pagamento ou checkout real.');
  };

  const saveLocal = () => {
    if (!draft || !assetPack) {
      return;
    }

    localStorage.setItem(
      HOTMART_DISTRIBUTION_STORAGE_KEY,
      buildHotmartDistributionJson(draft, assetPack, queue ?? undefined),
    );
    setStatus('Pacote salvo em localStorage para revisão manual do founder.');
  };

  const sendComposer = () => {
    if (!draft) {
      return;
    }

    setPrompt(buildHotmartComposerPrompt(draft));
    setStatus('Prompt enviado ao Composer; envio continua manual.');
  };

  return (
    <div
      data-testid="gxeon-hotmart-distribution-os"
      className="mb-3 rounded-2xl border border-[#d9a441]/25 bg-[#07080d] p-3"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#d9a441]">Hotmart Distribution OS</p>
          <h3 className="text-lg font-black text-white">Produtos, afiliados e tráfego — manual-first</h3>
          <p className="text-xs leading-5 text-white/58">
            Gera drafts locais Hotmart-ready. Não publica, não cria checkout, não conecta tokens e não dispara
            mensagens.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-[#f4d58d]">
          {['Manual-first', 'Local-only', 'No auto-publish', 'No Hotmart API'].map((item) => (
            <span key={item} className="rounded-full border border-[#d9a441]/25 px-2 py-1">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <select
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 p-2 text-xs text-white"
        >
          {NICHES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 p-2 text-xs text-white"
        >
          {AUDIENCES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as HotmartDeliveryFormat)}
          className="rounded-xl border border-white/10 bg-black/30 p-2 text-xs text-white"
        >
          {FORMATS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={generateIdeas} className="rounded-full bg-[#d9a441] px-3 py-1.5 text-xs font-black text-black">
          Gerar Ideias
        </button>
        <button
          onClick={() =>
            setStatus(draft ? 'Produto Hotmart criado localmente para revisão.' : 'Gere uma ideia primeiro.')
          }
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white"
        >
          Criar Produto Hotmart
        </button>
        <button
          onClick={() => setStatus(kit ? 'Kit de afiliado local gerado.' : 'Gere uma ideia primeiro.')}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white"
        >
          Gerar Kit de Afiliado
        </button>
        <button
          onClick={() => setStatus(assetPack ? 'Pack de venda local gerado.' : 'Gere uma ideia primeiro.')}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white"
        >
          Gerar Pack de Venda
        </button>
        <button onClick={saveLocal} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white">
          Adicionar à Fila Hotmart
        </button>
        <button
          onClick={() => copy(markdown, 'Checklist Hotmart copiado para revisão manual.')}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white"
        >
          Copiar Checklist Hotmart
        </button>
        <button onClick={exportJson} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white">
          Exportar JSON
        </button>
        <button
          onClick={() =>
            kit &&
            copy(
              `${markdown}\n\n${buildAffiliateKitMarkdown(kit)}\n\n${draft ? buildTrafficManagerBriefMarkdown(draft, kit) : ''}`,
              'Markdown copiado.',
            )
          }
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white"
        >
          Copiar Markdown
        </button>
        <button onClick={sendComposer} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white">
          Enviar para Composer
        </button>
      </div>

      <p className="mt-2 rounded-xl border border-[#d9a441]/15 bg-black/25 p-2 text-xs text-[#f4d58d]">{status}</p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-black/20 p-3">
          <h4 className="text-sm font-black text-white">Ideias de produto</h4>
          <div className="mt-2 grid gap-1.5">
            {ideas.map((idea) => (
              <button
                key={idea.id}
                onClick={() => setSelectedId(idea.id)}
                className={`rounded-lg border p-2 text-left text-xs ${selectedIdea?.id === idea.id ? 'border-[#d9a441] text-white' : 'border-white/10 text-white/60'}`}
              >
                {idea.productName}
                <span className="block text-white/45">{idea.trafficManagerAngle}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/70">
          <h4 className="text-sm font-black text-white">Draft, afiliados, listing e fila</h4>
          {draft ? (
            <>
              <p>
                <b>Produto:</b> {draft.productName}
              </p>
              <p>
                <b>Promessa segura:</b> {draft.safePromise}
              </p>
              <p>
                <b>Oferta:</b> {draft.offerStack.join(', ')}
              </p>
              <p>
                <b>Afiliado:</b> {kit?.affiliatePitch}
              </p>
              <p>
                <b>Tráfego:</b> {kit?.trafficManagerBrief}
              </p>
              <p>
                <b>Hotmart listing:</b> {assetPack?.hotmartListingDraft.shortDescription}
              </p>
              <p>
                <b>Fila:</b> {queue?.status} / {queue?.approvalGate}
              </p>
            </>
          ) : (
            <p>Gere ideias para ver o pacote completo.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export { HotmartDistributionOsMvp as HotmartDistributionOSMVP };
