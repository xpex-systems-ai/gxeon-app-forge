import React from 'react';
import { ImportButtons } from '~/components/chat/chatExportAndImport/ImportButtons';
import GitCloneButton from './GitCloneButton';
import { ExamplePrompts } from '~/components/chat/ExamplePrompts';
import StarterTemplates from './StarterTemplates';
import type { Message } from 'ai';

interface ProductFactoryMode {
  label: string;
  prompt: string;
}

interface PreChatHomeProps {
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  productFactoryModes: ProductFactoryMode[];
  setPrompt: (prompt: string) => void;
  sendExamplePrompt: (event: React.UIEvent, messageInput?: string) => void;
}

export function PreChatHome({ importChat, productFactoryModes, setPrompt, sendExamplePrompt }: PreChatHomeProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-2 pb-10 sm:px-6" data-gxeon-pre-chat-actions>
      <div className="mx-auto w-full max-w-chat rounded-2xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2/80 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-bolt-elements-textPrimary" translate="no">
              Product Factory Mode
            </h2>
            <p className="text-xs text-bolt-elements-textSecondary">
              Prompts estruturados para criar ofertas, páginas, packs comerciais e lançamentos sem publicar
              automaticamente nem conectar marketplaces reais.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {productFactoryModes.map((mode) => (
            <button
              key={mode.label}
              type="button"
              onClick={() => setPrompt(mode.prompt)}
              className="rounded-full border border-bolt-elements-borderColor bg-gray-50 px-3 py-1 text-xs text-bolt-elements-textSecondary transition-theme hover:bg-gray-100 hover:text-bolt-elements-textPrimary dark:bg-gray-950 dark:hover:bg-gray-900"
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {ImportButtons(importChat)}
        <GitCloneButton importChat={importChat} />
      </div>
      <div className="flex flex-col gap-5">
        {ExamplePrompts(sendExamplePrompt)}
        <StarterTemplates />
      </div>
    </div>
  );
}
