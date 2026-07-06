import { useState } from 'react';
import type { ConnectionState } from '@/types/api';
import { fetchModels, normalizeBaseUrl } from '@/libs/lmStudio';
import { getErrorMessage } from '@/libs/utils';

export interface TestResult {
  ok: boolean;
  baseUrl: string;
  errorMessage?: string;
}

export interface Connection {
  state: ConnectionState;
  statusText: string;
  models: string[];
  isChecking: boolean;
  test: (rawUrl: string) => Promise<TestResult>;
}

/**
 * Estado de la conexión con LM Studio: comprueba el servidor
 * (GET /v1/models) y mantiene la lista de modelos disponibles.
 */
export function useConnection(): Connection {
  const [state, setState] = useState<ConnectionState>('idle');
  const [statusText, setStatusText] = useState('Sin comprobar');
  const [models, setModels] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const test = async (rawUrl: string): Promise<TestResult> => {
    const baseUrl = normalizeBaseUrl(rawUrl);
    if (!baseUrl) {
      setState('error');
      setStatusText('Falta la URL del servidor (VITE_LM_STUDIO_URL en el .env)');
      return { ok: false, baseUrl };
    }

    setState('checking');
    setStatusText('Comprobando...');
    setIsChecking(true);
    try {
      const found = await fetchModels(baseUrl);
      setModels(found);
      if (found.length === 0) {
        setState('error');
        setStatusText('Conectado, pero sin modelos cargados en LM Studio');
      } else {
        setState('ok');
        setStatusText(`Conectado — ${found.length} modelo(s) disponible(s)`);
      }
      return { ok: true, baseUrl };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setState('error');
      setStatusText(`Error de conexión: ${errorMessage}`);
      setModels([]);
      return { ok: false, baseUrl, errorMessage };
    } finally {
      setIsChecking(false);
    }
  };

  return { state, statusText, models, isChecking, test };
}
