import type { ScanMode } from '@/types/scanner';
import { formatLongDate } from '@/utils/dateFormat';
import { safeFileName, resolveDuplicateName } from '@/utils/safeFileName';

/**
 * Pure Smart Auto Naming core (PRD §47.1). Framework-free and unit-testable.
 */

const MODE_LABEL: Record<ScanMode, string> = {
  document: 'Document',
  receipt: 'Receipt',
  id_card: 'ID Card',
  homework_notes: 'Homework Notes',
  whiteboard: 'Whiteboard',
  photo_to_pdf: 'Photos PDF',
};

export interface SuggestNameInput {
  mode: ScanMode;
  date?: Date | string | number;
  /** OCR-derived title, used only when available and reliable (Phase 4). */
  ocrTitle?: string;
  /** Existing names to avoid collisions. */
  existingNames?: string[];
}

/**
 * Suggests a document name from mode + date, improved by OCR text when present.
 * Examples: "Document - July 7, 2026", "Math Notes - July 7, 2026".
 */
export function suggestDocumentName(input: SuggestNameInput): string {
  const dateLabel = formatLongDate(input.date ?? new Date());
  const base = input.ocrTitle?.trim()
    ? input.ocrTitle.trim()
    : MODE_LABEL[input.mode];

  const composed = safeFileName(`${base} - ${dateLabel}`);
  return resolveDuplicateName(composed, input.existingNames ?? []);
}
