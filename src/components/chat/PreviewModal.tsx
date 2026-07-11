import { useEffect, useState } from 'react';
import { FileDown, RotateCw, X } from 'lucide-react';
import { printDocToPdf } from '@/libs/preview';

interface PreviewModalProps {
  /** Documento HTML ya construido (buildPreviewDoc). */
  doc: string;
  onClose: () => void;
}

/*
  Vista previa ampliada del código generado, DENTRO de la app (overlay sobre el
  chat, sin salir de la página ni abrir pestañas). El código corre en un iframe
  sandbox aislado; el PDF se genera en la misma página (printDocToPdf).
*/
export default function PreviewModal({ doc, onClose }: PreviewModalProps) {
  const [runKey, setRunKey] = useState(0);

  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vista previa del código"
    >
      <div
        className="animate-scale-in flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <span className="text-sm font-semibold">Vista previa (sandbox aislado)</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRunKey((k) => k + 1)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-panel-hover"
              title="Volver a ejecutar"
            >
              <RotateCw className="h-3.5 w-3.5" /> Re-ejecutar
            </button>
            <button
              type="button"
              onClick={() => printDocToPdf(doc)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-panel-hover"
              title="Guardar como PDF (impresión del navegador)"
            >
              <FileDown className="h-3.5 w-3.5 text-accent" /> Exportar PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-line bg-panel-2 text-muted transition-colors hover:bg-error/10 hover:text-error"
              title="Cerrar"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <iframe
          key={runKey}
          title="Vista previa ampliada del código"
          srcDoc={doc}
          sandbox="allow-scripts allow-modals allow-popups allow-forms"
          className="h-full w-full flex-1 border-0 bg-white"
        />
      </div>
    </div>
  );
}
