import type {
  CompressionLevel,
  FitMode,
  PaperSize,
  PdfQuality,
  ScanMode,
} from './scanner';
import type { DocumentPage } from './page';

export type { PaperSize, PdfQuality, CompressionLevel, FitMode, ScanMode };

/**
 * A saved PDF document in the local library (PRD §14.1 DocumentItem merged
 * with §58.4 DocumentRecord).
 */
export interface Document {
  id: string;
  name: string;
  pdfUri: string;
  thumbnailUri?: string;
  pageCount: number;
  fileSizeBytes: number;
  paperSize: PaperSize;
  quality: PdfQuality;
  compression: CompressionLevel;
  mode?: ScanMode;
  isFavorite: boolean;
  folderId?: string;
  ocrText?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
}

/** In-progress scan session with a selected mode (PRD §45.4 / §58.1). */
export interface ScanProject {
  id: string;
  mode: ScanMode;
  pages: DocumentPage[];
  title?: string;
  createdAt: string;
  updatedAt: string;
}

/** ID Card project — front + back on one page (PRD §46.4). */
export interface IdCardProject {
  id: string;
  frontPage?: DocumentPage;
  backPage?: DocumentPage;
  paperSize: 'A4' | 'LETTER';
  includeLabels: boolean;
  createdAt: string;
  updatedAt: string;
}

/** User-confirmed export options (PRD §17.5 PdfOptions). */
export interface PdfExportSettings {
  name: string;
  paperSize: PaperSize;
  quality: PdfQuality;
  compression: CompressionLevel;
  fitMode: FitMode;
}

/** Library folder (PRD §15.3, Phase 2). */
export interface LibraryFolder {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}
