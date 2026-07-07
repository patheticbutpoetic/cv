import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * shareService — share/print PDFs using native UI (PRD §17.7).
 * Rules: check availability before sharing; friendly error if unavailable.
 */
export async function isSharingAvailable(): Promise<boolean> {
  try {
    return await Sharing.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function sharePdf(uri: string): Promise<void> {
  const available = await isSharingAvailable();
  if (!available) {
    throw new AppError('share', 'Sharing is not available on this device.');
  }
  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share PDF',
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    // A user cancelling the share sheet must not surface a scary error.
    logger.info('share', 'share dismissed or failed');
  }
}

export async function printPdf(uri: string): Promise<void> {
  try {
    await Print.printAsync({ uri });
  } catch (error) {
    logger.info('share', 'print dismissed or failed');
  }
}

/** Opens the PDF externally (falls back to share sheet). */
export async function openPdf(uri: string): Promise<void> {
  await sharePdf(uri);
}
