import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, KeyRound, LogIn, TriangleAlert, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Field, { inputClasses } from '@/components/ui/Field';
import { BrandMark } from '@/components/brand/Logo';
import { http } from '@/libs/http';
import { getErrorMessage } from '@/libs/utils';

/*
  Ruta /login: inicia sesión contra el backend con express-session usando la
  instancia axios de libs/http.ts (withCredentials). Si el login responde OK,
  el navegador ya guardó la cookie de sesión y se navega al dashboard.
  El endpoint esperado es POST {VITE_API_URL}/auth/login { user, password }.
*/
export default function LoginPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !password) {
      setError('Completa el usuario y la contraseña.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await http.post('/auth/login', { user: user.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="glass rounded-2xl border p-8 shadow-xl">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <BrandMark className="h-14 w-14" />
            <h1 className="m-0 text-xl font-bold">Iniciar sesión</h1>
            <p className="m-0 text-xs text-muted">
              Accede al dashboard de Amazonas 365
            </p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <Field label="Usuario o correo" htmlFor="loginUser">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="loginUser"
                  type="text"
                  autoComplete="username"
                  className={`${inputClasses} w-full pl-9`}
                  placeholder="tu@correo.com"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
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

            {error && (
              <p className="m-0 flex items-center gap-1.5 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full py-2.5">
              <LogIn className="h-4 w-4" />
              {isSubmitting ? 'Entrando…' : 'Entrar'}
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
