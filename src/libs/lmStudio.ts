import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  LmStudioModelsResponse,
} from '@/types/api';

/** Normaliza la URL base: quita espacios y barras finales. */
export function normalizeBaseUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/\/+$/, '');
}

/** Pide la lista de modelos cargados en LM Studio (GET /v1/models). */
export async function fetchModels(baseUrl: string): Promise<string[]> {
  const res = await fetch(`${baseUrl}/v1/models`, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as LmStudioModelsResponse;
  return (data.data ?? []).map((m) => m.id);
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
