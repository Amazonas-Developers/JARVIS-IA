import { useEffect, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import Button from '@/components/ui/Button';

const MAX_HEIGHT = 160;

interface ChatInputProps {
  isSending: boolean;
  onSend: (text: string) => void;
}

export default function ChatInput({ isSending, onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autosize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText('');
    const el = textareaRef.current;
    if (el) el.style.height = 'auto';
  };

  // Devuelve el foco al terminar de generar la respuesta.
  useEffect(() => {
    if (!isSending) textareaRef.current?.focus();
  }, [isSending]);

  return (
    <footer className="glass flex items-end gap-2.5 border-t px-5 py-3.5">
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
      <Button onClick={submit} disabled={isSending} className="py-2.5">
        <SendHorizontal className="h-4 w-4" />
        Enviar
      </Button>
    </footer>
  );
}
