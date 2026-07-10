/** Roles que acepta la API de chat (compatible OpenAI / LM Studio). */
export type ChatRole = 'user' | 'assistant' | 'system';

/** Categoría de un archivo adjunto (decide cómo se procesa y qué icono lleva). */
export type AttachmentKind =
  | 'image' // se envía al modelo como imagen (visión)
  | 'pdf' // texto extraído con pdfjs-dist
  | 'word' // texto extraído con mammoth (.docx)
  | 'sheet' // hojas convertidas a CSV con SheetJS (.xlsx/.xls/.ods)
  | 'text' // leído tal cual (txt, csv, código, json...)
  | 'zip' // se lista su contenido con jszip
  | 'archive' // rar/7z/tar: solo metadatos (no legible en el navegador)
  | 'video' // solo metadatos
  | 'audio' // solo metadatos
  | 'other'; // cualquier otro binario: solo metadatos

/** Metadatos de un adjunto (lo que se persiste y se muestra en el chat). */
export interface AttachmentMeta {
  name: string;
  size: number;
  kind: AttachmentKind;
}

/** Resultado de procesar un archivo en el navegador (libs/attachments.ts). */
export interface ProcessedAttachment {
  meta: AttachmentMeta;
  /** Texto extraído (pdf/word/sheet/text/zip), ya truncado si era enorme. */
  text?: string;
  /** Imagen como data URL (reescalada) para modelos con visión. */
  imageDataUrl?: string;
  /** Error de lectura/extracción, si lo hubo (el adjunto va solo con metadatos). */
  error?: string;
}

/** Mensaje que se envía/recibe del modelo y se persiste en el historial. */
export interface ChatMessage {
  role: ChatRole;
  /** Lo que se envía al modelo (incluye el texto extraído de los adjuntos). */
  content: string;
  /** Lo que se muestra en pantalla cuando difiere de `content` (adjuntos). */
  displayContent?: string;
  attachments?: AttachmentMeta[];
  /** Imágenes como data URL, enviadas como content parts (visión). */
  images?: string[];
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
  attachments?: AttachmentMeta[];
  images?: string[];
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
