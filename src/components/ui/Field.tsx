import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

/** Campo de formulario: etiqueta pequeña gris + control. */
export default function Field({ label, htmlFor, className = '', children }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={htmlFor} className="text-xs text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Clases compartidas para inputs y selects del panel de configuración. */
export const inputClasses =
  'rounded-lg border border-line bg-panel-2 px-2.5 py-2 text-[13px] text-foreground ' +
  'outline-none focus:ring-1 focus:ring-accent';
