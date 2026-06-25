import { describe, expect, it } from 'vitest';
import { buildAgentActionLogJson, buildAgentActionLogMarkdown, stringifyAgentActionLogJson } from './agentActionLog';

describe('agentActionLog', () => {
  it('sanitizes secret-like fields and delimiter/control characters from exports', () => {
    const entries = [
      {
        commandId: 'api_key|token',
        module: 'payment\nmodule',
        actionLabel: 'credential export',
        operatorNotes: 'password|secret\u0000token',
        riskLevel: 'high' as const,
      },
    ];
    const json = stringifyAgentActionLogJson(entries);
    const markdown = buildAgentActionLogMarkdown(entries);
    expect(json).not.toMatch(/api_key|password|secret|token|credential|\u0000|\|/i);
    expect(markdown).not.toMatch(/api_key|password|secret|token|credential|\u0000|\|/i);
    expect(json).toContain('[redacted-field]');
  });

  it('includes local-only safety flags and updated timestamps in JSON exports', () => {
    const exportJson = buildAgentActionLogJson([{ actionLabel: 'Local review' }]);
    expect(exportJson.localOnly).toBe(true);
    expect(exportJson.safety).toMatchObject({
      agentReadyNotAutonomous: true,
      externalActionsBlocked: true,
      sensitiveDataExcluded: true,
    });
    expect(exportJson.entries[0].updatedAt).toBeTruthy();
  });
});
