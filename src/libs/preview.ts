/*
  Utilidades para la vista previa (sandbox) del código que genera el modelo.
  Se previsualiza HTML/SVG: el código se ejecuta en un <iframe sandbox> aislado
  (sin allow-same-origin → sin acceso a la sesión ni al documento padre). Todo
  ocurre DENTRO de la app (preview inline o modal); el PDF también se genera en
  la misma página, sin abrir pestañas nuevas.
*/

/** ¿Este bloque de código se puede previsualizar como página? */
export function isPreviewable(lang: string | null, code: string): boolean {
  const l = (lang ?? '').toLowerCase();
  if (['html', 'htm', 'xhtml', 'svg', 'xml'].includes(l)) return true;
  const head = code.trimStart().slice(0, 200).toLowerCase();
  return (
    head.startsWith('<!doctype html') ||
    head.startsWith('<html') ||
    head.startsWith('<svg')
  );
}

function isFullHtmlDoc(code: string): boolean {
  const head = code.trimStart().slice(0, 200).toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
}

function isSvg(lang: string | null, code: string): boolean {
  return (
    (lang ?? '').toLowerCase() === 'svg' ||
    code.trimStart().toLowerCase().startsWith('<svg')
  );
}

/**
 * Construye el documento HTML completo para el iframe / la exportación a PDF.
 * - Documento HTML completo: se usa tal cual.
 * - SVG: se centra sobre fondo blanco.
 * - Fragmento HTML: se envuelve en una página mínima y legible.
 */
export function buildPreviewDoc(code: string, lang: string | null): string {
  if (isFullHtmlDoc(code)) return code;

  const resetHead = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *{box-sizing:border-box}
  html,body{margin:0}
  body{padding:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#111;background:#fff;line-height:1.5}
  img,svg,canvas,video{max-width:100%}
</style></head><body>`;

  if (isSvg(lang, code)) {
    return `${resetHead}<div style="display:flex;justify-content:center;align-items:center;min-height:80vh">${code}</div></body></html>`;
  }

  return `${resetHead}${code}</body></html>`;
}

/** Inserta un fragmento justo antes de </body> (o al final si no existe). */
function injectBeforeBodyEnd(doc: string, snippet: string): string {
  const idx = doc.toLowerCase().lastIndexOf('</body>');
  if (idx !== -1) return `${doc.slice(0, idx)}${snippet}${doc.slice(idx)}`;
  return doc + snippet;
}

// Script que se inyecta en el documento a imprimir: se imprime a sí mismo al
// cargar y avisa al padre por postMessage cuando termina (para limpiar).
const PRINT_SCRIPT = `<script>
  window.addEventListener('load', function () {
    setTimeout(function () { try { window.focus(); window.print(); } catch (e) {} }, 350);
  });
  window.addEventListener('afterprint', function () {
    try { parent.postMessage('a365-print-done', '*'); } catch (e) {}
  });
<\/script>`;

/**
 * Genera un PDF del documento SIN salir de la app ni abrir pestañas: monta un
 * iframe oculto en la propia página, aislado (sandbox sin allow-same-origin),
 * que se imprime a sí mismo → el navegador ofrece "Guardar como PDF". El iframe
 * se retira solo al terminar (o por tiempo de seguridad).
 */
export function printDocToPdf(doc: string): void {
  const printable = injectBeforeBodyEnd(doc, PRINT_SCRIPT);
  const iframe = document.createElement('iframe');
  // allow-scripts (autoimpresión) + allow-modals (diálogo de impresión).
  // Sin allow-same-origin: el iframe no puede tocar la sesión ni el DOM padre.
  iframe.setAttribute('sandbox', 'allow-scripts allow-modals');
  iframe.setAttribute('aria-hidden', 'true');
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
    height: '0',
    border: '0',
    opacity: '0',
  });

  const cleanup = () => {
    window.removeEventListener('message', onMessage);
    iframe.remove();
  };
  const onMessage = (e: MessageEvent) => {
    if (e.data === 'a365-print-done') cleanup();
  };

  window.addEventListener('message', onMessage);
  // Red de seguridad por si el navegador no emite 'afterprint'.
  window.setTimeout(cleanup, 120_000);

  iframe.srcdoc = printable;
  document.body.appendChild(iframe);
}
