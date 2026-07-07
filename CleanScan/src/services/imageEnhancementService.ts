import * as ImageManipulator from 'expo-image-manipulator';
import type { DocumentPage } from '@/types/page';
import type { PdfQuality, ScanFilter } from '@/types/scanner';
import { resizeForPdf } from './cropService';
import { QUALITY_PRESETS } from './pdf/pdfPresets';
import { logger } from '@/utils/logger';

/**
 * imageEnhancementService — apply the selected filter and prepare images for PDF
 * (PRD §17.4, §8.6).
 *
 * MVP behavior: filter choice is stored in page metadata and applied as a
 * lightweight operation (resize/compress + optional grayscale). True B&W
 * threshold / shadow removal is Phase 2/3 (needs real image processing / Skia).
 */

/** Filter goals (PRD §8.6 table) surfaced for UI copy. */
export const FILTER_LABELS: Record<ScanFilter, string> = {
  ORIGINAL: 'Original',
  CLEAN: 'Clean Scan',
  BW: 'B&W',
  GRAYSCALE: 'Grayscale',
  COLOR: 'Color',
};

/**
 * Applies a basic enhancement pass and returns an updated page with an
 * `enhancedUri`. MVP keeps this cheap and non-destructive.
 */
export async function applyBasicEnhancement(page: DocumentPage): Promise<DocumentPage> {
  try {
    const actions: ImageManipulator.Action[] = [];
    if (page.rotation) actions.push({ rotate: page.rotation });

    const result = await ImageManipulator.manipulateAsync(page.workingUri, actions, {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { ...page, enhancedUri: result.uri };
  } catch (error) {
    logger.warn('enhance', 'applyBasicEnhancement fell back to working image');
    return { ...page, enhancedUri: page.workingUri };
  }
}

/**
 * Produces the final image URI used for PDF generation: applies rotation,
 * resizes/compresses for the chosen quality (PRD §18.1).
 */
export async function prepareImageForPdf(
  page: DocumentPage,
  quality: PdfQuality
): Promise<string> {
  const preset = QUALITY_PRESETS[quality];
  try {
    const actions: ImageManipulator.Action[] = [];
    if (page.rotation) actions.push({ rotate: page.rotation });
    actions.push({ resize: { width: preset.targetWidth } });

    const result = await ImageManipulator.manipulateAsync(
      page.enhancedUri ?? page.workingUri,
      actions,
      { compress: preset.jpegCompression, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    logger.warn('enhance', 'prepareImageForPdf fell back to resizeForPdf');
    return resizeForPdf(page.enhancedUri ?? page.workingUri, quality);
  }
}

// --- Phase 2/3 placeholders (documented; not wired as fake functionality) ---
// applyBlackAndWhite, applyGrayscale, applyCleanScan, removeShadows, sharpenText
// require real image processing (Skia / native) and are part of Phase 2/3.
