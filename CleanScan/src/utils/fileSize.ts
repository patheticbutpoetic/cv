/**
 * Human-readable file size formatting used across Library/Export UI.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded = exponent === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[exponent]}`;
}

/** Rough estimate of PDF size from page images (PRD §8.8: estimate before generation). */
export function estimatePdfSize(pageSizesBytes: number[]): number {
  // JPEG-in-PDF overhead is small; add ~5% container overhead.
  const total = pageSizesBytes.reduce((sum, n) => sum + (n > 0 ? n : 0), 0);
  return Math.round(total * 1.05);
}

/** Threshold used for the "large PDF" warning (PRD §50.4): 25 MB. */
export const LARGE_PDF_WARNING_BYTES = 25 * 1024 * 1024;

export function isLargePdf(estimatedBytes: number, pageCount: number): boolean {
  return estimatedBytes > LARGE_PDF_WARNING_BYTES || pageCount > 20;
}
