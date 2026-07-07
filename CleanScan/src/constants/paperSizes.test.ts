import { PAPER_SIZES, getPaperDimensions } from './paperSizes';

describe('paper sizes (PRD §19)', () => {
  it('has correct 72 DPI point dimensions', () => {
    expect(PAPER_SIZES.A4).toEqual({ width: 595, height: 842 });
    expect(PAPER_SIZES.LETTER).toEqual({ width: 612, height: 792 });
    expect(PAPER_SIZES.LEGAL).toEqual({ width: 612, height: 1008 });
  });

  it('scales dimensions while keeping ratio', () => {
    const scaled = getPaperDimensions('A4', 2);
    expect(scaled).toEqual({ width: 1190, height: 1684 });
    expect(scaled.width / scaled.height).toBeCloseTo(595 / 842);
  });
});
