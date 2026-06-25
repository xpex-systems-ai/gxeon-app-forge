import React, { useMemo, useState } from 'react';
import {
  findOperatorWorkspaceTab,
  getOperatorWorkspaceSummary,
  getOperatorWorkspaceTabs,
  type OperatorWorkspaceModuleKey,
  type OperatorWorkspaceTabId,
} from '~/lib/gxeon/operatorWorkspace';

interface OperatorWorkspaceShellProps {
  renderModule: (moduleKey: OperatorWorkspaceModuleKey) => React.ReactNode;
}

const QUICK_ACTIONS: { label: string; tabId: OperatorWorkspaceTabId; testId: string }[] = [
  { label: 'Criar Produto', tabId: 'create', testId: 'gxeon-operator-quick-create-product' },
  { label: 'Catálogo', tabId: 'catalog', testId: 'gxeon-operator-quick-catalog' },
  { label: 'Embalar Oferta', tabId: 'package', testId: 'gxeon-operator-quick-package-offer' },
  { label: 'Catálogo', tabId: 'catalog', testId: 'gxeon-operator-quick-catalog' },
  { label: 'Preparar Checkout', tabId: 'monetize', testId: 'gxeon-operator-quick-prepare-checkout' },
  { label: 'Criar Landing', tabId: 'package', testId: 'gxeon-operator-quick-create-landing' },
  { label: 'Criar Conteúdo', tabId: 'package', testId: 'gxeon-operator-quick-create-content' },
  { label: 'Validar', tabId: 'validate', testId: 'gxeon-operator-quick-validate' },
  { label: 'Receita', tabId: 'monetize', testId: 'gxeon-operator-quick-revenue' },
  { label: 'Agente', tabId: 'agent', testId: 'gxeon-operator-quick-agent' },
];

const SAFETY_STRIP = ['Manual-first', 'Local-only', 'Human approval', 'External actions blocked'];

export function OperatorWorkspaceShell({ renderModule }: OperatorWorkspaceShellProps) {
  const tabs = useMemo(() => getOperatorWorkspaceTabs(), []);
  const summary = useMemo(() => getOperatorWorkspaceSummary(), []);
  const [activeTabId, setActiveTabId] = useState<OperatorWorkspaceTabId>('create');
  const activeTab = findOperatorWorkspaceTab(activeTabId) ?? tabs[0];

  return (
    <div
      data-testid="gxeon-operator-workspace-shell"
      className="mt-3 rounded-2xl border border-[#d9a441]/25 bg-black/35 p-2.5 shadow-[inset_0_1px_0_rgba(217,164,65,0.12)]"
    >
      <div className="mb-2 flex flex-col gap-2 rounded-xl border border-[#d9a441]/15 bg-[#090a0f] p-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d9a441]">Command Center Tabs</p>
          <h3 className="mt-1 text-base font-black text-white">Operator Workspace</h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/58">
            {summary.moduleCount} módulos preservados em {summary.tabCount} abas de navegação local. As abas só
            organizam a forja; ações internas continuam manuais e dentro de cada módulo.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAFETY_STRIP.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#d9a441]/18 bg-[#d9a441]/8 px-2 py-1 text-[10px] font-bold text-[#f4d58d]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="GXEON Operator Workspace tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`gxeon-operator-tab-${tab.id}`}
              onClick={() => setActiveTabId(tab.id)}
              className={`min-w-[112px] rounded-xl border px-3 py-2 text-left transition-theme ${
                isActive
                  ? 'border-[#d9a441]/70 bg-[#d9a441]/14 text-white shadow-[0_0_0_1px_rgba(217,164,65,0.16)]'
                  : 'border-white/10 bg-white/[0.03] text-white/58 hover:border-[#d9a441]/35 hover:text-white'
              }`}
            >
              <span className="block text-xs font-black">{tab.label}</span>
              <span className="mt-0.5 block text-[10px] text-white/45">{tab.moduleKeys.length} módulo(s)</span>
            </button>
          );
        })}
      </div>

      <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.025] p-2.5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d9a441]">{activeTab.label}</p>
            <p className="text-xs leading-5 text-white/62">{activeTab.description}</p>
          </div>
          <p className="max-w-md text-[11px] leading-5 text-white/45">{activeTab.safetyNote}</p>
        </div>
      </div>

      <div className="mb-2 rounded-xl border border-[#d9a441]/14 bg-black/30 p-2" aria-label="Operator quick actions">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#d9a441]">
          Quick actions — navegação
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.testId}
              type="button"
              data-testid={action.testId}
              onClick={() => setActiveTabId(action.tabId)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/62 transition-theme hover:border-[#d9a441]/35 hover:text-white"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3" role="tabpanel" aria-label={`Workspace ${activeTab.label}`}>
        {activeTab.moduleKeys.map((moduleKey) => (
          <React.Fragment key={moduleKey}>{renderModule(moduleKey)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
