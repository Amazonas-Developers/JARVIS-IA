import { useEffect, useRef, useState } from 'react';
import { Paperclip, SendHorizontal } from 'lucide-react';
import type { ProcessedAttachment } from '@/types/chat';
import { detectKind, processFile } from '@/libs/attachments';
import Button from '@/components/ui/Button';
import AttachmentChip from './AttachmentChip';

const MAX_HEIGHT = 160;

interface PendingAttachment {
  id: string;
  status: 'processing' | 'ready' | 'error';
  processed: ProcessedAttachment;
}

interface ChatInputProps {
  isSending: boolean;
  onSend: (text: string, attachments: ProcessedAttachment[]) => void;
}

let attachmentCounter = 0;

export default function ChatInput({ isSending, onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = attachments.some((a) => a.status === 'processing');
  const canSend =
    !isSending && !isProcessing && (text.trim() !== '' || attachments.length > 0);

  const autosize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      attachmentCounter += 1;
      const id = `att_${Date.now()}_${attachmentCounter}`;
      // Chip inmediato en estado "procesando"; se resuelve al terminar.
      setAttachments((prev) => [
        ...prev,
        {
          id,
          status: 'processing',
          processed: {
            meta: { name: file.name, size: file.size, kind: detectKind(file) },
          },
        },
      ]);
      void processFile(file).then((processed) => {
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { id, status: processed.error ? 'error' : 'ready', processed }
              : a,
          ),
        );
      });
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const submit = () => {
    if (!canSend) return;
    onSend(
      text.trim(),
      attachments.map((a) => a.processed),
    );
    setText('');
    setAttachments([]);
    const el = textareaRef.current;
    if (el) el.style.height = 'auto';
  };

  // Devuelve el foco al terminar de generar la respuesta.
  useEffect(() => {
    if (!isSending) textareaRef.current?.focus();
  }, [isSending]);

  return (
    <footer className="glass flex flex-col gap-2 border-t px-5 py-3.5">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {attachments.map((a) => (
            <AttachmentChip
              key={a.id}
              meta={a.processed.meta}
              status={a.status}
              onRemove={() => removeAttachment(a.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-end gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <Button
          variant="secondary"
          title="Adjuntar archivos (PDF, Word, Excel, CSV, imágenes, videos, ZIP...)"
          className="h-[44px] w-[44px] shrink-0 !px-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Escribe tu mensaje... (Enter para enviar, Shift+Enter para salto de línea)"
          className="max-h-[160px] min-h-[44px] flex-1 resize-none rounded-[10px] border border-line bg-panel px-3 py-2.5 font-sans text-sm text-foreground outline-none focus:ring-1 focus:ring-accent"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autosize();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />

        <Button onClick={submit} disabled={!canSend} className="h-[44px]">
          <SendHorizontal className="h-4 w-4" />
          {isProcessing ? 'Procesando…' : 'Enviar'}
        </Button>
      </div>
    </footer>
  );
}
