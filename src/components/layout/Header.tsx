import type { ConnectionState } from '@/types/api';
import { BrandWordmark } from '@/components/brand/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface HeaderProps {
  connectionState: ConnectionState;
  statusText: string;
}

const dotColors: Record<ConnectionState, string> = {
  idle: 'bg-muted',
  checking: 'bg-muted',
  ok: 'bg-success',
  error: 'bg-error',
};

export default function Header({ connectionState, statusText }: HeaderProps) {
  return (
    <header className="glass flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
      <div className="flex items-center gap-3">
        <BrandWordmark />
        <span className="hidden text-xs text-muted sm:inline">
          · Chat con LM Studio
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span
            className={`h-2 w-2 rounded-full ${dotColors[connectionState]}`}
          />
          <span>{statusText}</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
