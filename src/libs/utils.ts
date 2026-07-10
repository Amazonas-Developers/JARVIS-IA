/** Extrae un mensaje legible de cualquier valor lanzado como error. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Formatea bytes de forma legible (1.5 MB, 320 KB...). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

let uiIdCounter = 0;

/** Id único para mensajes de la UI (claves de React). */
export function nextUiMessageId(): string {
  uiIdCounter += 1;
  return `ui_${Date.now()}_${uiIdCounter}`;
}
