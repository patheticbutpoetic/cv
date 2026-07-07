import {
  safeFileName,
  resolveDuplicateName,
  validateDocumentName,
  DEFAULT_NAME,
} from './safeFileName';

describe('safeFileName', () => {
  it('removes invalid characters (PRD §25.1 example)', () => {
    expect(safeFileName('My/File:Test.pdf')).toBe('My_File_Test.pdf');
  });

  it('trims surrounding spaces', () => {
    expect(safeFileName('   Report   ')).toBe('Report');
  });

  it('caps length at 80 characters', () => {
    const long = 'a'.repeat(120);
    expect(safeFileName(long).length).toBe(80);
  });

  it('falls back to Untitled Scan when empty', () => {
    expect(safeFileName('')).toBe(DEFAULT_NAME);
    expect(safeFileName('   ')).toBe(DEFAULT_NAME);
    expect(safeFileName(null)).toBe(DEFAULT_NAME);
  });
});

describe('resolveDuplicateName', () => {
  it('returns name unchanged when unique', () => {
    expect(resolveDuplicateName('Scan', ['Other'])).toBe('Scan');
  });

  it('appends - 2 for a duplicate', () => {
    expect(resolveDuplicateName('Scan', ['Scan'])).toBe('Scan - 2');
  });

  it('skips to next free suffix', () => {
    expect(resolveDuplicateName('Scan', ['Scan', 'Scan - 2'])).toBe('Scan - 3');
  });

  it('compares case-insensitively', () => {
    expect(resolveDuplicateName('scan', ['SCAN'])).toBe('scan - 2');
  });
});

describe('validateDocumentName', () => {
  it('rejects empty names', () => {
    expect(validateDocumentName('   ')).toMatch(/empty/i);
  });

  it('rejects invalid characters', () => {
    expect(validateDocumentName('bad/name')).toMatch(/cannot contain/i);
  });

  it('accepts a good name', () => {
    expect(validateDocumentName('Math Notes')).toBeNull();
  });
});
