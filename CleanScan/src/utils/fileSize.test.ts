import {
  formatFileSize,
  estimatePdfSize,
  isLargePdf,
  LARGE_PDF_WARNING_BYTES,
} from './fileSize';

describe('formatFileSize', () => {
  it('formats bytes, KB, MB', () => {
    expect(formatFileSize(0)).toBe('0 KB');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });

  it('handles invalid input', () => {
    expect(formatFileSize(-5)).toBe('0 KB');
    expect(formatFileSize(NaN)).toBe('0 KB');
  });
});

describe('estimatePdfSize', () => {
  it('sums page sizes with overhead', () => {
    expect(estimatePdfSize([1000, 1000])).toBe(2100);
  });

  it('ignores negative sizes', () => {
    expect(estimatePdfSize([1000, -50])).toBe(1050);
  });
});

describe('isLargePdf', () => {
  it('flags many pages', () => {
    expect(isLargePdf(1000, 25)).toBe(true);
  });

  it('flags large estimated size', () => {
    expect(isLargePdf(LARGE_PDF_WARNING_BYTES + 1, 2)).toBe(true);
  });

  it('does not flag small documents', () => {
    expect(isLargePdf(1000, 3)).toBe(false);
  });
});
