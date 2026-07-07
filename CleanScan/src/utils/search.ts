/** Pure, case-insensitive local search by name (PRD §7.4, §16.2). */
export function filterByName<T extends { name: string }>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.name.toLowerCase().includes(q));
}
