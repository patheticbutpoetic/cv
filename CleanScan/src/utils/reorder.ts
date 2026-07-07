/**
 * Immutable array move used for batch page reordering (PRD §7.2, §16.1).
 * Returns a new array with the item at `fromIndex` moved to `toIndex`.
 * Out-of-range indices return the array unchanged (defensive).
 */
export function moveItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return list.slice();
  }
  const next = list.slice();
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Reorders pages and rewrites their orderIndex to match final position.
 */
export function reorderPages<T extends { orderIndex: number }>(
  pages: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  return moveItem(pages, fromIndex, toIndex).map((page, index) => ({
    ...page,
    orderIndex: index,
  }));
}
