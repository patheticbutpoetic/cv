/**
 * Typed, user-safe errors (PRD §20, §51.4).
 * The `userMessage` is always calm and friendly; never leak raw paths/stack.
 */
export type ErrorCategory =
  | 'permission'
  | 'file'
  | 'storage'
  | 'processing'
  | 'share'
  | 'database'
  | 'pdf'
  | 'cancelled'
  | 'unknown';

export class AppError extends Error {
  category: ErrorCategory;
  userMessage: string;

  constructor(category: ErrorCategory, userMessage: string, cause?: unknown) {
    super(userMessage);
    this.name = 'AppError';
    this.category = category;
    this.userMessage = userMessage;
    if (cause instanceof Error) this.stack = cause.stack;
  }
}

/** User-facing copy per category (PRD §51.4 "Good" examples). */
const USER_MESSAGES: Record<ErrorCategory, string> = {
  permission: 'CleanScan needs permission to continue. You can enable it in Settings.',
  file: 'We could not find this file. It may have been moved or deleted.',
  storage: 'Your device is low on storage. Free some space and try again.',
  processing: 'We could not process this image. Please try again.',
  share: 'Sharing is not available right now. Please try again.',
  database: 'We had trouble reading your library. Please restart the app.',
  pdf: 'We could not create your PDF. Please try again.',
  cancelled: '',
  unknown: 'Something went wrong. Please try again.',
};

export function toAppError(category: ErrorCategory, cause?: unknown): AppError {
  return new AppError(category, USER_MESSAGES[category], cause);
}

/** True when the error is just a user cancellation (do not show a scary error). */
export function isCancellation(error: unknown): boolean {
  return error instanceof AppError && error.category === 'cancelled';
}

export const CancelledError = new AppError('cancelled', '');
