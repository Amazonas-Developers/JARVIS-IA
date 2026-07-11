import { useRef } from 'react';
import { Download, MessagesSquare, Plus, Upload, X } from 'lucide-react';
import type { Conversation } from '@/types/chat';
import Button from '@/components/ui/Button';

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
}

export default function Sidebar({
  conversations,
  currentId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onExport,
  onImportFile,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="flex w-[260px] min-w-[260px] flex-col overflow-hidden border-r border-line bg-panel">
      <div className="border-b border-line p-3.5">
        <Button className="w-full justify-start" onClick={onNewConversation}>
          <Plus className="h-4 w-4" />
          Nueva conversación
        </Button>
        <div className="mt-2 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onExport}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Importar
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportFile(file);
            e.target.value = '';
          }}
        />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-4 text-center text-xs text-muted">
            <MessagesSquare className="h-5 w-5" />
            Sin conversaciones guardadas todavía
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex cursor-pointer items-center justify-between gap-1.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-200 hover:translate-x-0.5 ${
                conv.id === currentId
                  ? 'bg-bubble-user font-medium shadow-sm'
                  : 'hover:bg-panel-hover'
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <span className="flex-1 truncate">
                {conv.title || 'Nueva conversación'}
              </span>
              <button
                type="button"
                title="Eliminar conversación"
                className="cursor-pointer rounded p-0.5 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-error/10 hover:text-error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
