import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/ui/LoadingScreen';

/*
  Guard de sesión. Dos formas de uso:
  - Como layout (sin children): <Route element={<ProtectedRoute />}> ...rutas
    hijas... </Route> — protege TODO el grupo vía <Outlet />.
  - Envolviendo un elemento: <ProtectedRoute><Página /></ProtectedRoute>.
  La verificación inicial de sesión la gestiona App.tsx (pantalla de carga);
  aquí `isResolving` queda como salvaguarda. Si no hay sesión, va a /login.
*/
export default function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isResolving } = useAuth();

  if (isResolving) {
    return <LoadingScreen message="Verificando sesión…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
