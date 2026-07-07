import * as FileSystem from 'expo-file-system';
import { createId } from '@/utils/id';
import { AppError, toAppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * localStorageService — owns the app's on-device file layout (PRD §17.6, §50.2).
 *
 * CleanScan/
 *   documents/pdfs/
 *   documents/thumbnails/
 *   temp/imports/
 *   temp/pdf-generation/
 *   temp/image-processing/
 *
 * Rules (PRD §17.6): never leave generated PDFs only in cache; clean temp files
 * after successful export; do not delete originals until the document is saved.
 */
const ROOT = `${FileSystem.documentDirectory}CleanScan/`;

export const DIRS = {
  root: ROOT,
  pdfs: `${ROOT}documents/pdfs/`,
  thumbnails: `${ROOT}documents/thumbnails/`,
  pages: `${ROOT}documents/pages/`,
  tempImports: `${ROOT}temp/imports/`,
  tempPdf: `${ROOT}temp/pdf-generation/`,
  tempImage: `${ROOT}temp/image-processing/`,
} as const;

async function ensureDir(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
  }
}

/** Creates all app directories (PRD §17.6 ensureAppDirectories). */
export async function ensureAppDirectories(): Promise<void> {
  try {
    for (const dir of Object.values(DIRS)) {
      await ensureDir(dir);
    }
  } catch (error) {
    logger.error('localStorage', 'ensureAppDirectories failed', error);
    throw toAppError('storage', error);
  }
}

/** Copies a temp PDF into the permanent library folder and returns its uri. */
export async function savePdfToLibrary(tempUri: string, fileName: string): Promise<string> {
  try {
    await ensureDir(DIRS.pdfs);
    const dest = `${DIRS.pdfs}${createId()}.pdf`;
    await FileSystem.copyAsync({ from: tempUri, to: dest });
    logger.info('localStorage', 'Saved PDF to library', { fileName });
    return dest;
  } catch (error) {
    throw toAppError('storage', error);
  }
}

/** Persists a page image out of cache into app storage. */
export async function savePageImage(uri: string): Promise<string> {
  try {
    await ensureDir(DIRS.pages);
    const dest = `${DIRS.pages}${createId()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch (error) {
    throw toAppError('storage', error);
  }
}

/** Persists a thumbnail image. */
export async function saveThumbnail(uri: string): Promise<string> {
  try {
    await ensureDir(DIRS.thumbnails);
    const dest = `${DIRS.thumbnails}${createId()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch (error) {
    throw toAppError('storage', error);
  }
}

/** Deletes a file only if it exists — never throws for a missing file. */
export async function deleteFileIfExists(uri?: string): Promise<void> {
  if (!uri) return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    logger.warn('localStorage', 'deleteFileIfExists failed');
  }
}

/** Returns the file size in bytes (0 when missing). */
export async function getFileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    return info.exists && 'size' in info ? (info.size ?? 0) : 0;
  } catch {
    return 0;
  }
}

/** Free space on device, used for low-storage checks (PRD §20.3). */
export async function getFreeDiskBytes(): Promise<number> {
  try {
    return await FileSystem.getFreeDiskStorageAsync();
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

export async function assertEnoughStorage(requiredBytes: number): Promise<void> {
  const free = await getFreeDiskBytes();
  if (free < requiredBytes) {
    throw new AppError('storage', 'Your device is low on storage. Free some space and try again.');
  }
}
