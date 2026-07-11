import { LoaderCircle } from 'lucide-react';
import { BrandMark } from '@/components/brand/Logo';

/** Pantalla de carga a pantalla completa con la marca (verificación de sesión, etc.). */
export default function LoadingScreen({ message = 'Cargando…' }: { message?: string }) {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-5 text-muted">
      <BrandMark className="h-16 w-16 animate-pulse" />
      <div className="flex items-center gap-2 text-sm">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        {message}
      </div>
    </div>
  );
}
