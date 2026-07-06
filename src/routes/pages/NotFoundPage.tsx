import { Link } from 'react-router';
import { House, LayoutDashboard, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <SearchX className="h-10 w-10 text-muted" />
      <h1 className="m-0 text-2xl font-semibold">404</h1>
      <p className="m-0 text-sm text-muted">Esta página no existe.</p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          <House className="h-4 w-4" />
          Ir a la bienvenida
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          <LayoutDashboard className="h-4 w-4" />
          Ir al dashboard
        </Link>
      </div>
    </div>
  );
}
