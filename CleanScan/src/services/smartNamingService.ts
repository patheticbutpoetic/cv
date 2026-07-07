/**
 * smartNamingService / documentNamingService (PRD §47, §57.2).
 * Suggests document names from scan mode + date, improved by OCR text when
 * available (Phase 4). Sanitizes filenames and resolves duplicates.
 *
 * The pure logic lives in ./naming/naming so it can be unit-tested without any
 * native dependency.
 */
export { suggestDocumentName } from './naming/naming';
export type { SuggestNameInput } from './naming/naming';
export { safeFileName, resolveDuplicateName, validateDocumentName } from '@/utils/safeFileName';
