import type {
  AttachmentKind,
  AttachmentMeta,
  ProcessedAttachment,
} from '@/types/chat';
import { formatBytes, getErrorMessage } from '@/libs/utils';

/*
  Procesado de archivos adjuntos EN EL NAVEGADOR (no se sube nada a ningún
  servidor propio): a cada tipo se le extrae lo que el modelo puede consumir.

  - Imágenes → data URL reescalada (se envía al modelo como visión).
  - PDF (pdfjs-dist) / Word .docx (mammoth) / Excel-ODS (SheetJS) / texto
    plano / ZIP (jszip, lista su contenido) → texto que se inyecta al mensaje.
  - Video, audio, RAR/7z y otros binarios → solo metadatos (nombre y peso).

  Las librerías pesadas se cargan con import() dinámico: solo se descargan
  la primera vez que se adjunta un archivo de ese tipo.
*/

/** Tope de texto extraído por archivo (evita reventar el contexto del modelo). */
const MAX_TEXT_CHARS = 60_000;
/** Lado máximo de las imágenes que se envían al modelo. */
const MAX_IMAGE_DIM = 1024;
/** Máximo de entradas listadas de un ZIP. */
const MAX_ZIP_ENTRIES = 200;

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'html', 'htm', 'css',
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go',
  'rs', 'rb', 'php', 'sql', 'sh', 'bat', 'ps1', 'yml', 'yaml', 'toml', 'ini',
  'log', 'env', 'svg',
]);

const KIND_LABELS: Record<AttachmentKind, string> = {
  image: 'imagen',
  pdf: 'PDF',
  word: 'documento Word',
  sheet: 'hoja de cálculo',
  text: 'texto',
  zip: 'archivo ZIP',
  archive: 'archivo comprimido',
  video: 'video',
  audio: 'audio',
  other: 'archivo',
};

export function kindLabel(kind: AttachmentKind): string {
  return KIND_LABELS[kind];
}

export function detectKind(file: File): AttachmentKind {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'svg') return 'text'; // el SVG es XML: más útil como texto
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx' || ext === 'doc') return 'word';
  if (['xlsx', 'xls', 'ods'].includes(ext)) return 'sheet';
  if (ext === 'zip') return 'zip';
  if (['rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) return 'archive';
  if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith('text/')) return 'text';
  return 'other';
}

function truncate(text: string): string {
  const clean = text.trim();
  if (clean.length <= MAX_TEXT_CHARS) return clean;
  return `${clean.slice(0, MAX_TEXT_CHARS)}\n\n[... contenido truncado: el archivo es más largo ...]`;
}

/** Procesa un archivo según su tipo. Nunca lanza: los fallos van en `error`. */
export async function processFile(file: File): Promise<ProcessedAttachment> {
  const meta: AttachmentMeta = {
    name: file.name,
    size: file.size,
    kind: detectKind(file),
  };
  try {
    switch (meta.kind) {
      case 'image':
        return { meta, imageDataUrl: await readImageScaled(file) };
      case 'pdf':
        return { meta, text: truncate(await extractPdf(file)) };
      case 'word':
        return { meta, text: truncate(await extractWord(file)) };
      case 'sheet':
        return { meta, text: truncate(await extractSheet(file)) };
      case 'text':
        return { meta, text: truncate(await file.text()) };
      case 'zip':
        return { meta, text: await listZip(file) };
      default:
        return { meta }; // video/audio/archive/other: solo metadatos
    }
  } catch (err) {
    return { meta, error: getErrorMessage(err) };
  }
}

/**
 * Construye el texto que se envía al modelo: el mensaje del usuario más el
 * contenido extraído de cada adjunto (o sus metadatos si no era legible).
 *
 * El contenido de los archivos legibles se incrusta AQUÍ, en el propio
 * mensaje, con una instrucción explícita: los modelos pequeños tienden a
 * responder "súbeme el archivo" si no se les deja claro que el contenido ya
 * está incluido y no hay que adjuntar nada más.
 */
export function buildModelContent(
  userText: string,
  attachments: ProcessedAttachment[],
): string {
  if (attachments.length === 0) return userText;

  const images = attachments.filter((a) => a.meta.kind === 'image');
  const withText = attachments.filter((a) => a.text !== undefined);
  const binaries = attachments.filter(
    (a) => a.meta.kind !== 'image' && a.text === undefined,
  );

  const parts: string[] = [];

  // Instrucción de encuadre para que el modelo NO pida que se suba el archivo.
  const notes: string[] = [];
  if (withText.length > 0)
    notes.push(
      'el texto completo de los documentos adjuntos está incluido más abajo, entre marcadores',
    );
  if (images.length > 0)
    notes.push('las imágenes adjuntas se te envían junto a este mensaje para que las veas');
  if (notes.length > 0) {
    parts.push(
      `[El usuario adjuntó ${attachments.length} archivo(s): ${notes.join(' y ')}. ` +
        `Analiza ese contenido directamente y responde; NO pidas que se suba de nuevo.]`,
    );
  }

  if (userText.trim()) parts.push(userText.trim());

  for (const a of withText) {
    parts.push(
      `----- INICIO DEL ARCHIVO «${a.meta.name}» (${kindLabel(a.meta.kind)}) -----\n` +
        `${a.text}\n----- FIN DEL ARCHIVO «${a.meta.name}» -----`,
    );
  }

  for (const a of binaries) {
    parts.push(
      `[Archivo adjunto no analizable en el navegador: «${a.meta.name}» ` +
        `(${kindLabel(a.meta.kind)}, ${formatBytes(a.meta.size)})` +
        (a.error ? ` — error al leerlo: ${a.error}` : '') +
        `]`,
    );
  }

  return parts.join('\n\n');
}

/* ── Extractores por tipo (librerías con carga diferida) ── */

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url'))
    .default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() })
    .promise;
  let out = '';
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const line = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    out += `${line}\n`;
    if (out.length > MAX_TEXT_CHARS * 1.2) break; // ya hay de sobra
  }
  return out;
}

async function extractWord(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });
  return result.value;
}

async function extractSheet(file: File): Promise<string> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  let out = '';
  for (const name of workbook.SheetNames) {
    out += `--- Hoja: ${name} ---\n`;
    out += `${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}\n`;
    if (out.length > MAX_TEXT_CHARS * 1.2) break;
  }
  return out;
}

async function listZip(file: File): Promise<string> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const names = Object.keys(zip.files);
  const listed = names
    .slice(0, MAX_ZIP_ENTRIES)
    .map((n) => (zip.files[n].dir ? `${n} (carpeta)` : n));
  return (
    `Listado del ZIP (${names.length} entrada(s)` +
    (names.length > MAX_ZIP_ENTRIES ? `, mostrando ${MAX_ZIP_ENTRIES}` : '') +
    `):\n${listed.join('\n')}`
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Reescala la imagen a un máximo de 1024px y la recomprime a JPEG:
 * suficiente para visión, y evita llenar el contexto y el localStorage.
 */
async function readImageScaled(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    // Formato que el navegador no rasteriza: se envía tal cual.
    return readFileAsDataUrl(file);
  }
}
