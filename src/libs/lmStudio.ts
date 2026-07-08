import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  LmStudioModelsResponse,
  LmStudioNativeModelsResponse,
  LmStudioV1ModelsResponse,
  ModelInfo,
} from '@/types/api';

/** Normaliza la URL base: quita espacios y barras finales. */
export function normalizeBaseUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/\/+$/, '');
}

/**
 * Lista los modelos del servidor LM Studio, en orden de preferencia:
 *
 * 1. GET /api/v1/models — API REST v1: todos los modelos descargados con sus
 *    instancias cargadas (los instance_id permiten descargarlos remotamente).
 * 2. GET /api/v0/models — API nativa antigua: modelos + estado, sin instancias.
 * 3. GET /v1/models — OpenAI-compatible: solo los modelos ya cargados.
 *
 * Con las APIs nativas se puede cambiar de modelo desde el frontend: al pedir
 * un chat con un modelo no cargado, LM Studio lo carga solo si tiene activado
 * el "Just-in-Time model loading" (Developer → ajustes del servidor).
 */
export async function fetchModels(baseUrl: string): Promise<ModelInfo[]> {
  try {
    const res = await fetch(`${baseUrl}/api/v1/models`, { method: 'GET' });
    if (res.ok) {
      const data = (await res.json()) as LmStudioV1ModelsResponse;
      const models = (data.models ?? [])
        .filter((m) => m.type === 'llm' || m.type === 'vlm')
        .map<ModelInfo>((m) => {
          const instanceIds = (m.loaded_instances ?? []).map((i) => i.id);
          return {
            id: m.key,
            state: instanceIds.length > 0 ? 'loaded' : 'not-loaded',
            instanceIds,
          };
        });
      if (models.length > 0) return models;
    }
  } catch {
    // Sin API v1: probamos la nativa antigua.
  }

  try {
    const res = await fetch(`${baseUrl}/api/v0/models`, { method: 'GET' });
    if (res.ok) {
      const data = (await res.json()) as LmStudioNativeModelsResponse;
      const models = (data.data ?? [])
        .filter((m) => m.type !== 'embeddings' && m.type !== 'embedding')
        .map<ModelInfo>((m) => ({
          id: m.id,
          state: m.state === 'loaded' ? 'loaded' : 'not-loaded',
          instanceIds: [],
        }));
      if (models.length > 0) return models;
    }
  } catch {
    // Sin API nativa: probamos la ruta OpenAI-compatible de abajo.
  }

  const res = await fetch(`${baseUrl}/v1/models`, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as LmStudioModelsResponse;
  return (data.data ?? []).map<ModelInfo>((m) => ({
    id: m.id,
    state: 'loaded',
    instanceIds: [],
  }));
}

/**
 * Descarga de la memoria del servidor una instancia de modelo
 * (POST /api/v1/models/unload). Libera VRAM antes de cargar otro modelo.
 */
export async function unloadModel(
  baseUrl: string,
  instanceId: string,
): Promise<void> {
  const res = await fetch(`${baseUrl}/api/v1/models/unload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instance_id: instanceId }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status} — ${errText.slice(0, 200)}`);
  }
}

/**
 * Envía la conversación al modelo (POST /v1/chat/completions)
 * y devuelve el texto de la respuesta.
 */
export async function createChatCompletion(
  baseUrl: string,
  request: ChatCompletionRequest,
): Promise<string> {
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status} — ${errText.slice(0, 300)}`);
  }
  const data = (await res.json()) as ChatCompletionResponse;
  return data.choices?.[0]?.message?.content ?? '(Respuesta vacía)';
}
