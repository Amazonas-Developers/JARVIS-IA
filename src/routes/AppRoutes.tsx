import { Route, Routes } from 'react-router';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

/*
  Definición central de rutas. Solo la bienvenida (/) y el login son públicas;
  TODO lo demás (incluido el 404) cuelga del layout ProtectedRoute y exige
  sesión. Para añadir una página: crear el componente en src/routes/pages/ y
  añadir su <Route> DENTRO del grupo protegido (salvo que deba ser pública).
*/
export default function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protegidas: exigen sesión (redirigen a /login si no la hay) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
