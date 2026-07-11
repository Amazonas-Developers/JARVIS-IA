import { Route, Routes } from 'react-router';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

/*
  Definición central de rutas:
  - Solo-invitados (PublicOnlyRoute): / y /login → si ya hay sesión,
    redirigen al dashboard (el usuario autenticado no vuelve a la landing/login).
  - Protegidas (ProtectedRoute): TODO lo demás, incluido el 404 → exigen sesión
    y redirigen a /login si no la hay.
  Para añadir una página protegida: crear el componente en src/routes/pages/
  y su <Route> DENTRO del grupo protegido.
*/
export default function AppRoutes() {
  return (
    <Routes>
      {/* Solo para usuarios SIN sesión */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Requieren sesión (redirigen a /login si no la hay) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
