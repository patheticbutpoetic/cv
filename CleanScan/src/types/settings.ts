import type { CompressionLevel, PaperSize, PdfQuality } from './scanner';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * User preferences (PRD §14.1 AppSettings merged with §58.5 SettingsState).
 */
export interface AppSettings {
  theme: ThemeMode;
  defaultPaperSize: PaperSize;
  defaultQuality: PdfQuality;
  defaultCompression: CompressionLevel;
  autoSaveToLibrary: boolean;
  hapticsEnabled: boolean;
  scanQualityWarningsEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  defaultPaperSize: 'A4',
  defaultQuality: 'HIGH',
  defaultCompression: 'MEDIUM',
  autoSaveToLibrary: true,
  hapticsEnabled: true,
  scanQualityWarningsEnabled: true,
};
