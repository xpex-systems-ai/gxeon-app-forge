import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const baseChat = readFileSync('app/components/chat/BaseChat.tsx', 'utf8');
const chatBox = readFileSync('app/components/chat/ChatBox.tsx', 'utf8');
const preChatHome = readFileSync('app/components/chat/PreChatHome.tsx', 'utf8');
const shellIntro = readFileSync('app/components/chat/GxeonProductShellIntro.tsx', 'utf8');

describe('GXEON founder preview shell composition', () => {
  it('renders the canonical shell component exactly once in BaseChat behind !chatStarted', () => {
    expect(baseChat.match(/<GxeonProductShellIntro \/>/g) ?? []).toHaveLength(1);
    expect(baseChat).toContain('!chatStarted &&');
  });

  it('keeps the hero and module grid out of secondary pre-chat surfaces', () => {
    expect(chatBox).not.toContain('GXEON App Forge');
    expect(preChatHome).not.toContain('GXEON App Forge');
    expect(preChatHome).toContain('Product Builder');
  });

  it('exposes a stable runtime marker for DOM validation without adding integrations', () => {
    expect(shellIntro).toContain('data-gxeon-shell="founder-preview"');
    expect(shellIntro).toContain('GXEON App Forge');
    expect(shellIntro).toContain('Manual-first');
    expect(shellIntro).not.toContain('Command Center');
    expect(shellIntro).not.toContain('Focar compositor real');
    expect(preChatHome).toContain('Based on open-source technology from');
    expect(preChatHome).toContain('MIT license');
  });

  it('keeps the real composer and Product Factory Mode wired without auto-send', () => {
    expect(baseChat.match(/id="composer"/g) ?? []).toHaveLength(1);
    expect(baseChat.match(/<ChatBox/g) ?? []).toHaveLength(1);
    expect(chatBox).toContain('Descreva o produto digital que você quer criar, embalar ou vender hoje.');
    expect(preChatHome).toContain('Product Factory Mode');
    expect(preChatHome).toContain(
      'Botões preenchem o prompt do compositor real. Nada é enviado automaticamente e nenhuma API externa é',
    );
    expect(preChatHome).toContain('applyProductFactoryMode(mode.prompt)');
    expect(preChatHome).toContain("document.querySelector<HTMLTextAreaElement>('#composer textarea')?.focus()");
    expect(preChatHome).not.toContain('handleSendMessage');
  });
});
