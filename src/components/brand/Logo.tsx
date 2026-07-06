import logoUrl from '@/assets/amazonas365-logo.png';

/*
  Identidad Amazonas 365 (jarvis365.net):
  - BrandLogo: el logotipo oficial completo (PNG descargado del sitio).
  - BrandMark: el isotipo (anillo verde + hoja lima) recreado en SVG para
    que escale nítido y funcione en ambos temas.
  Colores de marca: verde #327B32 · lima #B8CE30.
*/

export function BrandLogo({ className = 'h-8 w-auto' }: { className?: string }) {
  return <img src={logoUrl} alt="Amazonas 365" className={className} />;
}

export function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Amazonas 365"
    >
      <circle
        cx="50"
        cy="50"
        r="39"
        fill="none"
        stroke="#327B32"
        strokeWidth="13"
        className="dark:[stroke:#4aa851]"
      />
      <path
        d="M51 13 C 62.5 34, 63.5 62, 51 87 C 39.5 63, 40 35, 51 13 Z"
        fill="#B8CE30"
      />
    </svg>
  );
}

/* Isotipo + nombre en texto: legible sobre fondos claros y oscuros. */
export function BrandWordmark({ markClassName = 'h-7 w-7' }: { markClassName?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <BrandMark className={markClassName} />
      <span className="text-sm font-extrabold tracking-wider text-accent-strong dark:text-success">
        AMAZONAS <span className="text-lime">365</span>
      </span>
    </span>
  );
}
