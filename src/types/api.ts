import type { ChatMessage } from './chat';

/** Estado de la conexión con el servidor de LM Studio. */
export type ConnectionState = 'idle' | 'checking' | 'ok' | 'error';

/** Respuesta de GET /v1/models de LM Studio (solo modelos cargados). */
export interface LmStudioModelsResponse {
  data?: Array<{ id: string }>;
}

/** Estado de un modelo en el servidor LM Studio. */
export type ModelState = 'loaded' | 'not-loaded';

/** Modelo disponible en el servidor, con su estado de carga. */
export interface ModelInfo {
  id: string;
  state: ModelState;
  /** Ids de las instancias cargadas (para POST /api/v1/models/unload). */
  instanceIds: string[];
}

/**
 * Respuesta de GET /api/v1/models (API REST v1 de LM Studio):
 * modelos descargados con sus instancias cargadas en memoria.
 */
export interface LmStudioV1ModelsResponse {
  models?: Array<{
    key: string;
    /** 'llm' | 'vlm' | 'embedding' ... */
    type?: string;
    loaded_instances?: Array<{ id: string }>;
  }>;
}

/**
 * Respuesta de GET /api/v0/models (API nativa de LM Studio):
 * lista TODOS los modelos descargados, estén cargados o no.
 */
export interface LmStudioNativeModelsResponse {
  data?: Array<{
    id: string;
    /** 'llm' | 'vlm' | 'embeddings' ... */
    type?: string;
    /** 'loaded' | 'not-loaded' */
    state?: string;
  }>;
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
