import { format, isToday, isYesterday } from 'date-fns';

/** "July 7, 2026" — used in smart naming (PRD §47.1). */
export function formatLongDate(date: Date | string | number): string {
  return format(new Date(date), 'MMMM d, yyyy');
}

/** Relative label for library/home cards: "Today", "Yesterday", or a short date. */
export function formatRelativeDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

/** Compact date for metadata rows. */
export function formatShortDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, yyyy');
}
