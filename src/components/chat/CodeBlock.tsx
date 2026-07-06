import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
// Build "common" de highlight.js: ~40 lenguajes habituales, mucho más ligero
// que el paquete completo. highlightAuto solo considera los registrados.
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.css';

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
*/
export default function CodeBlock({ code, lang }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { html, language } = useMemo(() => highlightCode(code, lang), [code, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sin permiso de portapapeles: no hacemos nada.
    }
  };

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-code-line bg-code text-left">
      <div className="flex items-center justify-between border-b border-code-line bg-code-header px-3 py-1">
        <span className="text-[11px] text-[#8b98a5]">{language}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#8b98a5] transition-colors hover:bg-white/10 hover:text-white"
        >
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
      <pre className="m-0 overflow-x-auto whitespace-pre p-3 text-[13px] leading-relaxed">
        <code
          className="hljs !bg-transparent !p-0"
          // El HTML lo genera highlight.js a partir del texto del código;
          // no interpreta etiquetas del contenido original.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  );
}
