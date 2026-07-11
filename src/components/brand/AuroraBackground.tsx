/*
  Fondo decorativo "aurora" (gradient-mesh): manchas de color de marca,
  desenfocadas y en deriva lenta, para dar profundidad a las páginas públicas
  sin distraer. Es puramente decorativo (aria-hidden) y se sitúa detrás del
  contenido. El movimiento se detiene con prefers-reduced-motion (ver index.css).
*/
export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <span
        className="aurora-blob"
        style={{
          top: '-8%',
          left: '-6%',
          width: '42vw',
          maxWidth: 520,
          height: '42vw',
          maxHeight: 520,
          background: 'radial-gradient(circle, #327B32, transparent 68%)',
        }}
      />
      <span
        className="aurora-blob"
        style={{
          bottom: '-12%',
          right: '-8%',
          width: '46vw',
          maxWidth: 560,
          height: '46vw',
          maxHeight: 560,
          background: 'radial-gradient(circle, #B8CE30, transparent 68%)',
          animationDelay: '-6s',
        }}
      />
      <span
        className="aurora-blob"
        style={{
          top: '30%',
          right: '22%',
          width: '26vw',
          maxWidth: 320,
          height: '26vw',
          maxHeight: 320,
          background: 'radial-gradient(circle, #4aa851, transparent 70%)',
          opacity: 0.35,
          animationDelay: '-11s',
        }}
      />
    </div>
  );
}
