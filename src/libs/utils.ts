/** Extrae un mensaje legible de cualquier valor lanzado como error. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

let uiIdCounter = 0;

/** Id único para mensajes de la UI (claves de React). */
export function nextUiMessageId(): string {
  uiIdCounter += 1;
  return `ui_${Date.now()}_${uiIdCounter}`;
}
