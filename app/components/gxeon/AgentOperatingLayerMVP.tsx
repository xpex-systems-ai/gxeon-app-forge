import React, { useMemo, useState } from 'react';
import {
  BLOCKED_AGENT_COMMAND_DEFINITIONS,
  groupAgentCommandsByModule,
  type AgentCommandDefinition,
} from '~/lib/gxeon/agentCommandMap';
import {
  AGENT_ACTION_LOG_STORAGE_KEY,
  buildAgentActionLogMarkdown,
  createAgentActionLogEntry,
  normalizeAgentActionLogEntry,
  stringifyAgentActionLogJson,
  summarizeAgentActionLogEntries,
  type AgentActionLogEntry,
} from '~/lib/gxeon/agentActionLog';
import { AGENT_PLAYBOOKS } from '~/lib/gxeon/agentPlaybooks';

const fieldClass =
  'rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-[#d9a441]/60';
const emptyForm = () =>
  createAgentActionLogEntry({
    commandId: 'manual_local_note',
    module: 'agent_operating_layer',
    actionLabel: 'Manual local operation note',
    status: 'needs_human_review',
    riskLevel: 'low',
  });

export function AgentOperatingLayerMvp() {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<AgentActionLogEntry[]>([]);
  const [form, setForm] = useState<AgentActionLogEntry>(() => emptyForm());
  const [status, setStatus] = useState('Agent-ready UI layer is local-only. External actions remain blocked.');
  const grouped = useMemo(() => groupAgentCommandsByModule(), []);
  const summary = useMemo(() => summarizeAgentActionLogEntries(entries), [entries]);
  const updateForm = (patch: Partial<AgentActionLogEntry>) =>
    setForm((cur) => normalizeAgentActionLogEntry({ ...cur, ...patch }));
  const addEntry = (command?: AgentCommandDefinition) => {
    setEntries((cur) => [
      createAgentActionLogEntry(
        command
          ? {
              commandId: command.id,
              module: command.module,
              actionLabel: command.label,
              riskLevel: command.riskLevel,
              status: 'needs_human_review',
              operatorNotes: 'Manual local log from command map.',
            }
          : form,
      ),
      ...cur,
    ]);
    setForm(emptyForm());
    setStatus('Manual action log entry added locally; save to browser localStorage if needed.');
  };
  const saveLog = () => {
    window.localStorage.setItem(AGENT_ACTION_LOG_STORAGE_KEY, stringifyAgentActionLogJson(entries));
    setStatus('Agent action log saved locally in this browser only.');
  };
  const loadLog = () => {
    const raw = window.localStorage.getItem(AGENT_ACTION_LOG_STORAGE_KEY);

    if (!raw) {
      setStatus('No saved local agent action log found.');
      return;
    }

    const parsed = JSON.parse(raw);
    setEntries(
      (parsed.entries || parsed || []).map((entry: Partial<AgentActionLogEntry>) =>
        normalizeAgentActionLogEntry(entry),
      ),
    );
    setStatus('Agent action log loaded from localStorage only.');
  };
  const exportJson = () => {
    const blob = new Blob([stringifyAgentActionLogJson(entries)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gxeon-agent-action-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Agent action log JSON exported via browser download only.');
  };
  const copyMarkdown = async () => {
    const markdown = buildAgentActionLogMarkdown(entries);

    try {
      await navigator.clipboard.writeText(markdown);
      setStatus('Agent action log Markdown copied locally.');
    } catch {
      setStatus('Clipboard unavailable; JSON export remains local-only.');
    }
  };
  const clearLog = () => {
    window.localStorage.removeItem(AGENT_ACTION_LOG_STORAGE_KEY);
    setEntries([]);
    setStatus('Only the Agent Action Log localStorage key was cleared.');
  };

  return (
    <section
      className="my-3 rounded-2xl border border-[#d9a441]/25 bg-[#05060a] p-3 text-white"
      id="agent-operating-layer"
      data-testid="gxeon-agent-operating-layer-container"
    >
      <button
        type="button"
        data-testid="gxeon-agent-operating-layer-toggle"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a441]">
            Agent Operating Layer MVP
          </span>
          <br />
          <span className="text-sm font-black">Agent-ready, not agent-autonomous</span>
        </span>
        <span className="rounded-full border border-[#d9a441]/30 px-2 py-1 text-xs text-[#d9a441]">
          {isOpen ? 'Close' : 'Open'}
        </span>
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3 text-xs">
          <div className="grid gap-2 md:grid-cols-4">
            {['Selectors ready', 'Playbooks ready', 'Logs local-only', 'External actions blocked'].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-[#d9a441]/20 bg-black/40 p-2 font-bold text-[#d9a441]"
              >
                ● {item}
              </div>
            ))}
          </div>
          <p className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-2 text-amber-100">{status}</p>
          <div className="grid gap-2 md:grid-cols-3">
            <input
              data-testid="gxeon-agent-layer-command-id"
              className={fieldClass}
              value={form.commandId}
              onChange={(e) => updateForm({ commandId: e.target.value })}
            />
            <input
              data-testid="gxeon-agent-layer-action-label"
              className={fieldClass}
              value={form.actionLabel}
              onChange={(e) => updateForm({ actionLabel: e.target.value })}
            />
            <input
              data-testid="gxeon-agent-layer-module"
              className={fieldClass}
              value={form.module}
              onChange={(e) => updateForm({ module: e.target.value })}
            />
            <textarea
              data-testid="gxeon-agent-layer-operator-notes"
              className={`${fieldClass} md:col-span-3`}
              value={form.operatorNotes}
              onChange={(e) => updateForm({ operatorNotes: e.target.value })}
              placeholder="Operator notes; do not paste secrets, keys, payment data or customer sensitive data."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button data-testid="gxeon-agent-layer-add-log-entry" className={fieldClass} onClick={() => addEntry()}>
              Add Manual Log
            </button>
            <button data-testid="gxeon-agent-layer-save-log" className={fieldClass} onClick={saveLog}>
              Save Log
            </button>
            <button data-testid="gxeon-agent-layer-load-log" className={fieldClass} onClick={loadLog}>
              Load Log
            </button>
            <button data-testid="gxeon-agent-layer-export-json" className={fieldClass} onClick={exportJson}>
              Export JSON
            </button>
            <button data-testid="gxeon-agent-layer-copy-markdown" className={fieldClass} onClick={copyMarkdown}>
              Copy Markdown
            </button>
            <button data-testid="gxeon-agent-layer-clear-log" className={fieldClass} onClick={clearLog}>
              Clear Log
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-5">
            {Object.entries(summary).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-black/30 p-2">
                <p className="text-white/45">{k}</p>
                <p className="text-[#d9a441]">{v}</p>
              </div>
            ))}
          </div>
          {Object.entries(grouped).map(([module, commands]) => (
            <div key={module} className="rounded-xl border border-white/10 bg-black/30 p-2">
              <h4 className="font-bold text-[#d9a441]">{module}</h4>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {commands.map((command) => (
                  <button
                    key={command.id}
                    type="button"
                    data-testid={`gxeon-agent-command-${command.id}`}
                    onClick={() => addEntry(command)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-left hover:border-[#d9a441]/50"
                  >
                    <strong>{command.label}</strong>
                    <br />
                    <span className="text-white/55">{command.selector} · local-only · approval required</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-2">
            <h4 className="font-bold text-red-100">Blocked actions</h4>
            {BLOCKED_AGENT_COMMAND_DEFINITIONS.map((command) => (
              <span
                key={command.id}
                data-testid={command.selector}
                className="mr-2 mt-2 inline-block rounded-full border border-red-300/30 px-2 py-1 text-red-100"
              >
                {command.label}
              </span>
            ))}
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-2">
            <h4 className="font-bold text-[#d9a441]">Agent-safe playbooks</h4>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              {AGENT_PLAYBOOKS.map((playbook) => (
                <article key={playbook.id} className="rounded-lg border border-white/10 p-2">
                  <strong>{playbook.title}</strong>
                  <p className="text-white/55">{playbook.stopCondition}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
