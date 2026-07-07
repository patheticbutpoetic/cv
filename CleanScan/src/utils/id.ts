import { v4 as uuidv4 } from 'uuid';

/** Stable unique id generator (wrapped so it can be mocked in tests). */
export function createId(): string {
  return uuidv4();
}

/** ISO timestamp helper. */
export function nowIso(): string {
  return new Date().toISOString();
}
