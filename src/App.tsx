import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import AppRoutes from '@/routes/AppRoutes';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function App() {
  const dispatch = useAppDispatch();
  const { isResolving } = useAuth();

  // Al arrancar (y tras recargar) comprueba si hay sesión activa en el backend.
  useEffect(() => {
    void dispatch(checkAuth());
  }, [dispatch]);

  // Hasta saber si hay sesión, pantalla de carga: evita mostrar la landing/login
  // (y su parpadeo) antes de redirigir a un usuario ya autenticado.
  if (isResolving) {
    return <LoadingScreen message="Verificando sesión…" />;
  }

  return <AppRoutes />;
}
