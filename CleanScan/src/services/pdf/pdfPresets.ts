import type { CompressionLevel, PdfQuality } from '@/types/scanner';

/** Quality presets (PRD §18.1): image width target + JPEG compression. */
export const QUALITY_PRESETS: Record<
  PdfQuality,
  { targetWidth: number; jpegCompression: number; useCase: string }
> = {
  LOW: { targetWidth: 1000, jpegCompression: 0.55, useCase: 'WhatsApp / small files' },
  MEDIUM: { targetWidth: 1600, jpegCompression: 0.75, useCase: 'Normal documents' },
  HIGH: { targetWidth: 2200, jpegCompression: 0.9, useCase: 'Contracts / printing' },
};

/** Compression presets (PRD §18.2) modulate the base JPEG quality. */
export const COMPRESSION_MULTIPLIER: Record<CompressionLevel, number> = {
  LOW: 1.1, // bigger file, best quality
  MEDIUM: 1.0, // balanced
  HIGH: 0.8, // smaller file, lower quality
};

/**
 * Resolves the effective JPEG compression (0..1) from quality + compression.
 */
export function resolveJpegCompression(
  quality: PdfQuality,
  compression: CompressionLevel
): number {
  const base = QUALITY_PRESETS[quality].jpegCompression;
  const adjusted = base * COMPRESSION_MULTIPLIER[compression];
  return Math.max(0.3, Math.min(1, Number(adjusted.toFixed(2))));
}
