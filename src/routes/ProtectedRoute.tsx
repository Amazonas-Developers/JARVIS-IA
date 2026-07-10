import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/components/brand/Logo';

/*
  Guard de sesión. Dos formas de uso:
  - Como layout (sin children): <Route element={<ProtectedRoute />}> ...rutas
    hijas... </Route> — protege TODO el grupo vía <Outlet />.
  - Envolviendo un elemento: <ProtectedRoute><Página /></ProtectedRoute>.
  Mientras se comprueba la sesión (checkAuth al arrancar / recargar) muestra
  un cargador para no expulsar al usuario antes de saber si está autenticado;
  si no lo está, redirige a /login.
*/
export default function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isResolving } = useAuth();

  if (isResolving) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-muted">
        <BrandMark className="h-12 w-12" />
        <div className="flex items-center gap-2 text-sm">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Verificando sesión…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
