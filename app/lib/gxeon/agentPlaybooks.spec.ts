import { describe, expect, it } from 'vitest';
import { AGENT_PLAYBOOKS } from './agentPlaybooks';

describe('agentPlaybooks', () => {
  it('defines required data-only playbooks that stop for human approval or review', () => {
    expect(AGENT_PLAYBOOKS.map((p) => p.id)).toEqual(
      expect.arrayContaining([
        'create_product_from_idea',
        'package_product_for_marketplace',
        'prepare_checkout_blueprint',
        'prepare_landing_blueprint',
        'prepare_content_campaign',
        'prepare_integration_dry_run',
        'register_approval',
        'move_to_beta_pipeline',
        'register_revenue_hypothesis',
      ]),
    );

    for (const playbook of AGENT_PLAYBOOKS) {
      expect(playbook.selectorHints.every((selector) => selector.startsWith('gxeon-'))).toBe(true);
      expect(`${playbook.steps.at(-1)} ${playbook.stopCondition}`).toMatch(/human approval|review/i);
    }
  });
  it('does not include external execution actions', () => {
    const text = JSON.stringify(AGENT_PLAYBOOKS).toLowerCase();
    expect(text).not.toMatch(
      /external api|payment processing|auto publish|send email|send whatsapp|social post|webhook execution|marketplace deploy/,
    );
  });
});
