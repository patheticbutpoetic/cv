/**
 * Lightweight logger. NEVER logs file contents, OCR text, image data, or
 * private file names (PRD §22.3, §49.5).
 */
declare const __DEV__: boolean | undefined;

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export const logger = {
  info(scope: string, message: string, meta?: Record<string, unknown>) {
    if (isDev) console.log(`[${scope}] ${message}`, meta ?? '');
  },
  warn(scope: string, message: string, meta?: Record<string, unknown>) {
    if (isDev) console.warn(`[${scope}] ${message}`, meta ?? '');
  },
  error(scope: string, message: string, error?: unknown) {
    // Only the category/message — no private content.
    if (isDev) console.error(`[${scope}] ${message}`, error instanceof Error ? error.message : '');
  },
};
