import { useMemo, useState } from 'react';
import { Check, Copy, Eye, EyeOff, FileDown, Maximize2, RotateCw } from 'lucide-react';
// Build "common" de highlight.js: ~40 lenguajes habituales, mucho más ligero
// que el paquete completo. highlightAuto solo considera los registrados.
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.css';
import { buildPreviewDoc, isPreviewable, printDocToPdf } from '@/libs/preview';
import PreviewModal from './PreviewModal';

interface CodeBlockProps {
  code: string;
  /** Lenguaje declarado en el fence; si falta o no se conoce, se autodetecta. */
  lang: string | null;
}

interface Highlighted {
  html: string;
  language: string;
}

function highlightCode(code: string, lang: string | null): Highlighted {
  if (lang && hljs.getLanguage(lang)) {
    return {
      html: hljs.highlight(code, { language: lang }).value,
      language: lang,
    };
  }
  const auto = hljs.highlightAuto(code);
  return { html: auto.value, language: auto.language ?? 'texto' };
}

/*
  Los bloques de código son SIEMPRE oscuros (tokens fijos code/code-header
  en index.css), en ambos temas: el resaltado de github-dark solo es legible
  sobre fondo oscuro y así el código mantiene contraste en modo claro.

  Si el código es HTML/SVG, aparece un botón "Vista previa" que lo ejecuta en
  un <iframe sandbox> aislado, y "PDF" que lo abre para imprimir/guardar en PDF.
*/
export default function CodeBlock({ code, lang }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Cambia al re-ejecutar la vista previa (recarga el iframe).
  const [runKey, setRunKey] = useState(0);
  const { html, language } = useMemo(() => highlightCode(code, lang), [code, lang]);

  const canPreview = useMemo(() => isPreviewable(lang, code), [lang, code]);
  const previewDoc = useMemo(
    () => (canPreview ? buildPreviewDoc(code, lang) : ''),
    [canPreview, code, lang],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sin permiso de portapapeles: no hacemos nada.
    }
  };

  const iconBtn =
    'flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#8b98a5] transition-colors hover:bg-white/10 hover:text-white';

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-code-line bg-code text-left">
      <div className="flex items-center justify-between gap-2 border-b border-code-line bg-code-header px-3 py-1">
        <span className="text-[11px] text-[#8b98a5]">{language}</span>
        <div className="flex items-center gap-1">
          {canPreview && (
            <>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className={iconBtn}
                title="Ejecutar el código en una vista previa aislada dentro del chat"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-3 w-3" /> Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" /> Vista previa
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className={iconBtn}
                title="Ampliar la vista previa (dentro de la app)"
              >
                <Maximize2 className="h-3 w-3" /> Ampliar
              </button>
              <button
                type="button"
                onClick={() => printDocToPdf(previewDoc)}
                className={iconBtn}
                title="Guardar como PDF (sin salir del chat)"
              >
                <FileDown className="h-3 w-3" /> PDF
              </button>
            </>
          )}
          <button type="button" onClick={() => void copy()} className={iconBtn}>
            {copied ? (
              <>
                <Check className="h-3 w-3 text-success" /> Copiado
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {showPreview && canPreview && (
        <div className="border-b border-code-line bg-white">
          <div className="flex items-center justify-between border-b border-black/10 bg-[#f3f4f6] px-3 py-1">
            <span className="text-[11px] font-medium text-[#555]">
              Vista previa (sandbox aislado)
            </span>
            <button
              type="button"
              onClick={() => setRunKey((k) => k + 1)}
              className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#555] transition-colors hover:bg-black/5 hover:text-black"
              title="Volver a ejecutar"
            >
              <RotateCw className="h-3 w-3" /> Re-ejecutar
            </button>
          </div>
          <iframe
            key={runKey}
            title="Vista previa del código"
            srcDoc={previewDoc}
            // Aislado: los scripts se ejecutan pero sin acceso al documento
            // padre (sin allow-same-origin), ni a cookies ni a la sesión.
            sandbox="allow-scripts allow-modals allow-popups allow-forms"
            className="h-80 w-full border-0 bg-white"
          />
        </div>
      )}

      <pre className="m-0 overflow-x-auto whitespace-pre p-3 text-[13px] leading-relaxed">
        <code
          className="hljs !bg-transparent !p-0"
          // El HTML lo genera highlight.js a partir del texto del código;
          // no interpreta etiquetas del contenido original.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>

      {expanded && canPreview && (
        <PreviewModal doc={previewDoc} onClose={() => setExpanded(false)} />
      )}
    </div>
  );
}
