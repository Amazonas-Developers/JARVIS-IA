import { Eraser, Globe, HardDriveDownload, PlugZap, TriangleAlert } from 'lucide-react';
import type { ConnectionState, ModelInfo } from '@/types/api';
import Button from '@/components/ui/Button';
import Field, { inputClasses } from '@/components/ui/Field';

/*
  La dirección del servidor, la temperatura, el máx. de tokens y la API key
  de Tavily se configuran con variables de entorno (.env, ver libs/env.ts).
  El cliente solo elige el modelo y puede activar la búsqueda web.
*/

interface ConfigPanelProps {
  models: ModelInfo[];
  model: string;
  onModelChange: (model: string) => void;
  connectionState: ConnectionState;
  isChecking: boolean;
  onTestConnection: () => void;
  onClearConversation: () => void;
  webSearchEnabled: boolean;
  onWebSearchEnabledChange: (enabled: boolean) => void;
  /** true si hay VITE_TAVILY_API_KEY configurada en el .env. */
  hasTavilyKey: boolean;
}

function modelPlaceholder(state: ConnectionState): string {
  if (state === 'error') return '-- Sin conexión --';
  if (state === 'ok') return 'No hay modelos cargados';
  return '-- Comprobar conexión primero --';
}

export default function ConfigPanel({
  models,
  model,
  onModelChange,
  connectionState,
  isChecking,
  onTestConnection,
  onClearConversation,
  webSearchEnabled,
  onWebSearchEnabledChange,
  hasTavilyKey,
}: ConfigPanelProps) {
  const selectedModel = models.find((m) => m.id === model);

  return (
    <div className="glass flex flex-wrap items-end gap-2.5 border-b px-5 py-3.5">
      <Field label="Modelo" htmlFor="modelSelect" className="min-w-[240px] max-w-md flex-1">
        <select
          id="modelSelect"
          className={inputClasses}
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
        >
          {models.length === 0 ? (
            <option value="">{modelPlaceholder(connectionState)}</option>
          ) : (
            models.map((m) => (
              <option key={m.id} value={m.id}>
                {`${m.state === 'loaded' ? '●' : '○'} ${m.id}`}
              </option>
            ))
          )}
        </select>
      </Field>

      <div className="flex items-center gap-2">
        <Button onClick={onTestConnection} disabled={isChecking}>
          <PlugZap className="h-4 w-4" />
          Comprobar conexión
        </Button>
        <Button variant="secondary" onClick={onClearConversation}>
          <Eraser className="h-4 w-4" />
          Vaciar esta conversación
        </Button>
        <label className="ml-2 flex cursor-pointer items-center gap-2 whitespace-nowrap py-2 text-[13px]">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer accent-accent-strong"
            checked={webSearchEnabled}
            onChange={(e) => onWebSearchEnabledChange(e.target.checked)}
          />
          <Globe className="h-4 w-4 text-accent" />
          <span>Activar acceso a internet</span>
        </label>
      </div>

      {selectedModel && selectedModel.state !== 'loaded' && (
        <p className="m-0 flex w-full items-center gap-1.5 text-xs text-muted">
          <HardDriveDownload className="h-3.5 w-3.5 shrink-0 text-accent" />
          Este modelo no está cargado: al enviar el primer mensaje se
          descargará el modelo actual (liberando memoria) y LM Studio cargará
          este automáticamente — puede tardar unos minutos. Requiere
          «Just-in-Time model loading» activado en el servidor.
        </p>
      )}

      {webSearchEnabled && !hasTavilyKey && (
        <p className="m-0 flex w-full items-center gap-1.5 text-xs text-error">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          No hay API key de Tavily configurada: añade VITE_TAVILY_API_KEY en el
          archivo .env y reinicia la app. Sin ella la búsqueda fallará.
        </p>
      )}
    </div>
  );
}
