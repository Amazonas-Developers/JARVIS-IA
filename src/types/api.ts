import type { ChatMessage } from './chat';

/** Estado de la conexión con el servidor de LM Studio. */
export type ConnectionState = 'idle' | 'checking' | 'ok' | 'error';

/** Respuesta de GET /v1/models de LM Studio. */
export interface LmStudioModelsResponse {
  data?: Array<{ id: string }>;
}

/** Cuerpo de POST /v1/chat/completions (subconjunto que usa la app). */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

/** Respuesta de POST /v1/chat/completions (subconjunto que usa la app). */
export interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/** Un resultado individual de la búsqueda con Tavily. */
export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

/** Respuesta de POST https://api.tavily.com/search. */
export interface TavilySearchResponse {
  answer?: string;
  results?: TavilySearchResult[];
}
