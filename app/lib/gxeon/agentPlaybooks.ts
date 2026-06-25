export interface AgentPlaybookDefinition {
  id: string;
  title: string;
  targetModule: string;
  selectorHints: string[];
  steps: string[];
  expectedLocalOutput: string;
  stopCondition: string;
}

const review = 'Stop for human approval or review before any external action.';
export const AGENT_PLAYBOOKS: AgentPlaybookDefinition[] = [
  [
    'create_product_from_idea',
    'Create product from idea',
    'Product Builder',
    ['gxeon-product-builder-generate'],
    ['Open Product Builder.', 'Fill local draft fields.', 'Generate local blueprint.', review],
    'Product blueprint draft saved or copied locally.',
  ],
  [
    'package_product_for_marketplace',
    'Package product for marketplace',
    'Marketplace Pack',
    ['gxeon-marketplace-pack-import-product', 'gxeon-marketplace-pack-generate'],
    ['Import local product draft.', 'Generate pack metadata locally.', review],
    'Marketplace pack copy and checklist.',
  ],
  [
    'prepare_checkout_blueprint',
    'Prepare checkout blueprint',
    'Checkout Blueprint',
    ['gxeon-checkout-blueprint-export-json'],
    ['Fill pricing fields.', 'Export JSON locally.', review],
    'Checkout blueprint JSON; no checkout activation.',
  ],
  [
    'prepare_landing_blueprint',
    'Prepare landing blueprint',
    'Landing Builder',
    ['gxeon-landing-builder-copy-markdown'],
    ['Generate landing draft.', 'Copy Markdown locally.', review],
    'Landing page Markdown for manual implementation.',
  ],
  [
    'prepare_content_campaign',
    'Prepare content campaign',
    'Content Factory',
    ['gxeon-content-factory-generate'],
    ['Fill campaign goal.', 'Generate local content pack.', review],
    'Local content drafts; no send or post action.',
  ],
  [
    'prepare_integration_dry_run',
    'Prepare integration dry run',
    'Integration Readiness',
    ['gxeon-integration-readiness-dry-run'],
    ['Describe integration goal.', 'Run dry-run checklist only.', review],
    'Schema and payload notes for review only.',
  ],
  [
    'register_approval',
    'Register approval',
    'Approval Ledger',
    ['gxeon-approval-ledger-add-entry'],
    ['Add evidence notes.', 'Set risk and approval status.', review],
    'Local approval ledger entry.',
  ],
  [
    'move_to_beta_pipeline',
    'Move to beta pipeline',
    'Beta Product Pipeline',
    ['gxeon-beta-pipeline-add-item'],
    ['Add local pipeline item.', 'Set current stage.', review],
    'Local beta pipeline item.',
  ],
  [
    'register_revenue_hypothesis',
    'Register revenue hypothesis',
    'Revenue Ledger',
    ['gxeon-revenue-ledger-add-entry'],
    ['Add planned revenue hypothesis.', 'Attach manual evidence notes only.', review],
    'Local revenue hypothesis entry.',
  ],
].map(([id, title, targetModule, selectorHints, steps, expectedLocalOutput]) => ({
  id: id as string,
  title: title as string,
  targetModule: targetModule as string,
  selectorHints: selectorHints as string[],
  steps: steps as string[],
  expectedLocalOutput: expectedLocalOutput as string,
  stopCondition: review,
}));
