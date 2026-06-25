import { describe, expect, it } from 'vitest';
import {
  getOperatorWorkspaceSummary,
  getOperatorWorkspaceTabs,
  OPERATOR_WORKSPACE_MODULES,
  OPERATOR_WORKSPACE_TABS,
} from './operatorWorkspace';

describe('operator workspace metadata', () => {
  it('uses unique tab ids and includes the Core tab', () => {
    const tabs = getOperatorWorkspaceTabs();
    const ids = tabs.map((tab) => tab.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(['create', 'catalog', 'package', 'monetize', 'validate', 'integrate', 'core', 'agent']);
  });

  it('assigns at least one module key to every tab', () => {
    expect(getOperatorWorkspaceTabs().every((tab) => tab.moduleKeys.length > 0)).toBe(true);
  });

  it('returns accurate summary counts and includes Core Bridge', () => {
    const summary = getOperatorWorkspaceSummary();

    expect(summary.tabCount).toBe(8);
    expect(summary.moduleCount).toBe(12);
    expect(summary.moduleKeys).toContain('CoreBridgeMVP');
    expect(summary.tabIds).toContain('core');
  });

  it('marks Core Bridge local-only with human approval required', () => {
    const coreModule = OPERATOR_WORKSPACE_MODULES.find((module) => module.key === 'CoreBridgeMVP');
    const coreTab = OPERATOR_WORKSPACE_TABS.find((tab) => tab.id === 'core');

    expect(coreModule).toMatchObject({ label: 'Core Bridge', localOnly: true, humanApprovalRequired: true });
    expect(coreTab?.moduleKeys).toEqual(['CoreBridgeMVP']);
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
    ];

    for (const claim of forbiddenClaims) {
      expect(serialized).not.toContain(claim);
    }
  });
});
