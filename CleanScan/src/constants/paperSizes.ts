import type { PaperSize } from '@/types/document';

/**
 * Common 72 DPI PDF point sizes (PRD §19).
 * Width/height are in PDF points (portrait).
 */
export const PAPER_SIZES: Record<PaperSize, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  LETTER: { width: 612, height: 792 },
  LEGAL: { width: 612, height: 1008 },
};

/** Label shown in dropdowns. */
export const PAPER_SIZE_LABELS: Record<PaperSize, string> = {
  A4: 'A4',
  LETTER: 'Letter',
  LEGAL: 'Legal',
};

/**
 * Returns paper dimensions in points. For higher quality, dimensions can be
 * scaled while keeping ratio (PRD §19).
 */
export function getPaperDimensions(
  size: PaperSize,
  scale = 1
): { width: number; height: number } {
  const base = PAPER_SIZES[size];
  return { width: base.width * scale, height: base.height * scale };
}
