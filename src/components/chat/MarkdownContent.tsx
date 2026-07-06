import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

/*
  Renderiza el Markdown de las respuestas del asistente (negritas, títulos,
  listas, tablas GFM, citas...). Los bloques ```código``` no los pinta
  react-markdown: se interceptan en <pre> y se delegan en CodeBlock, que
  conserva el resaltado con highlight.js y la autodetección de lenguaje.
  Los estilos de los elementos viven en styles/index.css (.markdown-body).
*/

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return '';
}

function PreAsCodeBlock({ children }: { children?: ReactNode }) {
  let lang: string | null = null;
  if (isValidElement(children)) {
    const { className } = children.props as { className?: string };
    lang = /language-([\w+#.-]+)/.exec(className ?? '')?.[1] ?? null;
  }
  const code = extractText(children).replace(/\n$/, '');
  return <CodeBlock code={code} lang={lang} />;
}

function ExternalLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} target="_blank" rel="noreferrer" />;
}

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ pre: PreAsCodeBlock, a: ExternalLink }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
