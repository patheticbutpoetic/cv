import { suggestDocumentName } from './naming';

const date = new Date('2026-07-07T10:00:00Z');

describe('suggestDocumentName (PRD §47.1)', () => {
  it('names Document mode by mode + date', () => {
    expect(suggestDocumentName({ mode: 'document', date })).toBe('Document - July 7, 2026');
  });

  it('names Receipt mode', () => {
    expect(suggestDocumentName({ mode: 'receipt', date })).toBe('Receipt - July 7, 2026');
  });

  it('names ID Card mode', () => {
    expect(suggestDocumentName({ mode: 'id_card', date })).toBe('ID Card - July 7, 2026');
  });

  it('uses OCR title when available', () => {
    expect(
      suggestDocumentName({ mode: 'document', date, ocrTitle: 'Math Notes' })
    ).toBe('Math Notes - July 7, 2026');
  });

  it('sanitizes invalid characters in OCR title', () => {
    expect(
      suggestDocumentName({ mode: 'document', date, ocrTitle: 'Bad/Name' })
    ).toBe('Bad_Name - July 7, 2026');
  });

  it('resolves duplicate names', () => {
    const existing = ['Document - July 7, 2026'];
    expect(suggestDocumentName({ mode: 'document', date, existingNames: existing })).toBe(
      'Document - July 7, 2026 - 2'
    );
  });
});
