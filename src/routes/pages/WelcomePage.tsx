import { Link } from 'react-router';
import {
  Bot,
  Cog,
  Cpu,
  DatabaseBackup,
  Globe,
  LayoutDashboard,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/Logo';

/* Ruta raíz (/): página de bienvenida con acceso al login y al dashboard. */

const features = [
  {
    Icon: Bot,
    title: 'Modelos locales',
    text: 'Conecta con tu servidor LM Studio y elige el modelo con el que quieres trabajar.',
  },
  {
    Icon: Globe,
    title: 'Búsqueda web',
    text: 'Enriquece las respuestas con resultados de internet en tiempo real vía Tavily.',
  },
  {
    Icon: DatabaseBackup,
    title: 'Historial persistente',
    text: 'Tus conversaciones se guardan en el navegador y puedes exportarlas o importarlas.',
  },
];

const badges = [
  { Icon: Cpu, label: 'IA local' },
  { Icon: Cog, label: 'Automatización' },
  { Icon: Sparkles, label: 'Respuestas enriquecidas' },
];

export default function WelcomePage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-10 px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-5">
        {/* El logo oficial sobre una placa glass para que luzca en ambos temas */}
        <div className="glass rounded-3xl border px-10 py-6 shadow-lg">
          <BrandLogo className="h-14 w-auto sm:h-16" />
        </div>
        <p className="m-0 max-w-xl text-sm leading-relaxed text-muted">
          Tu cliente de chat para modelos de lenguaje locales: respuestas con
          texto enriquecido, resaltado de código automático y búsqueda web
          opcional, todo desde tu navegador.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {badges.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 text-[11px] font-medium text-muted"
            >
              <Icon className="h-3.5 w-3.5 text-accent" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map(({ Icon, title, text }) => (
          <div
            key={title}
            className="glass rounded-2xl border p-5 text-left shadow-sm"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-strong/10">
              <Icon className="h-5 w-5 text-accent-strong dark:text-success" />
            </span>
            <h2 className="mb-1 mt-3 text-sm font-semibold">{title}</h2>
            <p className="m-0 text-xs leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-strong px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent"
        >
          <LogIn className="h-4 w-4" />
          Iniciar sesión
        </Link>
        <Link
          to="/dashboard"
          className="glass inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-panel-hover"
        >
          <LayoutDashboard className="h-4 w-4 text-accent" />
          Ir al dashboard
        </Link>
      </div>
    </div>
  );
}
