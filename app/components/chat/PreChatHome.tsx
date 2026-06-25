import React from 'react';
import { ImportButtons } from '~/components/chat/chatExportAndImport/ImportButtons';
import GitCloneButton from './GitCloneButton';
import { ProductBuilderMvp } from '~/components/gxeon/ProductBuilderMVP';
import { MarketplacePackGeneratorMvp } from '~/components/gxeon/MarketplacePackGeneratorMVP';
import { CheckoutBlueprintMvp } from '~/components/gxeon/CheckoutBlueprintMVP';
import { LandingBuilderMvp } from '~/components/gxeon/LandingBuilderMVP';
import { ContentFactoryMvp } from '~/components/gxeon/ContentFactoryMVP';
import { IntegrationReadinessMvp } from '~/components/gxeon/IntegrationReadinessMVP';
import { ApprovalLedgerMvp } from '~/components/gxeon/ApprovalLedgerMVP';
import { BetaProductPipelineMvp } from '~/components/gxeon/BetaProductPipelineMVP';
import { RevenueLedgerMvp } from '~/components/gxeon/RevenueLedgerMVP';
import { AgentOperatingLayerMvp } from '~/components/gxeon/AgentOperatingLayerMVP';
import { OperatorWorkspaceShell } from '~/components/gxeon/OperatorWorkspaceShell';
import type { OperatorWorkspaceModuleKey } from '~/lib/gxeon/operatorWorkspace';
import type { Message } from 'ai';

interface ProductFactoryMode {
  label: string;
  prompt: string;
}

interface PreChatHomeProps {
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  productFactoryModes: ProductFactoryMode[];
  setPrompt: (prompt: string) => void;
  sendExamplePrompt: (event: React.UIEvent, messageInput?: string) => void;
}

const MACHINE_STATUS = [
  'Runtime Online',
  'Railway Deploy',
  'Manual-first',
  'Pagamentos desativados',
  'Marketplaces em roadmap',
  'Landing Builder MVP manual-first',
  'Content Factory MVP manual-first',
  'Integration Readiness DRY_RUN_ONLY',
  'Approval Ledger local-only',
  'Beta Product Pipeline local-only',
  'Revenue Ledger local-only',
  'Command Center tabs',
  'Agent-ready gated',
  'Human-approved gates',
];

const MODULES = [
  { title: 'Product Builder', subtitle: 'Oferta, avatar e estrutura' },
  { title: 'Landing Builder', subtitle: 'Páginas de venda e captura' },
  { title: 'Marketplace Pack Generator', subtitle: 'Packs comerciais sem APIs reais' },
  { title: 'Checkout Blueprint', subtitle: 'Preço, plano e pós-compra manual' },
  { title: 'Content Factory', subtitle: 'Posts, emails e roteiros' },
  { title: 'Integration Readiness', subtitle: 'Schemas, payloads e gates DRY_RUN_ONLY' },
  { title: 'Approval Ledger', subtitle: 'Aprovações, riscos e evidências locais' },
  { title: 'Beta Pipeline', subtitle: 'Estágios, prioridades e gates locais' },
  { title: 'Revenue Ledger', subtitle: 'Hipóteses, confirmações manuais e custos locais' },
  { title: 'Agent Operating Layer', subtitle: 'Seletores, playbooks e logs locais para agentes futuros' },
  { title: 'Command Center Tabs', subtitle: 'Workspace por abas para navegação local' },
];

const FLOWS = [
  {
    title: 'Criar Produto',
    body: 'Transforme uma ideia em oferta, público, promessa, entregáveis e checklist de aprovação.',
  },
  { title: 'Embalar Oferta', body: 'Prepare página, copy, assets e checkout blueprint sem ativar pagamentos reais.' },
  {
    title: 'Preparar Lançamento',
    body: 'Organize campanha, canais, conteúdo e próximos passos para execução manual-first.',
  },
];

const TEMPLATES = ['Página de venda', 'SaaS Starter', 'Loja afiliada', 'Curso digital', 'Dashboard', 'CRM de leads'];

