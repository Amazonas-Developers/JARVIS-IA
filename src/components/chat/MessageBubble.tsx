import { useMemo } from 'react';
import type { UiMessage, UiMessageKind } from '@/types/chat';
import MarkdownContent from './MarkdownContent';
import AttachmentChip from './AttachmentChip';

const base =
  'max-w-[75%] break-words rounded-xl px-3.5 py-2.5 text-sm leading-normal';

const kindClasses: Record<UiMessageKind, string> = {
  user: 'self-end whitespace-pre-wrap rounded-br-[2px] bg-bubble-user shadow-sm',
  // El asistente renderiza Markdown: el espaciado lo aportan los elementos
  // (p, ul, table...), no los saltos de línea del texto original.
  assistant:
    'self-start whitespace-normal rounded-bl-[2px] border border-line bg-bubble-bot min-w-0 shadow-sm',
  system: 'self-center whitespace-pre-wrap bg-transparent text-xs italic text-muted',
  error:
    'self-center whitespace-pre-wrap border border-error/30 bg-error/10 text-[13px] text-error',
  web: 'max-w-[90%] self-center whitespace-pre-wrap border border-accent/25 bg-accent/10 text-xs text-accent',
};

export default function MessageBubble({ message }: { message: UiMessage }) {
  // Chips solo para adjuntos sin miniatura (las imágenes ya se ven abajo).
  const fileChips = useMemo(
    () => (message.attachments ?? []).filter((a) => a.kind !== 'image'),
    [message.attachments],
  );

  return (
    <div className={`${base} ${kindClasses[message.kind]}`}>
      {message.images && message.images.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {message.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Imagen adjunta ${i + 1}`}
              className="max-h-40 max-w-full rounded-lg border border-line object-contain"
            />
          ))}
        </div>
      )}

      {fileChips.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {fileChips.map((meta, i) => (
            <AttachmentChip key={`${meta.name}_${i}`} meta={meta} />
          ))}
        </div>
      )}

      {message.kind === 'assistant' ? (
        <MarkdownContent content={message.content} />
      ) : (
        message.content
      )}
    </div>
  );
}
