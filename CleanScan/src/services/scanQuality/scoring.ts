import type {
  ScanQualityIssue,
  ScanQualityLabel,
  ScanQualityResult,
} from '@/types/scanner';

/**
 * Pure Scan Quality scoring core (PRD §43.5). Framework-free so it is fully
 * unit-testable. The service layer feeds it simple image metrics.
 *
 * Metrics are normalized 0..1 where noted.
 */
export interface QualityMetrics {
  /** 0 (very blurry) .. 1 (sharp). */
  sharpness: number;
  /** Average luminance 0 (black) .. 1 (white). */
  brightness: number;
  /** Contrast 0 (flat) .. 1 (high). */
  contrast: number;
  /** Longest edge in pixels. */
  resolutionPx: number;
  /** True when the document appears cut off at the frame edges. */
  cutOff?: boolean;
  /** Estimated tilt in degrees (absolute). */
  tiltDegrees?: number;
  /** True when a strong shadow is detected. */
  strongShadow?: boolean;
  /** True when auto edge detection was attempted and failed. */
  edgeDetectionFailed?: boolean;
}

const BLUR_THRESHOLD = 0.45;
const DARK_THRESHOLD = 0.28;
const BRIGHT_THRESHOLD = 0.9;
const LOW_CONTRAST_THRESHOLD = 0.25;
const LOW_RESOLUTION_PX = 900;
const TILT_THRESHOLD_DEG = 7;

export function labelForScore(score: number): ScanQualityLabel {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 55) return 'needs_review';
  return 'poor';
}

const SUGGESTION_TEXT: Record<ScanQualityIssue, string> = {
  blur: 'Hold the phone steady to reduce blur.',
  low_brightness: 'Move to a brighter area or turn on the flash.',
  high_brightness: 'Reduce glare or move away from direct light.',
  low_contrast: 'Place the document on a darker, flat surface.',
  low_resolution: 'Move closer so the document fills the frame.',
  document_cut_off: 'Fit the whole document inside the frame.',
  tilted: 'Straighten the page so it is not tilted.',
  shadow: 'Avoid shadows across the page.',
  edge_detection_failed: 'Use a plain background so edges are clear.',
};

/**
 * Computes a Scan Quality result from image metrics.
 * Score starts at 100 and issues subtract points (PRD §43.5). Clamped 0..100.
 */
export function computeQualityScore(metrics: QualityMetrics): ScanQualityResult {
  let score = 100;
  const issues: ScanQualityIssue[] = [];

  if (metrics.sharpness < BLUR_THRESHOLD) {
    score -= 25;
    issues.push('blur');
  }
  if (metrics.brightness < DARK_THRESHOLD) {
    score -= 15;
    issues.push('low_brightness');
  } else if (metrics.brightness > BRIGHT_THRESHOLD) {
    score -= 10;
    issues.push('high_brightness');
  }
  if (metrics.contrast < LOW_CONTRAST_THRESHOLD) {
    score -= 10;
    issues.push('low_contrast');
  }
  if (metrics.cutOff) {
    score -= 25;
    issues.push('document_cut_off');
  }
  if (metrics.tiltDegrees !== undefined && metrics.tiltDegrees > TILT_THRESHOLD_DEG) {
    score -= 10;
    issues.push('tilted');
  }
  if (metrics.resolutionPx < LOW_RESOLUTION_PX) {
    score -= 15;
    issues.push('low_resolution');
  }
  if (metrics.strongShadow) {
    score -= 10;
    issues.push('shadow');
  }
  if (metrics.edgeDetectionFailed) {
    issues.push('edge_detection_failed');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    label: labelForScore(score),
    issues,
    suggestions: issues
      .filter((i) => i !== 'edge_detection_failed')
      .map((i) => SUGGESTION_TEXT[i]),
  };
}

/** Safe fallback if analysis throws (PRD §43.7: user can still continue). */
export function safeFallbackQuality(): ScanQualityResult {
  return { score: 75, label: 'good', issues: [], suggestions: [] };
}

/** Auto Retake Warning trigger rules (PRD §44.2). */
export function shouldWarnRetake(result: ScanQualityResult): boolean {
  return (
    result.score < 55 ||
    result.issues.includes('blur') ||
    result.issues.includes('document_cut_off')
  );
}