export function PreChatHome({ importChat, productFactoryModes, setPrompt }: PreChatHomeProps) {
  const applyProductFactoryMode = (prompt: string) => {
    setPrompt(prompt);
    requestAnimationFrame(() => {
      document.querySelector<HTMLTextAreaElement>('#composer textarea')?.focus();
    });
  };

  const renderOperatorModule = (moduleKey: OperatorWorkspaceModuleKey) => {
    switch (moduleKey) {
      case 'ProductBuilderMVP':
        return <ProductBuilderMvp setPrompt={applyProductFactoryMode} />;
      case 'MarketplacePackGeneratorMVP':
        return <MarketplacePackGeneratorMvp setPrompt={applyProductFactoryMode} />;
      case 'CheckoutBlueprintMVP':
        return <CheckoutBlueprintMvp setPrompt={applyProductFactoryMode} />;
      case 'LandingBuilderMVP':
        return <LandingBuilderMvp setPrompt={applyProductFactoryMode} />;
      case 'ContentFactoryMVP':
        return <ContentFactoryMvp setPrompt={applyProductFactoryMode} />;
      case 'IntegrationReadinessMVP':
        return <IntegrationReadinessMvp setPrompt={applyProductFactoryMode} />;
      case 'ApprovalLedgerMVP':
        return <ApprovalLedgerMvp />;
      case 'BetaProductPipelineMVP':
        return <BetaProductPipelineMvp />;
      case 'RevenueLedgerMVP':
        return <RevenueLedgerMvp />;
      case 'AgentOperatingLayerMVP':
        return <AgentOperatingLayerMvp />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-2 pb-6 sm:px-6" data-gxeon-pre-chat-actions>
      <section
        data-testid="gxeon-product-factory-mode"
        className="mx-auto w-full max-w-chat rounded-2xl border border-[#d9a441]/20 bg-[#07080d]/90 p-3 shadow-[0_14px_44px_rgba(0,0,0,0.22)]"
        id="produto"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-bolt-elements-textPrimary" translate="no">
              Product Factory Mode
            </h2>
            <p className="text-xs text-bolt-elements-textSecondary">
              Botões preenchem o prompt do compositor real. Nada é enviado automaticamente e nenhuma API externa é
              chamada.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#d9a441]/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d9a441]">
            Manual
          </span>
        </div>
        <OperatorWorkspaceShell renderModule={renderOperatorModule} />
        <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-2">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#d9a441]">
            Legacy prompt presets
          </p>
          <div className="flex flex-wrap gap-2">
            {productFactoryModes.map((mode) => (
              <button
                key={mode.label}
                type="button"
                onClick={() => applyProductFactoryMode(mode.prompt)}
                className="rounded-full border border-[#d9a441]/18 bg-black/30 px-3 py-1.5 text-xs text-bolt-elements-textSecondary transition-theme hover:border-[#d9a441]/45 hover:bg-[#d9a441]/10 hover:text-bolt-elements-textPrimary"
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#05060a] p-2.5" aria-label="Machine status strip">
        <div className="flex flex-wrap items-center gap-2">
          {MACHINE_STATUS.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-white/62"
            >
              <span className="mr-1 text-[#d9a441]">●</span>
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-1.5">
        {ImportButtons(importChat)}
        <GitCloneButton importChat={importChat} />
      </div>

      <section id="modulos" className="rounded-2xl border border-white/10 bg-[#07080d] p-3">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a441]">Módulos</p>
            <h2 className="text-lg font-black text-white">Sistema compacto da forja</h2>
          </div>
          <span className="text-[11px] text-white/45">11 módulos + 6 abas</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((module) => (
            <article key={module.title} className="rounded-xl border border-[#d9a441]/14 bg-black/28 p-2.5">
              <h3 className="text-sm font-bold text-white" translate="no">
                {module.title}
              </h3>
              <p className="mt-1 text-xs text-white/55">{module.subtitle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3" id="roadmap">
        {FLOWS.map((flow) => (
          <article key={flow.title} className="rounded-2xl border border-white/10 bg-[#07080d] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d9a441]">Fluxo da Forja</p>
            <h3 className="mt-2 text-base font-black text-white">{flow.title}</h3>
            <p className="mt-1 text-xs leading-5 text-white/58">{flow.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#05060a] p-3" id="seguranca">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-white">Templates Compactos</h2>
          <span className="rounded-full border border-[#d9a441]/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d9a441]">
            Preview
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((template) => (
            <span
              key={template}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/65"
            >
              {template} <span className="text-[#d9a441]">Preview</span>
            </span>
          ))}
        </div>
      </section>

      <footer id="footer" className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-white/55">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="text-white" translate="no">
              GXEON Systems AI
            </strong>{' '}
            • Founder Preview • Roadmap • GitHub
          </div>
          <p>
            Based on open-source technology from <span translate="no">bolt.diy</span>. MIT license foundation preserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
