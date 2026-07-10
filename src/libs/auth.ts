import type { AuthUser } from '@/types/auth';
import { http } from '@/libs/http';
import { env } from '@/libs/env';

/*
  Cliente de autenticación contra el backend api_jarvis365. Todas las
  peticiones usan la instancia axios `http` (withCredentials), así que la
  cookie de sesión de express-session viaja sola. Endpoints reales:
    POST {prefix}/auth/login   { email, password }  → usuario
    GET  {prefix}/auth/isAuth                        → usuario (o 401)
    GET  {prefix}/auth/logout                        → destruye la sesión
  El prefijo (VITE_API_PREFIX) es /api_jarvis/v1 en producción.
*/

function looksLikeUser(data: unknown): data is AuthUser {
  return (
    typeof data === 'object' &&
    data !== null &&
    '_id' in data &&
    'email' in data
  );
}

/** Inicia sesión y devuelve el usuario autenticado. */
export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthUser> {
  const { data } = await http.post(`${env.apiPrefix}/auth/login`, {
    email,
    password,
  });
  // El login normal devuelve el usuario. Si la sesión ya existía, el backend
  // responde con otra forma ({ message, result }); en ese caso lo normalizamos.
  if (looksLikeUser(data)) return data;
  return fetchCurrentUser();
}

/** Usuario de la sesión actual; lanza si no hay sesión (401). */
export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await http.get(`${env.apiPrefix}/auth/isAuth`);
  return data as AuthUser;
}

/** Cierra la sesión en el servidor (destruye la cookie). */
export async function logoutRequest(): Promise<void> {
  await http.get(`${env.apiPrefix}/auth/logout`);
}
