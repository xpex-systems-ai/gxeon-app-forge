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
    expect(preChatHome).toContain('Based on open-source technology from');
    expect(preChatHome).toContain('MIT license');
  });
});
