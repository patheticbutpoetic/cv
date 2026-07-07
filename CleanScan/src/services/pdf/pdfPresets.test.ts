import { QUALITY_PRESETS, resolveJpegCompression } from './pdfPresets';

describe('quality presets (PRD §18.1)', () => {
  it('matches the spec table', () => {
    expect(QUALITY_PRESETS.LOW).toMatchObject({ targetWidth: 1000, jpegCompression: 0.55 });
    expect(QUALITY_PRESETS.MEDIUM).toMatchObject({ targetWidth: 1600, jpegCompression: 0.75 });
    expect(QUALITY_PRESETS.HIGH).toMatchObject({ targetWidth: 2200, jpegCompression: 0.9 });
  });
});

describe('resolveJpegCompression (PRD §18.2)', () => {
  it('keeps balanced quality at medium compression', () => {
    expect(resolveJpegCompression('MEDIUM', 'MEDIUM')).toBe(0.75);
  });

  it('lowers quality at high compression', () => {
    expect(resolveJpegCompression('HIGH', 'HIGH')).toBeLessThan(0.9);
  });

  it('never exceeds 1 or drops below 0.3', () => {
    expect(resolveJpegCompression('HIGH', 'LOW')).toBeLessThanOrEqual(1);
    expect(resolveJpegCompression('LOW', 'HIGH')).toBeGreaterThanOrEqual(0.3);
  });
});
