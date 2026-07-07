import { filterByName } from './search';

const docs = [
  { name: 'Math Notes' },
  { name: 'Contract Agreement' },
  { name: 'Receipt Supermarket' },
];

describe('filterByName (PRD §7.4)', () => {
  it('returns all items for an empty query', () => {
    expect(filterByName(docs, '')).toHaveLength(3);
    expect(filterByName(docs, '   ')).toHaveLength(3);
  });

  it('filters case-insensitively by substring', () => {
    expect(filterByName(docs, 'math')).toEqual([{ name: 'Math Notes' }]);
    expect(filterByName(docs, 'RECEIPT')).toEqual([{ name: 'Receipt Supermarket' }]);
  });

  it('returns empty when nothing matches', () => {
    expect(filterByName(docs, 'zzz')).toHaveLength(0);
  });
});
