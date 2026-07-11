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
import AuroraBackground from '@/components/brand/AuroraBackground';

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
    <div className="relative flex min-h-full flex-col items-center justify-center gap-10 overflow-hidden px-6 py-12 text-center">
      <AuroraBackground />

      <div className="flex flex-col items-center gap-5">
        {/* El logo oficial sobre una placa glass para que luzca en ambos temas */}
        <div className="animate-scale-in glass rounded-3xl border px-10 py-6 shadow-lg">
          <BrandLogo className="h-14 w-auto sm:h-16" />
        </div>
        <p className="animate-fade-up delay-1 m-0 max-w-xl text-sm leading-relaxed text-muted">
          Tu cliente de chat para modelos de lenguaje locales: respuestas con
          texto enriquecido, resaltado de código automático y búsqueda web
          opcional, todo desde tu navegador.
        </p>
        <div className="animate-fade-up delay-2 flex flex-wrap items-center justify-center gap-2">
          {badges.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel/70 px-3 py-1 text-[11px] font-medium text-muted backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5 text-accent" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map(({ Icon, title, text }, i) => (
          <div
            key={title}
            className={`card-hover glass animate-fade-up delay-${i + 2} rounded-2xl border p-5 text-left shadow-sm`}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-strong/10 ring-1 ring-accent/15">
              <Icon className="h-5 w-5 text-accent-strong dark:text-success" />
            </span>
            <h2 className="mb-1 mt-3 text-sm font-semibold">{title}</h2>
            <p className="m-0 text-xs leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>

      <div className="animate-fade-up delay-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/login"
          className="group inline-flex items-center gap-2 rounded-lg bg-accent-strong px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg hover:shadow-accent/25"
        >
          <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Iniciar sesión
        </Link>
        <Link
          to="/dashboard"
          className="glass inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-panel-hover"
        >
          <LayoutDashboard className="h-4 w-4 text-accent" />
          Ir al dashboard
        </Link>
      </div>
    </div>
  );
}
