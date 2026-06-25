import { describe, expect, it } from 'vitest';
import {
  AGENT_COMMAND_DEFINITIONS,
  ALL_AGENT_COMMAND_DEFINITIONS,
  BLOCKED_AGENT_COMMAND_DEFINITIONS,
} from './agentCommandMap';

describe('agentCommandMap', () => {
  it('keeps command definitions local-only with stable selectors', () => {
    expect(AGENT_COMMAND_DEFINITIONS.length).toBeGreaterThan(8);

    for (const command of ALL_AGENT_COMMAND_DEFINITIONS) {
      expect(command.localOnly).toBe(true);
      expect(command.externalActionBlocked).toBe(true);
      expect(command.requiresHumanApproval).toBe(true);
      expect(command.selector).toMatch(/^gxeon-[a-z0-9-]+$/);
    }
  });
  it('marks blocked external operations as blocked', () => {
    expect(BLOCKED_AGENT_COMMAND_DEFINITIONS.map((c) => c.label).join(' ')).toMatch(
      /publish|payment|webhook|email|WhatsApp|social post|marketplace deploy/i,
    );

    for (const command of BLOCKED_AGENT_COMMAND_DEFINITIONS) {
      expect(command.riskLevel).toBe('blocked');
    }
  });
});
