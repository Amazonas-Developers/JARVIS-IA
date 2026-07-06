import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

/*
  Botón base con "velo": una capa ::after cubre el botón y se enciende
  suavemente al pasar el cursor, sobre cualquier variante. Los iconos
  (lucide-react) se pasan como children y el gap los separa del texto.
*/
const base =
  'relative inline-flex cursor-pointer items-center justify-center gap-1.5 overflow-hidden ' +
  'rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  "after:pointer-events-none after:absolute after:inset-0 after:content-[''] after:transition-colors";

const variants = {
  primary: 'bg-accent-strong text-white shadow-sm hover:after:bg-white/15',
  secondary:
    'border border-line bg-panel text-foreground shadow-sm hover:after:bg-foreground/5',
};

export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
