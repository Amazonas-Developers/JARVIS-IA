import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  LoaderCircle,
  TriangleAlert,
  X,
} from 'lucide-react';
import type { AttachmentKind, AttachmentMeta } from '@/types/chat';
import { formatBytes } from '@/libs/utils';

const kindIcons: Record<AttachmentKind, typeof File> = {
  image: FileImage,
  pdf: FileText,
  word: FileText,
  sheet: FileSpreadsheet,
  text: FileText,
  zip: FileArchive,
  archive: FileArchive,
  video: FileVideo,
  audio: FileAudio,
  other: File,
};

interface AttachmentChipProps {
  meta: AttachmentMeta;
  /** Estado de procesado (solo en el input; en los mensajes no se usa). */
  status?: 'processing' | 'ready' | 'error';
  onRemove?: () => void;
}

/** Píldora que representa un archivo adjunto (en el input y en las burbujas). */
export default function AttachmentChip({ meta, status, onRemove }: AttachmentChipProps) {
  const Icon = kindIcons[meta.kind];

  return (
    <span className="inline-flex max-w-64 items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-[11px] text-foreground shadow-sm">
      {status === 'processing' ? (
        <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" />
      ) : status === 'error' ? (
        <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-error" />
      ) : (
        <Icon className="h-3.5 w-3.5 shrink-0 text-accent" />
      )}
      <span className="truncate" title={meta.name}>
        {meta.name}
      </span>
      <span className="shrink-0 text-muted">{formatBytes(meta.size)}</span>
      {onRemove && (
        <button
          type="button"
          title="Quitar adjunto"
          className="shrink-0 cursor-pointer rounded-full p-0.5 text-muted transition-colors hover:bg-error/10 hover:text-error"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
