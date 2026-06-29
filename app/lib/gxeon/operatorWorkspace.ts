export type OperatorWorkspaceTabId =
  | 'create'
  | 'package'
  | 'monetize'
  | 'validate'
  | 'integrate'
  | 'core'
  | 'catalog'
  | 'distribution'
  | 'agent';

export type OperatorWorkspaceModuleKey =
  | 'ProductBuilderMVP'
  | 'MarketplacePackGeneratorMVP'
  | 'CheckoutBlueprintMVP'
  | 'LandingBuilderMVP'
  | 'ContentFactoryMVP'
  | 'IntegrationReadinessMVP'
  | 'CoreBridgeMVP'
  | 'ProductCatalogMVP'
  | 'hotmartDistribution'
  | 'ApprovalLedgerMVP'
  | 'BetaProductPipelineMVP'
  | 'RevenueLedgerMVP'
  | 'AgentOperatingLayerMVP';

export interface OperatorWorkspaceModuleDefinition {
  key: OperatorWorkspaceModuleKey;
  label: string;
  description: string;
  localOnly: true;
  humanApprovalRequired: true;
}

export interface OperatorWorkspaceTabDefinition {
  id: OperatorWorkspaceTabId;
  label: string;
  description: string;
  moduleKeys: OperatorWorkspaceModuleKey[];
  safetyNote: string;
}

export interface OperatorWorkspaceSummary {
  tabCount: number;
  moduleCount: number;
  tabIds: OperatorWorkspaceTabId[];
  moduleKeys: OperatorWorkspaceModuleKey[];
}

export const OPERATOR_WORKSPACE_MODULES: readonly OperatorWorkspaceModuleDefinition[] = [
  {
    key: 'ProductBuilderMVP',
    label: 'Product Builder',
    description: 'Oferta, avatar, promessa, entregáveis e checklist de aprovação.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'MarketplacePackGeneratorMVP',
    label: 'Marketplace Pack Generator',
    description: 'Packs comerciais e assets para marketplaces sem clientes de API reais.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'LandingBuilderMVP',
    label: 'Landing Builder',
    description: 'Estrutura manual-first para páginas de venda e captura.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'ContentFactoryMVP',
    label: 'Content Factory',
    description: 'Campanhas, posts, emails e roteiros preparados para execução manual.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'CheckoutBlueprintMVP',
    label: 'Checkout Blueprint',
    description: 'Preço, plano e pós-compra como blueprint; pagamentos permanecem desativados.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'RevenueLedgerMVP',
    label: 'Revenue Ledger',
    description: 'Hipóteses, confirmações manuais e custos locais.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'ApprovalLedgerMVP',
    label: 'Approval Ledger',
    description: 'Aprovações, riscos e evidências locais.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'BetaProductPipelineMVP',
    label: 'Beta Product Pipeline',
    description: 'Estágios, prioridades e gates locais de validação beta.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'IntegrationReadinessMVP',
    label: 'Integration Readiness',
    description: 'Schemas, payloads e gates DRY_RUN_ONLY para integrações futuras.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'CoreBridgeMVP',
    label: 'Core Bridge',
    description: 'Contrato local dry-run para futuras integrações Core sem ações externas.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'ProductCatalogMVP',
    label: 'Product Catalog',
    description: 'Catálogo consolidado local com imports explícitos e revisão humana.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'hotmartDistribution',
    label: 'Hotmart Distribution OS',
    description: 'Produtos, kits de afiliado e drafts Hotmart manual-first.',
    localOnly: true,
    humanApprovalRequired: true,
  },
  {
    key: 'AgentOperatingLayerMVP',
    label: 'Agent Operating Layer',
    description: 'Seletores, command map, playbooks, blocked actions e logs locais.',
    localOnly: true,
    humanApprovalRequired: true,
  },
] as const;

export const OPERATOR_WORKSPACE_TABS: readonly OperatorWorkspaceTabDefinition[] = [
  {
    id: 'create',
    label: 'Criar',
    description: 'Transforme ideias brutas em blueprints de produto.',
    moduleKeys: ['ProductBuilderMVP'],
    safetyNote: 'Navegação local; nenhuma geração automática ou envio ao Composer.',
  },
  {
    id: 'package',
    label: 'Embalar',
    description: 'Prepare marketplace, landing e campanha sem integrações externas.',
    moduleKeys: ['MarketplacePackGeneratorMVP', 'LandingBuilderMVP', 'ContentFactoryMVP'],
    safetyNote: 'Assets são preparados localmente; publicação e envio seguem manuais.',
  },
  {
    id: 'monetize',
    label: 'Monetizar',
    description: 'Planeje checkout e acompanhe hipóteses de receita locais.',
    moduleKeys: ['CheckoutBlueprintMVP', 'RevenueLedgerMVP'],
    safetyNote: 'Pagamentos e links de checkout reais permanecem bloqueados.',
  },
  {
    id: 'validate',
    label: 'Validar',
    description: 'Registre aprovações, estágios beta, riscos e evidências.',
    moduleKeys: ['ApprovalLedgerMVP', 'BetaProductPipelineMVP'],
    safetyNote: 'Validação local com gates humanos; nenhuma aprovação autônoma.',
  },
  {
    id: 'integrate',
    label: 'Integrar',
    description: 'Prepare blueprints seguros de integração em DRY_RUN_ONLY.',
    moduleKeys: ['IntegrationReadinessMVP'],
    safetyNote: 'Sem webhooks, execuções n8n conectadas, OAuth, credenciais ou chamadas de API.',
  },
  {
    id: 'core',
    label: 'Core',
    description: 'Revise o contrato Core Bridge local antes de qualquer integração real futura.',
    moduleKeys: ['CoreBridgeMVP'],
    safetyNote: 'Core Bridge permanece local-only, dry-run-only e exige aprovação humana.',
  },
  {
    id: 'catalog',
    label: 'Catálogo',
    description: 'Consolide produtos e assets locais antes de distribuição manual.',
    moduleKeys: ['ProductCatalogMVP'],
    safetyNote: 'Importações leem localStorage somente após clique e exigem revisão humana.',
  },
  {
    id: 'distribution',
    label: 'Distribuir',
    description: 'Produtos preparados para Hotmart, afiliados e gestores de tráfego.',
    moduleKeys: ['hotmartDistribution'],
    safetyNote: 'Gera drafts locais para publicação manual; sem Hotmart API, checkout, tokens ou envio externo.',
  },
  {
    id: 'agent',
    label: 'Agente',
    description: 'Exiba metadados agent-ready, playbooks, ações bloqueadas e logs locais.',
    moduleKeys: ['AgentOperatingLayerMVP'],
    safetyNote: 'Camada agent-ready informativa; nenhum agente autônomo é executado.',
  },
] as const;

export function getOperatorWorkspaceTabs(): OperatorWorkspaceTabDefinition[] {
  return OPERATOR_WORKSPACE_TABS.map((tab) => ({ ...tab, moduleKeys: [...tab.moduleKeys] }));
}

export function findOperatorWorkspaceTab(id: OperatorWorkspaceTabId) {
  return getOperatorWorkspaceTabs().find((tab) => tab.id === id);
}

export function getOperatorWorkspaceSummary(): OperatorWorkspaceSummary {
  const tabs = getOperatorWorkspaceTabs();
  const moduleKeys = Array.from(new Set(tabs.flatMap((tab) => tab.moduleKeys)));

  return { tabCount: tabs.length, moduleCount: moduleKeys.length, tabIds: tabs.map((tab) => tab.id), moduleKeys };
}
