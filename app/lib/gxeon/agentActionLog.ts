import type { AgentCommandRiskLevel } from './agentCommandMap';

export const AGENT_ACTION_LOG_STORAGE_KEY = 'gxeon.agentActionLog.entries.v1';
export type AgentActionLogStatus = 'planned' | 'completed_local' | 'needs_human_review' | 'blocked';
export interface AgentActionLogEntry {
  id: string;
  commandId: string;
  module: string;
  actionLabel: string;
  status: AgentActionLogStatus;
  riskLevel: AgentCommandRiskLevel;
  operatorNotes: string;
  createdAt: string;
}

const secretPattern = /(api[_-]?key|token|secret|credential|password|authorization|cookie|payment|card|customer)/gi;
const stripUnsafe = (value: unknown) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f|]+/g, ' ')
    .replace(secretPattern, '[redacted-field]')
    .slice(0, 800)
    .trim();

export function normalizeAgentActionLogEntry(entry: Partial<AgentActionLogEntry>): AgentActionLogEntry {
  const now = new Date().toISOString();
  return {
    id: stripUnsafe(entry.id) || `agent-log-${Date.now()}`,
    commandId: stripUnsafe(entry.commandId) || 'manual_local_note',
    module: stripUnsafe(entry.module) || 'agent_operating_layer',
    actionLabel: stripUnsafe(entry.actionLabel) || 'Manual local operation note',
    status: ['planned', 'completed_local', 'needs_human_review', 'blocked'].includes(String(entry.status))
      ? (entry.status as AgentActionLogStatus)
      : 'needs_human_review',
    riskLevel: ['low', 'medium', 'high', 'blocked'].includes(String(entry.riskLevel))
      ? (entry.riskLevel as AgentCommandRiskLevel)
      : 'low',
    operatorNotes: stripUnsafe(entry.operatorNotes),
    createdAt: stripUnsafe(entry.createdAt) || now,
  };
}

export function createAgentActionLogEntry(entry: Partial<AgentActionLogEntry>): AgentActionLogEntry {
  return normalizeAgentActionLogEntry({
    id: `agent-log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  });
}

export function summarizeAgentActionLogEntries(entries: AgentActionLogEntry[]) {
  return entries.reduce(
    (summary, entry) => ({ ...summary, total: summary.total + 1, [entry.status]: summary[entry.status] + 1 }),
    { total: 0, planned: 0, completed_local: 0, needs_human_review: 0, blocked: 0 },
  );
}

export function buildAgentActionLogJson(entries: Partial<AgentActionLogEntry>[]) {
  return {
    storageKey: AGENT_ACTION_LOG_STORAGE_KEY,
    localOnly: true,
    entries: entries.map(normalizeAgentActionLogEntry),
  };
}
export function stringifyAgentActionLogJson(entries: Partial<AgentActionLogEntry>[]) {
  return JSON.stringify(buildAgentActionLogJson(entries), null, 2);
}
export function buildAgentActionLogMarkdown(entries: Partial<AgentActionLogEntry>[]) {
  const normalized = entries.map(normalizeAgentActionLogEntry);
  return [
    '# GXEON Agent Action Log',
    '',
    'Local-only manual operation log. No external actions were executed.',
    '',
    ...normalized.map(
      (e) =>
        `- ${e.createdAt} — ${e.module} — ${e.actionLabel} — ${e.status} — ${e.riskLevel} — ${e.operatorNotes || 'No notes'}`,
    ),
  ].join('\n');
}
