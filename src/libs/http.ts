import axios from 'axios';
import { env } from '@/libs/env';

/*
  Instancia de axios para hablar con un backend autenticado por sesión
  (express-session): la identidad viaja en una cookie (connect.sid por
  defecto), no en headers Authorization.

  Claves de esta configuración:
  - `withCredentials: true` → el navegador ENVÍA la cookie de sesión en cada
    petición y ACEPTA la Set-Cookie del login, incluso entre orígenes
    distintos (p. ej. app en :5173 y API en :3000).
  - La URL base se configura con VITE_API_URL en el .env. Si se deja vacía,
    las peticiones son relativas al origen de la app (útil si montas un
    proxy en vite.config.ts, que además evita los problemas de CORS).

  Requisitos del BACKEND para que la cookie viaje entre orígenes:
    app.use(cors({
      origin: 'http://localhost:5173', // origen exacto, NUNCA '*' con credenciales
      credentials: true,
    }));
    app.use(session({
      secret: '...',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',  // mismo sitio / proxy. Para orígenes distintos en
        secure: false,    // producción: sameSite: 'none' + secure: true (HTTPS)
      },
    }));

  Uso:
    import { http } from '@/libs/http';
    await http.post('/auth/login', { user, password }); // el navegador guarda la cookie
    const { data } = await http.get('/auth/me');        // y la envía automáticamente
    await http.post('/auth/logout');
*/
export const http = axios.create({
  baseURL: env.apiUrl || undefined,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Normaliza los errores: si el servidor devuelve { message }, úsalo como
// mensaje del error para poder mostrarlo directamente en la UI.
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const serverMessage = (
        error.response?.data as { message?: string } | undefined
      )?.message;
      if (serverMessage) error.message = serverMessage;
    }
    return Promise.reject(error);
  },
);
