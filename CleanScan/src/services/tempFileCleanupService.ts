import * as FileSystem from 'expo-file-system';
import { DIRS, deleteFileIfExists, getFileSize } from './localStorageService';
import { estimatePdfSize, isLargePdf } from '@/utils/fileSize';
import { logger } from '@/utils/logger';

/**
 * tempFileCleanupService / storageCleanupService (PRD §50, §57.5).
 * Deletes stale temp files, estimates project size, reconciles DB and FS.
 * Never deletes saved PDFs unless the user confirms delete.
 */
const TEMP_DIRS = [DIRS.tempImports, DIRS.tempPdf, DIRS.tempImage];
const MAX_TEMP_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours (PRD §50.3)

/** Deletes all files in the temp directories (after a successful export). */
export async function cleanTempFiles(): Promise<void> {
  for (const dir of TEMP_DIRS) {
    try {
      const info = await FileSystem.getInfoAsync(dir);
      if (!info.exists) continue;
      const entries = await FileSystem.readDirectoryAsync(dir);
      await Promise.all(entries.map((name) => deleteFileIfExists(`${dir}${name}`)));
    } catch (error) {
      logger.warn('cleanup', `failed cleaning ${dir}`);
    }
  }
}

/** On startup: delete temp files older than 24h (PRD §50.3). */
export async function cleanStaleTempFiles(now = Date.now()): Promise<void> {
  for (const dir of TEMP_DIRS) {
    try {
      const info = await FileSystem.getInfoAsync(dir);
      if (!info.exists) continue;
      const entries = await FileSystem.readDirectoryAsync(dir);
      for (const name of entries) {
        const fileUri = `${dir}${name}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        const modTime = fileInfo.exists && 'modificationTime' in fileInfo
          ? (fileInfo.modificationTime ?? 0) * 1000
          : 0;
        if (now - modTime > MAX_TEMP_AGE_MS) {
          await deleteFileIfExists(fileUri);
        }
      }
    } catch (error) {
      logger.warn('cleanup', `stale cleanup failed for ${dir}`);
    }
  }
}

/** Estimates a project's on-disk size from its page URIs. */
export async function estimateProjectSize(uris: string[]): Promise<number> {
  const sizes = await Promise.all(uris.map((uri) => getFileSize(uri)));
  return estimatePdfSize(sizes);
}

/** Whether to show the "large PDF" warning (PRD §50.4). */
export async function shouldWarnLargeProject(uris: string[]): Promise<boolean> {
  const estimated = await estimateProjectSize(uris);
  return isLargePdf(estimated, uris.length);
}
