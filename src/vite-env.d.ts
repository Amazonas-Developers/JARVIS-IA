/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL por defecto del servidor LM Studio (p. ej. http://192.168.1.50:1234). */
  readonly VITE_LM_STUDIO_URL?: string;
  /** Temperatura por defecto del modelo (0–2). */
  readonly VITE_TEMPERATURE?: string;
  /** Máximo de tokens por defecto de la respuesta. */
  readonly VITE_MAX_TOKENS?: string;
  /** API key de Tavily para la búsqueda web. */
  readonly VITE_TAVILY_API_KEY?: string;
  /** URL del backend con sesiones express-session (instancia axios de libs/http.ts). */
  readonly VITE_API_URL?: string;
  /** Prefijo de la API del backend (api_jarvis365), p. ej. /api_jarvis/v1. */
  readonly VITE_API_PREFIX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Worker de pdfjs-dist importado como URL (Vite `?url`). */
declare module 'pdfjs-dist/build/pdf.worker.min.mjs?url' {
  const src: string;
  export default src;
}
