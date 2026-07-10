/*
  Acceso tipado y centralizado a las variables de entorno de Vite (.env).
  - Solo las variables con prefijo VITE_ llegan al cliente.
  - Se inyectan EN TIEMPO DE BUILD: al cambiar el .env hay que reiniciar
    `npm run dev` (o rehacer el build).
  - No leer import.meta.env fuera de este archivo.
*/

const FALLBACK_SERVER_URL = 'http://192.168.1.50:1234';
const FALLBACK_TEMPERATURE = 0.7;
const FALLBACK_MAX_TOKENS = 1024;

function envNumber(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  /** VITE_LM_STUDIO_URL — URL por defecto del servidor LM Studio. */
  serverUrl: import.meta.env.VITE_LM_STUDIO_URL?.trim() || FALLBACK_SERVER_URL,
  /** VITE_TEMPERATURE — temperatura por defecto. */
  temperature: envNumber(import.meta.env.VITE_TEMPERATURE, FALLBACK_TEMPERATURE),
  /** VITE_MAX_TOKENS — máximo de tokens por defecto. */
  maxTokens: envNumber(import.meta.env.VITE_MAX_TOKENS, FALLBACK_MAX_TOKENS),
  /** VITE_TAVILY_API_KEY — API key de Tavily (búsqueda web). */
  tavilyKey: import.meta.env.VITE_TAVILY_API_KEY?.trim() ?? '',
  /** VITE_API_URL — backend con autenticación por sesión (vacío = mismo origen). */
  apiUrl: import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') ?? '',
  /** VITE_API_PREFIX — prefijo de la API del backend (api_jarvis365). */
  apiPrefix:
    import.meta.env.VITE_API_PREFIX?.trim().replace(/\/+$/, '') || '/api_jarvis/v1',
} as const;
