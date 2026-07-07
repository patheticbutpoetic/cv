/**
 * idCardPdfService (PRD §57.3) — places front + back card images on one PDF
 * page, preserves color, uses safe margins, supports A4/Letter.
 *
 * NOTE: This feature is for scanning legitimate documents only. It does NOT
 * include fake ID creation, identity editing, or document forgery tools
 * (PRD §46).
 */
export { createIdCardPdf } from './pdfGenerationService';
