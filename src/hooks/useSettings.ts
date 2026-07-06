import { useState } from 'react';
import { loadWebSearchEnabled, saveWebSearchEnabled } from '@/libs/storage';

export interface Settings {
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
}

/**
 * Preferencias editables desde la UI (solo el toggle de búsqueda web).
 * El resto de la configuración — URL del servidor, temperatura, máx. tokens
 * y API key de Tavily — se gestiona con variables de entorno de Vite:
 * ver src/libs/env.ts y .env.example.
 */
export function useSettings(): Settings {
  const [webSearchEnabled, setWebSearchEnabledState] = useState(() =>
    loadWebSearchEnabled(),
  );

  const setWebSearchEnabled = (enabled: boolean) => {
    setWebSearchEnabledState(enabled);
    saveWebSearchEnabled(enabled);
  };

  return { webSearchEnabled, setWebSearchEnabled };
}
