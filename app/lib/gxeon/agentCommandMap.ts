export type AgentCommandCategory =
  | 'product_builder'
  | 'marketplace_pack'
  | 'checkout_blueprint'
  | 'landing_builder'
  | 'content_factory'
  | 'integration_readiness'
  | 'approval_ledger'
  | 'beta_product_pipeline'
  | 'revenue_ledger'
  | 'agent_operating_layer'
  | 'blocked_external_action';

export type AgentCommandRiskLevel = 'low' | 'medium' | 'high' | 'blocked';

export interface AgentCommandDefinition {
  id: string;
  label: string;
  module: AgentCommandCategory;
  selector: string;
  description: string;
  riskLevel: AgentCommandRiskLevel;
  requiresHumanApproval: boolean;
  localOnly: boolean;
  externalActionBlocked: boolean;
}

const safe = (
  id: string,
  label: string,
  module: AgentCommandCategory,
  selector: string,
  description: string,
  riskLevel: AgentCommandRiskLevel = 'low',
  requiresHumanApproval = true,
): AgentCommandDefinition => ({
  id,
  label,
  module,
  selector,
  description,
  riskLevel,
  requiresHumanApproval,
  localOnly: true,
  externalActionBlocked: true,
});

export const AGENT_COMMAND_DEFINITIONS: AgentCommandDefinition[] = [
  safe(
    'product_builder_generate_local_blueprint',
    'Generate local product blueprint',
    'product_builder',
    'gxeon-product-builder-generate',
    'Creates a local draft in the Product Builder UI only.',
  ),
  safe(
    'product_builder_save_local_draft',
    'Save local product draft',
    'product_builder',
    'gxeon-product-builder-save-draft',
    'Persists the product draft in browser localStorage only.',
  ),
  safe(
    'marketplace_pack_import_product',
    'Import local product draft',
    'marketplace_pack',
    'gxeon-marketplace-pack-import-product',
    'Reads the local Product Builder draft and fills local pack fields.',
    'medium',
  ),
  safe(
    'marketplace_pack_generate_local',
    'Generate local marketplace pack',
    'marketplace_pack',
    'gxeon-marketplace-pack-generate',
    'Creates marketplace copy and metadata without marketplace API clients.',
    'medium',
  ),
  safe(
    'checkout_blueprint_export_json',
    'Export checkout blueprint JSON',
    'checkout_blueprint',
    'gxeon-checkout-blueprint-export-json',
    'Downloads a local checkout blueprint JSON file; it does not activate checkout.',
    'medium',
  ),
  safe(
    'landing_builder_copy_markdown',
    'Copy landing blueprint Markdown',
    'landing_builder',
    'gxeon-landing-builder-copy-markdown',
    'Copies landing copy for manual review only.',
  ),
  safe(
    'content_factory_generate_local',
    'Generate local content pack',
    'content_factory',
    'gxeon-content-factory-generate',
    'Creates local campaign content drafts without sending or posting.',
    'medium',
  ),
  safe(
    'integration_readiness_dry_run',
    'Run integration dry-run checklist',
    'integration_readiness',
    'gxeon-integration-readiness-dry-run',
    'Builds schemas and payload notes for human review; no webhook or n8n connection is made.',
    'high',
  ),
  safe(
    'approval_ledger_add_entry',
    'Add local approval entry',
    'approval_ledger',
    'gxeon-approval-ledger-add-entry',
    'Adds a local approval ledger entry requiring operator review.',
    'medium',
  ),
  safe(
    'beta_pipeline_add_item',
    'Add local beta pipeline item',
    'beta_product_pipeline',
    'gxeon-beta-pipeline-add-item',
    'Adds or updates a local beta pipeline status only.',
    'medium',
  ),
  safe(
    'revenue_ledger_add_entry',
    'Add local revenue hypothesis',
    'revenue_ledger',
    'gxeon-revenue-ledger-add-entry',
    'Adds a planned or manually confirmed revenue hypothesis without payment processing.',
    'high',
  ),
  safe(
    'agent_log_add_manual_entry',
    'Add manual agent action log entry',
    'agent_operating_layer',
    'gxeon-agent-layer-add-log-entry',
    'Records a manual local-only operation log entry.',
    'low',
  ),
];

export const BLOCKED_AGENT_COMMAND_DEFINITIONS: AgentCommandDefinition[] = [
  'publish',
  'payment',
  'checkout activation',
  'API call',
  'webhook',
  'email',
  'WhatsApp',
  'social post',
  'marketplace deploy',
].map((label) =>
  safe(
    `blocked_${label.toLowerCase().replace(/\s+/g, '_')}`,
    `Blocked: ${label}`,
    'blocked_external_action',
    `gxeon-agent-blocked-${label.toLowerCase().replace(/\s+/g, '-')}`,
    `${label} is intentionally blocked in the agent-ready layer and must remain a human-approved external process outside this MVP.`,
    'blocked',
    true,
  ),
);

export const ALL_AGENT_COMMAND_DEFINITIONS = [...AGENT_COMMAND_DEFINITIONS, ...BLOCKED_AGENT_COMMAND_DEFINITIONS];

export function groupAgentCommandsByModule(commands = AGENT_COMMAND_DEFINITIONS) {
  return commands.reduce<Record<string, AgentCommandDefinition[]>>((groups, command) => {
    groups[command.module] = [...(groups[command.module] || []), command];
    return groups;
  }, {});
}
