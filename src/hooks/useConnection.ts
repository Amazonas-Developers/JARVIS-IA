import { useState } from 'react';
import type { ConnectionState, ModelInfo } from '@/types/api';
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
  models: ModelInfo[];
  isChecking: boolean;
  test: (rawUrl: string) => Promise<TestResult>;
  /** Re-lee la lista de modelos sin molestar (tras un envío, JIT pudo cargar uno). */
  refresh: (rawUrl: string) => Promise<void>;
}

function connectedText(models: ModelInfo[]): string {
  const loaded = models.filter((m) => m.state === 'loaded').length;
  return `Conectado — ${models.length} modelo(s), ${loaded} cargado(s)`;
}

/**
 * Estado de la conexión con LM Studio: comprueba el servidor y mantiene la
 * lista de modelos descargados con su estado de carga (ver libs/lmStudio.ts).
 */
export function useConnection(): Connection {
  const [state, setState] = useState<ConnectionState>('idle');
  const [statusText, setStatusText] = useState('Sin comprobar');
  const [models, setModels] = useState<ModelInfo[]>([]);
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
        setStatusText('Conectado, pero sin modelos en LM Studio');
      } else {
        setState('ok');
        setStatusText(connectedText(found));
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

  const refresh = async (rawUrl: string): Promise<void> => {
    const baseUrl = normalizeBaseUrl(rawUrl);
    if (!baseUrl) return;
    try {
      const found = await fetchModels(baseUrl);
      if (found.length > 0) {
        setModels(found);
        setState('ok');
        setStatusText(connectedText(found));
      }
    } catch {
      // Silencioso: el refresco es oportunista, no debe generar errores en la UI.
    }
  };

  return { state, statusText, models, isChecking, test, refresh };
}
