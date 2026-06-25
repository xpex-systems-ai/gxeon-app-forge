import { describe, expect, it } from 'vitest';
import {
  getOperatorWorkspaceSummary,
  getOperatorWorkspaceTabs,
  OPERATOR_WORKSPACE_MODULES,
  OPERATOR_WORKSPACE_TABS,
} from './operatorWorkspace';

describe('operator workspace metadata', () => {
  it('uses unique tab ids and includes all required tabs', () => {
    const tabs = getOperatorWorkspaceTabs();
    const ids = tabs.map((tab) => tab.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(['create', 'catalog', 'package', 'monetize', 'validate', 'integrate', 'agent']);
    expect(ids).toEqual(['create', 'package', 'catalog', 'monetize', 'validate', 'integrate', 'agent']);
  });

  it('assigns at least one module key to every tab', () => {
    expect(getOperatorWorkspaceTabs().every((tab) => tab.moduleKeys.length > 0)).toBe(true);
  });

  it('returns accurate summary counts', () => {
    const summary = getOperatorWorkspaceSummary();

    expect(summary.tabCount).toBe(7);
    expect(summary.moduleCount).toBe(11);
    expect(summary.tabIds).toEqual(['create', 'catalog', 'package', 'monetize', 'validate', 'integrate', 'agent']);
    expect(summary.tabIds).toEqual(['create', 'package', 'catalog', 'monetize', 'validate', 'integrate', 'agent']);
  });

  it('is data-only and contains no executable action handlers', () => {
    const metadata = [...OPERATOR_WORKSPACE_TABS, ...OPERATOR_WORKSPACE_MODULES];

    for (const item of metadata) {
      expect(Object.values(item).some((value) => typeof value === 'function')).toBe(false);
    }
  });

  it('does not claim forbidden external action capabilities', () => {
    const serialized = JSON.stringify({
      tabs: OPERATOR_WORKSPACE_TABS,
      modules: OPERATOR_WORKSPACE_MODULES,
    }).toLowerCase();
    const forbiddenClaims = [
      'payment processing',
      'live api execution',
      'autonomous agent',
      'auto-publishing',
      'auto publishing',
      'checkout activation',
      'webhook execution',
      'n8n live',
      'social posting',
      'email sending',
      'whatsapp sending',
      'marketplace integration',
    ];

    for (const claim of forbiddenClaims) {
      expect(serialized).not.toContain(claim);
    }
  });
});
