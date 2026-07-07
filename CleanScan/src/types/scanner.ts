/** Scanner-domain shared types (PRD §14, §43, §45, §58). */

export type PaperSize = 'A4' | 'LETTER' | 'LEGAL';
export type PdfQuality = 'LOW' | 'MEDIUM' | 'HIGH';
export type CompressionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/** MVP scanner-style filters (PRD §4.3 / §8.6). */
export type ScanFilter = 'ORIGINAL' | 'CLEAN' | 'BW' | 'GRAYSCALE' | 'COLOR';

/** Smart Scan Modes for V1.5 (PRD §45). */
export type ScanMode =
  | 'document'
  | 'receipt'
  | 'id_card'
  | 'homework_notes'
  | 'whiteboard'
  | 'photo_to_pdf';

/** Rectangle crop region in image pixel space. */
export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

/** Image fit strategy on the PDF page (PRD §4.4). */
export type FitMode = 'FIT' | 'FILL' | 'CENTER';

/** Scan Quality Score issues (PRD §43.6). */
export type ScanQualityIssue =
  | 'blur'
  | 'low_brightness'
  | 'high_brightness'
  | 'low_contrast'
  | 'low_resolution'
  | 'document_cut_off'
  | 'tilted'
  | 'shadow'
  | 'edge_detection_failed';

export type ScanQualityLabel = 'poor' | 'needs_review' | 'good' | 'excellent';

/** Result of analyzing a captured/imported page (PRD §43.6 / §58.3). */
export interface ScanQualityResult {
  score: number; // 0-100
  label: ScanQualityLabel;
  issues: ScanQualityIssue[];
  suggestions: string[];
}
