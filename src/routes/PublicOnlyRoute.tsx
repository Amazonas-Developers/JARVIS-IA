import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

/*
  Guard inverso de ProtectedRoute: rutas para invitados (bienvenida y login).
  Si YA hay sesión, redirige al dashboard — así un usuario autenticado no
  vuelve a la landing ni al login. Mientras se verifica la sesión no
  redirige (deja ver la página pública); en cuanto se confirma, salta.
  Uso como layout: <Route element={<PublicOnlyRoute/>}> ...rutas... </Route>
*/
export default function PublicOnlyRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
