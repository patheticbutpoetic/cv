import { logger } from '@/utils/logger';

/**
 * analyticsService (PRD §52, §57.6) — privacy-safe event wrapper.
 * MVP is a no-op that only logs in dev. NEVER track document title, file name,
 * image content, OCR text, contact names, ID details, or private paths.
 */
export type AnalyticsEvent =
  | 'app_opened'
  | 'scan_started'
  | 'scan_mode_selected'
  | 'camera_permission_granted'
  | 'camera_permission_denied'
  | 'gallery_import_started'
  | 'gallery_import_completed'
  | 'page_captured'
  | 'page_deleted'
  | 'page_reordered'
  | 'filter_selected'
  | 'pdf_generation_started'
  | 'pdf_generation_completed'
  | 'pdf_generation_failed'
  | 'pdf_shared'
  | 'document_saved'
  | 'document_deleted'
  | 'library_search_used'
  | 'id_card_mode_started'
  | 'id_card_pdf_created'
  | 'scan_quality_warning_shown'
  | 'scan_quality_retake_clicked';

/** Only these property keys are allowed (PRD §52.2). */
type AllowedProps = Partial<{
  page_count: number;
  scan_mode: string;
  platform: string;
  app_version: string;
  quality_setting: string;
  compression_setting: string;
  paper_size: string;
  success: boolean;
  duration_ms: number;
}>;

const BLOCKED_KEYS = ['document title', 'file_name', 'name', 'ocr', 'image', 'path', 'uri'];

function stripPrivate(props?: AllowedProps): AllowedProps | undefined {
  if (!props) return undefined;
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (BLOCKED_KEYS.some((blocked) => key.toLowerCase().includes(blocked))) continue;
    safe[key] = value;
  }
  return safe as AllowedProps;
}

export const analyticsService = {
  track(event: AnalyticsEvent, properties?: AllowedProps) {
    const safeProps = stripPrivate(properties);
    logger.info('analytics', event, safeProps);
    // Later: forward `event` + `safeProps` to a privacy-safe provider.
  },
};
