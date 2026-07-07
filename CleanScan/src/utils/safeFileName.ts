/**
 * Filename sanitization (PRD §47.3).
 * Removes/replaces invalid characters: / \ : * ? " < > |
 * Rules: trim spaces, max 80 chars, fall back to "Untitled Scan" when empty.
 */
const INVALID_CHARS = /[/\\:*?"<>|]/g;
const MAX_LENGTH = 80;
export const DEFAULT_NAME = 'Untitled Scan';

export function safeFileName(input: string | undefined | null): string {
  if (!input) return DEFAULT_NAME;

  const cleaned = input
    .replace(INVALID_CHARS, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LENGTH)
    .trim();

  return cleaned.length > 0 ? cleaned : DEFAULT_NAME;
}

/**
 * Resolves a duplicate name by appending " - 2", " - 3", etc. (PRD §47.3).
 * `existing` is the set of names already taken (case-insensitive compare).
 */
export function resolveDuplicateName(name: string, existing: string[]): string {
  const taken = new Set(existing.map((n) => n.toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;

  let counter = 2;
  let candidate = `${name} - ${counter}`;
  while (taken.has(candidate.toLowerCase())) {
    counter += 1;
    candidate = `${name} - ${counter}`;
  }
  return candidate;
}

/**
 * Validates a user-entered document name (PRD §8.8 validation rules).
 * Returns an error string, or null when valid.
 */
export function validateDocumentName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Name cannot be empty.';
  if (INVALID_CHARS.test(trimmed)) {
    return 'Name cannot contain / \\ : * ? " < > | characters.';
  }
  if (trimmed.length > MAX_LENGTH) {
    return `Name cannot be longer than ${MAX_LENGTH} characters.`;
  }
  return null;
}
