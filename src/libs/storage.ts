import type { ConversationMap } from '@/types/chat';
import type { Theme } from '@/types/ui';

/*
  Claves de localStorage. Las de conversaciones se mantienen del
  lm-studio-chat.html original para conservar el historial previo.
  (Las claves antiguas `lmstudio_url` y `tavily_key` ya no se usan:
  esos valores ahora vienen de variables de entorno — ver libs/env.ts.)
*/
export const STORAGE_KEYS = {
  conversations: 'lmstudio_conversations_v1',
  currentConversationId: 'lmstudio_current_conversation_id',
  webSearchEnabled: 'web_search_enabled',
  // OJO: también la lee el script inline de index.html (anti-parpadeo)
  theme: 'a365_theme',
} as const;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`No se pudo guardar "${key}" en localStorage:`, e);
  }
}

export function loadAllConversations(): ConversationMap {
  try {
    const raw = safeGet(STORAGE_KEYS.conversations);
    return raw ? (JSON.parse(raw) as ConversationMap) : {};
  } catch {
    return {};
  }
}

export function saveAllConversations(convs: ConversationMap): void {
  safeSet(STORAGE_KEYS.conversations, JSON.stringify(convs));
}

export function loadCurrentConversationId(): string | null {
  return safeGet(STORAGE_KEYS.currentConversationId);
}

export function saveCurrentConversationId(id: string): void {
  safeSet(STORAGE_KEYS.currentConversationId, id);
}

export function loadTheme(): Theme | null {
  const value = safeGet(STORAGE_KEYS.theme);
  return value === 'dark' || value === 'light' ? value : null;
}

export function saveTheme(theme: Theme): void {
  safeSet(STORAGE_KEYS.theme, theme);
}

export function loadWebSearchEnabled(): boolean {
  return safeGet(STORAGE_KEYS.webSearchEnabled) === 'true';
}

export function saveWebSearchEnabled(enabled: boolean): void {
  safeSet(STORAGE_KEYS.webSearchEnabled, String(enabled));
}
