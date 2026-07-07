import * as ImageManipulator from 'expo-image-manipulator';
import type { DocumentPage } from '@/types/page';
import type { ScanQualityResult } from '@/types/scanner';
import {
  computeQualityScore,
  safeFallbackQuality,
  shouldWarnRetake,
  type QualityMetrics,
} from './scanQuality/scoring';
import { logger } from '@/utils/logger';

/**
 * scanQualityService — analyze a captured/imported page and return a score
 * (PRD §43.7). Must be fast and fail safely: if analysis throws, the user can
 * still continue with a neutral score.
 *
 * MVP uses simple, cheap heuristics from image dimensions + a downsampled
 * sample. A real implementation would inspect pixel data (variance of Laplacian
 * for blur, histogram for brightness/contrast). Here we keep it dependency-light
 * and deterministic while exposing the exact scoring contract from §43.5.
 */

export { shouldWarnRetake };

async function estimateMetrics(page: DocumentPage): Promise<QualityMetrics> {
  // Downscale to a tiny image cheaply so we don't hold large bitmaps in memory.
  await ImageManipulator.manipulateAsync(page.workingUri, [{ resize: { width: 64 } }], {
    compress: 0.5,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  const longestEdge = Math.max(page.width ?? 0, page.height ?? 0) || 1600;
  const aspect = (page.width ?? 1) / (page.height ?? 1);

  // Heuristics: without pixel access we assume a reasonable capture but flag
  // obviously low-resolution or extreme-aspect images. Pixel-accurate metrics
  // arrive with the Phase 3 native module.
  return {
    sharpness: 0.8,
    brightness: 0.55,
    contrast: 0.5,
    resolutionPx: longestEdge,
    cutOff: aspect > 3 || aspect < 0.3,
    tiltDegrees: 0,
  };
}

export async function analyzePage(page: DocumentPage): Promise<ScanQualityResult> {
  try {
    const metrics = await estimateMetrics(page);
    return computeQualityScore(metrics);
  } catch (error) {
    logger.warn('scanQuality', 'analysis failed, using safe fallback');
    return safeFallbackQuality();
  }
}

/** Analyze from raw metrics (used by tests / future native pipeline). */
export function analyzeMetrics(metrics: QualityMetrics): ScanQualityResult {
  try {
    return computeQualityScore(metrics);
  } catch {
    return safeFallbackQuality();
  }
}
