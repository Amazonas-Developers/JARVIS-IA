import { useEffect, useRef, useState } from 'react';
import type {
  ChatMessage,
  Conversation,
  ConversationMap,
  UiMessage,
  UiMessageKind,
} from '@/types/chat';
import {
  loadAllConversations,
  loadCurrentConversationId,
  saveAllConversations,
  saveCurrentConversationId,
} from '@/libs/storage';
import {
  DEFAULT_CONVERSATION_TITLE,
  createConversationId,
  downloadConversationsFile,
  makeTitleFromMessages,
  mergeImportedConversations,
} from '@/libs/conversations';
import { createChatCompletion, unloadModel } from '@/libs/lmStudio';
import { formatSearchResults, searchWeb } from '@/libs/tavily';
import { getErrorMessage, nextUiMessageId } from '@/libs/utils';

export interface SendMessageOptions {
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  /** null = búsqueda web desactivada. */
  webSearch: { apiKey: string } | null;
  /** false si el modelo aún no está cargado en el servidor (carga JIT). */
  modelIsLoaded?: boolean;
  /**
   * Instancias a descargar ANTES de enviar, para liberar VRAM cuando se
   * cambia a un modelo no cargado (intercambio en vez de acumulación).
   */
  unloadInstanceIds?: string[];
}

export interface Chat {
  /** Conversaciones guardadas, ordenadas de más a menos reciente. */
  conversations: Conversation[];
  currentId: string | null;
  uiMessages: UiMessage[];
  isSending: boolean;
  startNewConversation: () => void;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearCurrentConversation: () => void;
  exportConversations: () => void;
  importConversations: (file: File) => void;
  sendMessage: (text: string, options: SendMessageOptions) => Promise<void>;
  /** Muestra un aviso en la ventana de chat sin persistirlo. */
  notify: (kind: UiMessageKind, content: string) => void;
}

/**
 * Estado central del chat: conversaciones persistidas en localStorage,
 * mensajes visibles en pantalla y el flujo de envío al modelo
 * (con búsqueda web opcional vía Tavily).
 */
