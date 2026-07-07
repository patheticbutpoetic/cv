import type { ScanMode, ScanFilter, PaperSize } from '@/types/scanner';
import type { IconName } from '@/components/common/Icon';

export interface ScanModeMeta {
  mode: ScanMode;
  title: string;
  description: string;
  icon: IconName;
  defaultFilter: ScanFilter;
  defaultPaperSize: PaperSize;
}

/** Smart Scan Mode metadata (PRD §45.1, §45.5). */
export const SCAN_MODES: ScanModeMeta[] = [
  {
    mode: 'document',
    title: 'Document',
    description: 'Contracts, letters, forms',
    icon: 'document',
    defaultFilter: 'CLEAN',
    defaultPaperSize: 'A4',
  },
  {
    mode: 'receipt',
    title: 'Receipt',
    description: 'Bills, small papers, store receipts',
    icon: 'receipt',
    defaultFilter: 'BW',
    defaultPaperSize: 'A4',
  },
  {
    mode: 'id_card',
    title: 'ID Card',
    description: 'Front and back on one page',
    icon: 'idCard',
    defaultFilter: 'COLOR',
    defaultPaperSize: 'A4',
  },
  {
    mode: 'homework_notes',
    title: 'Homework / Notes',
    description: 'Handwriting, school notes, exercises',
    icon: 'homework',
    defaultFilter: 'GRAYSCALE',
    defaultPaperSize: 'A4',
  },
  {
    mode: 'whiteboard',
    title: 'Whiteboard',
    description: 'Boards, markers, classroom notes',
    icon: 'whiteboard',
    defaultFilter: 'COLOR',
    defaultPaperSize: 'A4',
  },
  {
    mode: 'photo_to_pdf',
    title: 'Photo to PDF',
    description: 'Images without scanner cleanup',
    icon: 'images',
    defaultFilter: 'ORIGINAL',
    defaultPaperSize: 'A4',
  },
];

const MODE_LOOKUP: Record<ScanMode, ScanModeMeta> = SCAN_MODES.reduce(
  (acc, m) => ({ ...acc, [m.mode]: m }),
  {} as Record<ScanMode, ScanModeMeta>
);

export function getModeMeta(mode: ScanMode): ScanModeMeta {
  return MODE_LOOKUP[mode];
}
