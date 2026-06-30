import { describe, expect, it } from 'vitest';
import {
  getOperatorWorkspaceSummary,
  getOperatorWorkspaceTabs,
  OPERATOR_WORKSPACE_MODULES,
  OPERATOR_WORKSPACE_TABS,
} from './operatorWorkspace';

describe('operator workspace metadata', () => {
  it('uses unique tab ids and includes all required tabs', () => {
    const ids = getOperatorWorkspaceTabs().map((tab) => tab.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(['create', 'package', 'monetize', 'validate', 'integrate', 'core', 'catalog', 'agent']);
  });

  it('assigns at least one module key to every tab and keeps Core/Product Catalog modules', () => {
    const tabs = getOperatorWorkspaceTabs();
    expect(tabs.every((tab) => tab.moduleKeys.length > 0)).toBe(true);
    expect(tabs.find((tab) => tab.id === 'core')?.moduleKeys).toEqual(['CoreBridgeMVP']);
    expect(tabs.find((tab) => tab.id === 'catalog')?.moduleKeys).toEqual(['ProductCatalogMVP']);
    expect(tabs.find((tab) => tab.id === 'package')?.moduleKeys).toContain('HotmartDistributionOSMVP');
  });

  it('returns accurate summary counts', () => {
    const summary = getOperatorWorkspaceSummary();
    expect(summary.tabCount).toBe(8);
    expect(summary.moduleCount).toBe(13);
    expect(summary.tabIds).toEqual([
      'create',
      'package',
      'monetize',
      'validate',
      'integrate',
      'core',
      'catalog',
      'agent',
    ]);
    expect(summary.moduleKeys).toContain('CoreBridgeMVP');
    expect(summary.moduleKeys).toContain('ProductCatalogMVP');
    expect(summary.moduleKeys).toContain('HotmartDistributionOSMVP');
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
