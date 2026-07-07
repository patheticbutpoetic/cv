import { Platform } from 'react-native';
import type { ErrorCategory } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * crashReportingService / errorReportingService (PRD §51, §57.7).
 * Placeholder wrapper — later connect Sentry or Firebase Crashlytics.
 * NEVER send image/PDF/OCR content or private file names to crash reports.
 */
interface CrashContext {
  screen?: string;
  category?: ErrorCategory;
  featureArea?: 'camera' | 'import' | 'pdf_generation' | 'sharing' | 'storage' | 'database';
}

const APP_VERSION = '1.0.0';

export const crashReportingService = {
  captureError(error: unknown, context?: CrashContext) {
    const safe = {
      platform: Platform.OS,
      app_version: APP_VERSION,
      screen: context?.screen,
      category: context?.category,
      feature_area: context?.featureArea,
      message: error instanceof Error ? error.message : 'unknown error',
    };
    logger.error('crash', 'captured error', error);
    // Later: Sentry.captureException(error, { extra: safe });
    return safe;
  },
};
