import type {
  ChatMessage,
  Conversation,
  ConversationMap,
  ConversationsExport,
} from '@/types/chat';

export const DEFAULT_CONVERSATION_TITLE = 'Nueva conversación';

/** Genera un id único para una conversación nueva. */
export function createConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Título derivado del primer mensaje del usuario (máx. 40 caracteres). */
export function makeTitleFromMessages(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user');
  if (!firstUser) return DEFAULT_CONVERSATION_TITLE;
  // displayContent es lo que escribió el usuario (sin el texto extraído de adjuntos)
  const source = firstUser.displayContent?.trim()
    ? firstUser.displayContent
    : firstUser.content;
  const t = source.trim().replace(/\s+/g, ' ');
  if (!t) return firstUser.attachments?.[0]?.name ?? DEFAULT_CONVERSATION_TITLE;
  return t.length > 40 ? `${t.slice(0, 40)}…` : t;
}

/** Descarga todas las conversaciones como archivo .json. */
export function downloadConversationsFile(convs: ConversationMap): void {
  const payload: ConversationsExport = {
    app: 'lm-studio-chat',
    exportedAt: new Date().toISOString(),
    conversations: convs,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.href = url;
  a.download = `lm-studio-conversaciones-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  merged: ConversationMap;
  importedCount: number;
  renamedCount: number;
}

/**
 * Fusiona conversaciones importadas con las existentes.
 * Si un id ya existe, se renombra para no sobrescribir la conversación local.
 */
export function mergeImportedConversations(
  parsed: unknown,
  existing: ConversationMap,
): ImportResult {
  const source = parsed as Partial<ConversationsExport> | ConversationMap | null;
  const incoming =
    source && typeof source === 'object' && 'conversations' in source
      ? (source as Partial<ConversationsExport>).conversations
      : (source as ConversationMap | null);

  if (!incoming || typeof incoming !== 'object') {
    throw new Error('El archivo no tiene el formato esperado (falta "conversations").');
  }

  const merged: ConversationMap = { ...existing };
  let importedCount = 0;
  let renamedCount = 0;

  Object.values(incoming).forEach((conv: Partial<Conversation> | null) => {
    if (!conv || !Array.isArray(conv.messages)) return;
    let id = conv.id || createConversationId();
    // Evitar sobrescribir una conversación existente distinta con el mismo id
    if (merged[id]) {
      id = createConversationId();
      renamedCount += 1;
    }
    merged[id] = {
      id,
      title: conv.title || makeTitleFromMessages(conv.messages),
      messages: conv.messages,
      updatedAt: conv.updatedAt || Date.now(),
    };
    importedCount += 1;
  });

  return { merged, importedCount, renamedCount };
}
