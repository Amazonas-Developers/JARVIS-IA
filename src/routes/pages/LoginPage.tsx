import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, KeyRound, LogIn, Mail, TriangleAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import Field, { inputClasses } from '@/components/ui/Field';
import { BrandMark } from '@/components/brand/Logo';
import AuroraBackground from '@/components/brand/AuroraBackground';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { clearAuthError, login } from '@/store/slices/authSlice';

/*
  Ruta /login: inicia sesión contra el backend api_jarvis365 (express-session)
  a través del authSlice de Redux (POST /auth/login con { email, password }).
  Al autenticarse, la cookie de sesión queda guardada y se navega al dashboard.
*/
export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loginPending, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Si ya hay sesión (o acaba de iniciarse), fuera de la pantalla de login.
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Limpia cualquier error de un intento anterior al montar.
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLocalError('Completa el correo y la contraseña.');
      return;
    }
    setLocalError(null);
    void dispatch(login({ email: email.trim(), password }));
  };

  const shownError = localError ?? error;

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-6 py-12">
      <AuroraBackground />
      <div className="animate-scale-in w-full max-w-sm">
        <div className="glass rounded-2xl border p-8 shadow-xl">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <BrandMark className="h-14 w-14 drop-shadow-[0_4px_14px_rgba(50,123,50,0.35)]" />
            <h1 className="m-0 text-xl font-bold">Iniciar sesión</h1>
            <p className="m-0 text-xs text-muted">
              Accede al dashboard de Amazonas 365
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Correo electrónico" htmlFor="loginEmail">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="loginEmail"
                  type="email"
                  autoComplete="username"
                  className={`${inputClasses} w-full pl-9`}
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Field>

            <Field label="Contraseña" htmlFor="loginPassword">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="loginPassword"
                  type="password"
                  autoComplete="current-password"
                  className={`${inputClasses} w-full pl-9`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </Field>

            {shownError && (
              <p className="m-0 flex items-center gap-1.5 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                {shownError}
              </p>
            )}

            <Button type="submit" disabled={loginPending} className="w-full py-2.5">
              <LogIn className="h-4 w-4" />
              {loginPending ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a la bienvenida
          </Link>
        </p>
      </div>
    </div>
  );
}
