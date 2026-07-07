import * as ImagePicker from 'expo-image-picker';
import type { DocumentPage } from '@/types/page';
import type { ScanFilter } from '@/types/scanner';
import { createPage } from './pageFactory';
import { createThumbnail } from './cropService';
import { toAppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * imageImportService — pick one/many gallery images and convert to pages
 * (PRD §17.2). Rules: if user cancels, return null / empty array (NOT an error);
 * resize large images before thumbnailing.
 */
async function assetToPage(
  asset: ImagePicker.ImagePickerAsset,
  orderIndex: number,
  filter: ScanFilter
): Promise<DocumentPage> {
  const thumbnailUri = await createThumbnail(asset.uri).catch(() => undefined);
  return createPage({
    originalUri: asset.uri,
    width: asset.width,
    height: asset.height,
    orderIndex,
    filter,
    thumbnailUri,
  });
}

export async function pickSingleImage(
  orderIndex = 0,
  filter: ScanFilter = 'CLEAN'
): Promise<DocumentPage | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (result.canceled || result.assets.length === 0) return null;
    return assetToPage(result.assets[0], orderIndex, filter);
  } catch (error) {
    logger.error('import', 'pickSingleImage failed', error);
    throw toAppError('processing', error);
  }
}

export async function pickMultipleImages(
  startIndex = 0,
  filter: ScanFilter = 'CLEAN'
): Promise<DocumentPage[]> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 1,
      orderedSelection: true,
    });
    if (result.canceled || result.assets.length === 0) return [];
    const pages: DocumentPage[] = [];
    for (let i = 0; i < result.assets.length; i += 1) {
      // Process sequentially to avoid holding many full-res images in memory.
      pages.push(await assetToPage(result.assets[i], startIndex + i, filter));
    }
    return pages;
  } catch (error) {
    logger.error('import', 'pickMultipleImages failed', error);
    throw toAppError('processing', error);
  }
}

export { requestGalleryPermission } from './permissionsService';
