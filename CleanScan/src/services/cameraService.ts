import type { CameraView } from 'expo-camera';
import type { DocumentPage } from '@/types/page';
import type { ScanFilter } from '@/types/scanner';
import { createPage } from './pageFactory';
import { createThumbnail } from './cropService';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export { requestCameraPermission } from './permissionsService';

/**
 * cameraService — capture document photos and normalize into a DocumentPage
 * (PRD §17.1). Rules: never assume permission; if capture returns no URI, throw
 * a user-safe error.
 */
export async function captureDocumentPhoto(
  cameraRef: CameraView | null,
  orderIndex: number,
  filter: ScanFilter = 'CLEAN'
): Promise<DocumentPage> {
  if (!cameraRef) {
    throw new AppError('processing', 'The camera is not ready yet. Please try again.');
  }
  try {
    const photo = await cameraRef.takePictureAsync({ quality: 0.9, skipProcessing: false });
    if (!photo?.uri) {
      throw new AppError('processing', 'Camera capture failed. Please try again.');
    }
    const thumbnailUri = await createThumbnail(photo.uri).catch(() => undefined);
    return createPage({
      originalUri: photo.uri,
      width: photo.width,
      height: photo.height,
      orderIndex,
      filter,
      thumbnailUri,
    });
  } catch (error) {
    logger.error('camera', 'captureDocumentPhoto failed', error);
    if (error instanceof AppError) throw error;
    throw new AppError('processing', 'Camera capture failed. Please try again.', error);
  }
}

/** Builds a page from an already-captured URI (used by retake/replace flows). */
export async function createPageFromCameraUri(
  uri: string,
  orderIndex: number,
  filter: ScanFilter = 'CLEAN'
): Promise<DocumentPage> {
  const thumbnailUri = await createThumbnail(uri).catch(() => undefined);
  return createPage({ originalUri: uri, orderIndex, filter, thumbnailUri });
}
