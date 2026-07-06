import { Route, Routes } from 'react-router';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

/*
  Definición central de rutas:
    /           → bienvenida (landing)
    /login      → inicio de sesión (cookies de sesión vía libs/http.ts)
    /dashboard  → el cliente de chat con LM Studio
  Para añadir una página: crear el componente en src/routes/pages/
  y añadir aquí su <Route>.
*/
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
