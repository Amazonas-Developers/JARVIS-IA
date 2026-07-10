import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';
import AppRoutes from '@/routes/AppRoutes';

export default function App() {
  const dispatch = useAppDispatch();

  // Al arrancar (y tras recargar) comprueba si hay sesión activa en el backend.
  useEffect(() => {
    void dispatch(checkAuth());
  }, [dispatch]);

  return <AppRoutes />;
}
