/** Roles que acepta la API de chat (compatible OpenAI / LM Studio). */
export type ChatRole = 'user' | 'assistant' | 'system';

/** Mensaje que se envía/recibe del modelo y se persiste en el historial. */
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/**
 * Tipo de mensaje mostrado en pantalla. Además de los roles del modelo,
 * la UI muestra avisos efímeros: errores y estados de búsqueda web.
 */
export type UiMessageKind = ChatRole | 'error' | 'web';

/** Mensaje renderizado en la ventana de chat (no siempre se persiste). */
export interface UiMessage {
  id: string;
  kind: UiMessageKind;
  content: string;
}

/** Conversación guardada en localStorage. */
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

/** Mapa id → conversación, tal como se guarda en localStorage. */
export type ConversationMap = Record<string, Conversation>;

/** Formato del archivo JSON de exportación/importación. */
export interface ConversationsExport {
  app: string;
  exportedAt: string;
  conversations: ConversationMap;
}