export function useChat(): Chat {
  const [conversationMap, setConversationMap] = useState<ConversationMap>(() =>
    loadAllConversations(),
  );
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [uiMessages, setUiMessages] = useState<UiMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Refs para leer el estado actual dentro de flujos async sin closures obsoletos.
  const messagesRef = useRef<ChatMessage[]>([]);
  const currentIdRef = useRef<string | null>(null);
  const isSendingRef = useRef(false);
  const initializedRef = useRef(false);

  const pushUi = (kind: UiMessageKind, content: string): string => {
    const id = nextUiMessageId();
    setUiMessages((prev) => [...prev, { id, kind, content }]);
    return id;
  };

  const removeUi = (id: string) => {
    setUiMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const setCurrent = (id: string) => {
    currentIdRef.current = id;
    setCurrentId(id);
    saveCurrentConversationId(id);
  };

  /** Guarda la conversación actual en localStorage y refresca la lista. */
  const persistCurrent = (id: string, messages: ChatMessage[]) => {
    setConversationMap((prev) => {
      const existing = prev[id];
      const next: ConversationMap = {
        ...prev,
        [id]: {
          id,
          title: messages.length
            ? makeTitleFromMessages(messages)
            : (existing?.title ?? DEFAULT_CONVERSATION_TITLE),
          messages,
          updatedAt: Date.now(),
        },
      };
      saveAllConversations(next);
      return next;
    });
    saveCurrentConversationId(id);
  };

  const startNewConversation = () => {
    setCurrent(createConversationId());
    messagesRef.current = [];
    setUiMessages([
      {
        id: nextUiMessageId(),
        kind: 'system',
        content:
          'Nueva conversación. Configura la conexión si aún no lo has hecho y escribe tu mensaje.',
      },
    ]);
  };

  const openConversation = (conv: Conversation) => {
    setCurrent(conv.id);
    messagesRef.current = conv.messages ?? [];
    if (messagesRef.current.length === 0) {
      setUiMessages([
        {
          id: nextUiMessageId(),
          kind: 'system',
          content: 'Conversación vacía. Escribe un mensaje para empezar.',
        },
      ]);
    } else {
      setUiMessages(
        messagesRef.current.map((m) => ({
          id: nextUiMessageId(),
          kind: m.role,
          content: m.content,
        })),
      );
    }
  };

  const loadConversation = (id: string) => {
    const conv = conversationMap[id];
    if (conv) openConversation(conv);
  };

  const deleteConversation = (id: string) => {
    setConversationMap((prev) => {
      const next = { ...prev };
      delete next[id];
      saveAllConversations(next);
      return next;
    });
    if (id === currentIdRef.current) {
      startNewConversation();
    }
  };

  const clearCurrentConversation = () => {
    messagesRef.current = [];
    setUiMessages([
      { id: nextUiMessageId(), kind: 'system', content: 'Chat vaciado.' },
    ]);
    if (currentIdRef.current) {
      persistCurrent(currentIdRef.current, []);
    }
  };

  const exportConversations = () => {
    if (Object.keys(conversationMap).length === 0) {
      pushUi('error', 'No hay conversaciones guardadas para exportar.');
      return;
    }
    downloadConversationsFile(conversationMap);
    pushUi(
      'system',
      `Exportadas ${Object.keys(conversationMap).length} conversación(es) a un archivo .json.`,
    );
  };

  const importConversations = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        pushUi('error', 'El archivo no es un JSON válido.');
        return;
      }
      try {
        const { merged, importedCount, renamedCount } =
          mergeImportedConversations(parsed, loadAllConversations());
        saveAllConversations(merged);
        setConversationMap(merged);
        pushUi(
          'system',
          `Importadas ${importedCount} conversación(es)` +
            (renamedCount
              ? ` (${renamedCount} con id renombrado para evitar choques)`
              : '') +
            '.',
        );
      } catch (err) {
        pushUi('error', getErrorMessage(err));
      }
    };
    reader.onerror = () => pushUi('error', 'No se pudo leer el archivo.');
    reader.readAsText(file);
  };

  const sendMessage = async (text: string, options: SendMessageOptions) => {
    const trimmed = text.trim();
    if (!trimmed || isSendingRef.current) return;

    if (!options.baseUrl) {
      pushUi('error', 'Configura primero la dirección del servidor.');
      return;
    }
    if (!options.model) {
      pushUi(
        'error',
        'Selecciona un modelo (pulsa "Comprobar conexión" si la lista está vacía).',
      );
      return;
    }

    const convId = currentIdRef.current ?? createConversationId();
    if (!currentIdRef.current) setCurrent(convId);

    isSendingRef.current = true;
    setIsSending(true);

    pushUi('user', trimmed);
    const withUser: ChatMessage[] = [
      ...messagesRef.current,
      { role: 'user', content: trimmed },
    ];
    messagesRef.current = withUser;
    persistCurrent(convId, withUser);

    // Mensajes que se envían al modelo (puede incluir contexto extra de la
    // búsqueda, sin ensuciar el historial visible de la conversación).
    let messagesToSend = withUser;

    if (options.webSearch) {
      const searchingId = pushUi(
        'web',
        `🔎 Buscando en internet: "${trimmed}"`,
      );
      try {
        const searchData = await searchWeb(options.webSearch.apiKey, trimmed);
        removeUi(searchingId);
        pushUi(
          'web',
          `✅ Encontrados ${searchData.results?.length ?? 0} resultado(s) — usando como contexto`,
        );
        messagesToSend = [
          { role: 'system', content: formatSearchResults(searchData) },
          ...withUser,
        ];
      } catch (err) {
        removeUi(searchingId);
        pushUi(
          'error',
          `No se pudo buscar en internet: ${getErrorMessage(err)}. Continuando sin resultados web.`,
        );
      }
    }

    // Cambio de modelo: descarga las instancias en memoria antes de que la
    // carga JIT monte el nuevo, para no agotar la VRAM del servidor.
    if (
      options.modelIsLoaded === false &&
      options.unloadInstanceIds &&
      options.unloadInstanceIds.length > 0
    ) {
      const unloadingId = pushUi(
        'system',
        'Liberando memoria del servidor: descargando el modelo anterior...',
      );
      const results = await Promise.allSettled(
        options.unloadInstanceIds.map((id) => unloadModel(options.baseUrl, id)),
      );
      removeUi(unloadingId);
      if (results.some((r) => r.status === 'rejected')) {
        pushUi(
          'error',
          'No se pudo descargar el modelo anterior; se intentará cargar el nuevo de todos modos.',
        );
      }
    }

    const thinkingId = pushUi(
      'system',
      options.modelIsLoaded === false
        ? `Cargando el modelo "${options.model}" en el servidor y generando respuesta... (puede tardar unos minutos)`
        : 'Generando respuesta...',
    );
    try {
      const reply = await createChatCompletion(options.baseUrl, {
        model: options.model,
        messages: messagesToSend,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: false,
      });
      removeUi(thinkingId);
      const withReply: ChatMessage[] = [
        ...messagesRef.current,
        { role: 'assistant', content: reply },
      ];
      messagesRef.current = withReply;
      pushUi('assistant', reply);
      persistCurrent(convId, withReply);
    } catch (err) {
      removeUi(thinkingId);
      pushUi('error', `Error al generar respuesta: ${getErrorMessage(err)}`);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  // Al montar: restaura la última conversación abierta o crea una nueva.
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const convs = loadAllConversations();
    const lastId = loadCurrentConversationId();
    if (lastId && convs[lastId]) {
      openConversation(convs[lastId]);
      return;
    }
    const sorted = Object.values(convs).sort((a, b) => b.updatedAt - a.updatedAt);
    if (sorted.length > 0) {
      openConversation(sorted[0]);
    } else {
      startNewConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conversations = Object.values(conversationMap).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  return {
    conversations,
    currentId,
    uiMessages,
    isSending,
    startNewConversation,
    loadConversation,
    deleteConversation,
    clearCurrentConversation,
    exportConversations,
    importConversations,
    sendMessage,
    notify: (kind, content) => {
      pushUi(kind, content);
    },
  };
}
