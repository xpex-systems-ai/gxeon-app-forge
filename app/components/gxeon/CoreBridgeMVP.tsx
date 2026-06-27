import React, { useMemo, useState } from 'react';
import { normalizeForgeProductReadyPayload } from '~/lib/gxeon/coreBridge';

export function CoreBridgeMvp() {
  const [needsWebhook, setNeedsWebhook] = useState(false);
  const payload = useMemo(
    () => normalizeForgeProductReadyPayload({ integrationRequest: { needsWebhook, needsProductMapping: true } }),
    [needsWebhook],
  );

  return (
    <section
      data-testid="gxeon-core-bridge-mvp"
      className="rounded-2xl border border-[#d9a441]/20 bg-[#07080d] p-3 text-white"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d9a441]">Core Bridge</p>
      <h3 className="text-base font-black">Contrato local dry-run</h3>
      <p className="mt-1 text-xs text-white/60">
        Preserva anchors booleanos do contrato sem executar APIs, webhooks, deploys, pagamentos ou publicações.
      </p>
      <label className="mt-3 flex items-center gap-2 text-xs">
        <input type="checkbox" checked={needsWebhook} onChange={(event) => setNeedsWebhook(event.target.checked)} />
        needsWebhook boolean contract anchor
      </label>
      <pre className="mt-3 max-h-52 overflow-auto rounded bg-black/40 p-2 text-[11px] text-white/70">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </section>
  );
}
