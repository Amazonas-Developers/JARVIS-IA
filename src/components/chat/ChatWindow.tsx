import { useEffect, useRef } from 'react';
import type { UiMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages }: { messages: UiMessage[] }) {
  const scrollRef = useRef<HTMLElement>(null);

  // Baja el scroll al final cada vez que llega un mensaje nuevo.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <main
      ref={scrollRef}
      className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-5"
    >
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </main>
  );
}
