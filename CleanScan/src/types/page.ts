import type { CropRect, ScanFilter, ScanQualityResult } from './scanner';

/**
 * A single page inside an in-progress scan (PRD §14.1, merged with §43.6).
 *
 * Image URIs:
 *  - originalUri: the raw captured/imported image (never mutated).
 *  - workingUri: cropped/rotated working copy used for editing + preview.
 *  - enhancedUri: filtered output used for PDF generation (Phase 2/3).
 *  - thumbnailUri: small image for grids/library.
 */
export interface DocumentPage {
  id: string;
  documentId?: string;
  originalUri: string;
  workingUri: string;
  enhancedUri?: string;
  thumbnailUri?: string;
  orderIndex: number;
  width?: number;
  height?: number;
  rotation: number; // degrees, normalized 0/90/180/270
  crop?: CropRect;
  filter: ScanFilter;
  brightness: number; // -100..100, 0 = neutral
  contrast: number; // -100..100
  sharpness: number; // -100..100
  quality?: ScanQualityResult;
  createdAt: string;
  updatedAt: string;
}
