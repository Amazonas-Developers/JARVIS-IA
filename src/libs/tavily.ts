import type { TavilySearchResponse } from '@/types/api';

const TAVILY_ENDPOINT = 'https://api.tavily.com/search';

/** Busca en internet con Tavily y devuelve la respuesta cruda. */
export async function searchWeb(
  apiKey: string,
  query: string,
): Promise<TavilySearchResponse> {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('Falta la API key de Tavily');
  }
  const res = await fetch(TAVILY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: key,
      query,
      search_depth: 'basic',
      include_answer: true,
      max_results: 5,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status} — ${errText.slice(0, 200)}`);
  }
  return (await res.json()) as TavilySearchResponse;
}

/**
 * Convierte los resultados de Tavily en un mensaje de sistema
 * que se antepone a la conversación como contexto para el modelo.
 */
export function formatSearchResults(data: TavilySearchResponse): string {
  let context =
    'Resultados de búsqueda en internet para responder la pregunta del usuario:\n\n';
  if (data.answer) {
    context += `Resumen: ${data.answer}\n\n`;
  }
  (data.results ?? []).forEach((r, i) => {
    context += `[Fuente ${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}\n\n`;
  });
  context +=
    'Usa esta información para responder de forma actualizada y precisa. Si citas datos, menciona la fuente.';
  return context;
}
