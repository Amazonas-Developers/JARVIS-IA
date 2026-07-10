/*
  Tipos de autenticación. AuthUser refleja el usuario que devuelve el backend
  api_jarvis365 (modelo `user`, sin la contraseña) en POST /auth/login y
  GET /auth/isAuth.
*/

export interface JobInformation {
  department?: string | null;
  position?: string | null;
  detail?: string | null;
}

export interface AuthUser {
  _id: string;
  user?: string;
  email: string;
  name: string;
  surName: string;
  phone?: string;
  dni?: string | null;
  admin?: boolean;
  super?: boolean;
  inabilited?: boolean;
  img?: string | null;
  jobInformation?: JobInformation | null;
  createdOn?: string;
  /** El backend puede añadir más campos (workSchedule, activity...). */
  [key: string]: unknown;
}

/**
 * Estado de la sesión:
 * - idle: aún no se ha comprobado (al arrancar).
 * - checking: verificando la sesión contra /auth/isAuth.
 * - authenticated / unauthenticated: resultado.
 */
export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated';
