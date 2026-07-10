import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import type { ConnectionState } from '@/types/api';
import { BrandWordmark } from '@/components/brand/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/store/slices/authSlice';

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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

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

        {user && (
          <span className="hidden text-xs text-muted md:inline">
            {user.name} {user.surName}
          </span>
        )}

        <ThemeToggle />

        {user && (
          <button
            type="button"
            onClick={() => void handleLogout()}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line bg-panel-2 text-muted transition-colors hover:bg-error/10 hover:text-error"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}
