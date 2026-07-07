import { moveItem, reorderPages } from './reorder';

describe('moveItem', () => {
  it('moves forward', () => {
    expect(moveItem([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4]);
  });

  it('moves backward', () => {
    expect(moveItem([1, 2, 3, 4], 3, 1)).toEqual([1, 4, 2, 3]);
  });

  it('returns a copy when indices are equal', () => {
    const input = [1, 2, 3];
    const out = moveItem(input, 1, 1);
    expect(out).toEqual(input);
    expect(out).not.toBe(input);
  });

  it('ignores out-of-range indices', () => {
    expect(moveItem([1, 2], 0, 9)).toEqual([1, 2]);
  });
});

describe('reorderPages', () => {
  it('rewrites orderIndex to final positions', () => {
    const pages = [
      { id: 'a', orderIndex: 0 },
      { id: 'b', orderIndex: 1 },
      { id: 'c', orderIndex: 2 },
    ];
    const out = reorderPages(pages, 2, 0);
    expect(out.map((p) => p.id)).toEqual(['c', 'a', 'b']);
    expect(out.map((p) => p.orderIndex)).toEqual([0, 1, 2]);
  });
});
