import { useAppSelector } from '@/store/hooks';

/**
 * Acceso cómodo al estado global de autenticación (Redux).
 * Ejemplo: const { user, isAuthenticated } = useAuth();
 */
export function useAuth() {
  const { user, status, loginPending, error } = useAppSelector((s) => s.auth);
  return {
    user,
    status,
    loginPending,
    error,
    isAuthenticated: status === 'authenticated',
    /** true mientras aún no se sabe si hay sesión (arranque / verificación). */
    isResolving: status === 'idle' || status === 'checking',
  };
}
