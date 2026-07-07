import {
  computeQualityScore,
  labelForScore,
  safeFallbackQuality,
  shouldWarnRetake,
  type QualityMetrics,
} from './scoring';

const perfect: QualityMetrics = {
  sharpness: 0.9,
  brightness: 0.6,
  contrast: 0.6,
  resolutionPx: 2200,
};

describe('computeQualityScore (PRD §43)', () => {
  it('returns excellent for a high-quality image', () => {
    const r = computeQualityScore(perfect);
    expect(r.score).toBeGreaterThanOrEqual(90);
    expect(r.label).toBe('excellent');
    expect(r.issues).toHaveLength(0);
  });

  it('returns a blur issue and subtracts 25', () => {
    const r = computeQualityScore({ ...perfect, sharpness: 0.2 });
    expect(r.issues).toContain('blur');
    expect(r.score).toBe(75);
  });

  it('flags low brightness (dark room)', () => {
    const r = computeQualityScore({ ...perfect, brightness: 0.1 });
    expect(r.issues).toContain('low_brightness');
    expect(r.score).toBe(85);
  });

  it('flags low contrast', () => {
    const r = computeQualityScore({ ...perfect, contrast: 0.1 });
    expect(r.issues).toContain('low_contrast');
  });

  it('flags cut-off documents and produces a suggestion', () => {
    const r = computeQualityScore({ ...perfect, cutOff: true });
    expect(r.issues).toContain('document_cut_off');
    expect(r.suggestions.length).toBeGreaterThan(0);
  });

  it('clamps to a minimum of 0', () => {
    const r = computeQualityScore({
      sharpness: 0,
      brightness: 0,
      contrast: 0,
      resolutionPx: 100,
      cutOff: true,
      tiltDegrees: 45,
      strongShadow: true,
    });
    expect(r.score).toBe(0);
    expect(r.label).toBe('poor');
  });

  it('clamps to a maximum of 100', () => {
    expect(computeQualityScore(perfect).score).toBeLessThanOrEqual(100);
  });
});

describe('labelForScore', () => {
  it('maps score ranges to labels (PRD §43.3)', () => {
    expect(labelForScore(95)).toBe('excellent');
    expect(labelForScore(80)).toBe('good');
    expect(labelForScore(60)).toBe('needs_review');
    expect(labelForScore(30)).toBe('poor');
  });
});

describe('safeFallbackQuality', () => {
  it('returns a safe passing fallback', () => {
    const r = safeFallbackQuality();
    expect(r.score).toBe(75);
    expect(r.label).toBe('good');
  });
});

describe('shouldWarnRetake (PRD §44.2)', () => {
  it('warns when score below 55', () => {
    expect(shouldWarnRetake({ score: 40, label: 'poor', issues: [], suggestions: [] })).toBe(true);
  });
  it('warns on blur even with an okay score', () => {
    expect(
      shouldWarnRetake({ score: 70, label: 'needs_review', issues: ['blur'], suggestions: [] })
    ).toBe(true);
  });
  it('does not warn on a good scan', () => {
    expect(shouldWarnRetake({ score: 92, label: 'excellent', issues: [], suggestions: [] })).toBe(false);
  });
});
