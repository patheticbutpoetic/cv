import * as ImageManipulator from 'expo-image-manipulator';
import type { CropRect, PdfQuality } from '@/types/scanner';
import { QUALITY_PRESETS } from './pdf/pdfPresets';
import { toAppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * cropService — crop, rotate, resize, and thumbnail generation (PRD §17.3).
 * MVP uses rectangle crop + rotation + resize/compress via expo-image-manipulator.
 * Phase 3 adds four-point crop + perspective transform (native/OpenCV).
 */

/** Rotates an image by `degrees` (normalized to 0/90/180/270). */
export async function rotateImage(uri: string, degrees: number): Promise<string> {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized === 0) return uri;
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ rotate: normalized }],
      { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    throw toAppError('processing', error);
  }
}

/** Applies a rectangle crop in pixel space. */
export async function cropImage(uri: string, crop: CropRect): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          crop: {
            originX: Math.max(0, crop.originX),
            originY: Math.max(0, crop.originY),
            width: crop.width,
            height: crop.height,
          },
        },
      ],
      { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    throw toAppError('processing', error);
  }
}

/** Resizes/compresses an image toward the target width for the chosen quality (PRD §18.1). */
export async function resizeForPdf(uri: string, quality: PdfQuality): Promise<string> {
  const preset = QUALITY_PRESETS[quality];
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: preset.targetWidth } }],
      { compress: preset.jpegCompression, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    logger.warn('crop', 'resizeForPdf failed, using original');
    return uri;
  }
}

/** Small thumbnail for grids/library. */
export async function createThumbnail(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 300 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    throw toAppError('processing', error);
  }
}
