import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import type { DocumentPage } from '@/types/page';
import type { PdfExportSettings } from '@/types/document';
import { buildPdfHtml, buildIdCardHtml, type PdfHtmlPage } from './pdf/htmlBuilder';
import { prepareImageForPdf } from './imageEnhancementService';
import { getPaperDimensions } from '@/constants/paperSizes';
import { savePdfToLibrary, deleteFileIfExists, getFileSize, DIRS } from './localStorageService';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * pdfGenerationService — turn pages into a PDF (PRD §17.5).
 * MVP method: prepare each image (resize/compress) → base64 data URI →
 * build HTML → Print.printToFileAsync → move out of cache into app storage.
 * Shows progress and processes pages one by one (PRD §21).
 */
export interface CreatePdfResult {
  uri: string;
  pageCount: number;
  fileSizeBytes: number;
}

export type ProgressCallback = (fraction: number) => void;

async function toDataUri(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/jpeg;base64,${base64}`;
}

async function printHtmlToLibrary(
  html: string,
  settings: PdfExportSettings
): Promise<CreatePdfResult> {
  const { width, height } = getPaperDimensions(settings.paperSize);
  let printed: { uri: string };
  try {
    printed = await Print.printToFileAsync({ html, width, height, base64: false });
  } catch (error) {
    throw new AppError('pdf', 'We could not create your PDF. Please try again.', error);
  }

  // Never leave the PDF only in cache (PRD §17.6).
  const savedUri = await savePdfToLibrary(printed.uri, settings.name);
  await deleteFileIfExists(printed.uri);
  const fileSizeBytes = await getFileSize(savedUri);
  return { uri: savedUri, pageCount: 1, fileSizeBytes };
}

/**
 * Creates a PDF from ordered pages. Throws AppError('pdf') on failure and
 * AppError with no pages guard (PRD §20.4, §8.8).
 */
export async function createPdfFromPages(
  pages: DocumentPage[],
  settings: PdfExportSettings,
  onProgress?: ProgressCallback
): Promise<CreatePdfResult> {
  if (pages.length === 0) {
    throw new AppError('pdf', 'Add at least one page before creating a PDF.');
  }

  const ordered = [...pages].sort((a, b) => a.orderIndex - b.orderIndex);
  const htmlPages: PdfHtmlPage[] = [];

  try {
    for (let i = 0; i < ordered.length; i += 1) {
      const prepared = await prepareImageForPdf(ordered[i], settings.quality);
      htmlPages.push({ dataUri: await toDataUri(prepared) });
      // Clean up the temporary prepared image after embedding it.
      if (prepared.startsWith(DIRS.tempImage) || prepared.includes('ImageManipulator')) {
        await deleteFileIfExists(prepared);
      }
      onProgress?.((i + 1) / (ordered.length + 1));
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('processing', 'We could not process an image. Please try again.', error);
  }

  const html = buildPdfHtml(htmlPages, settings.fitMode);
  const result = await printHtmlToLibrary(html, settings);
  onProgress?.(1);
  return { ...result, pageCount: ordered.length };
}

/** Creates a one-page ID Card PDF from front/back pages (PRD §46, §57.3). */
export async function createIdCardPdf(
  front: DocumentPage | undefined,
  back: DocumentPage | undefined,
  settings: PdfExportSettings,
  includeLabels: boolean,
  onProgress?: ProgressCallback
): Promise<CreatePdfResult> {
  if (!front && !back) {
    throw new AppError('pdf', 'Scan at least the front of the card first.');
  }
  try {
    const frontData = front ? await toDataUri(await prepareImageForPdf(front, settings.quality)) : undefined;
    onProgress?.(0.4);
    const backData = back ? await toDataUri(await prepareImageForPdf(back, settings.quality)) : undefined;
    onProgress?.(0.7);
    const html = buildIdCardHtml(frontData, backData, includeLabels);
    const result = await printHtmlToLibrary(html, settings);
    onProgress?.(1);
    return result;
  } catch (error) {
    logger.error('pdf', 'createIdCardPdf failed', error);
    if (error instanceof AppError) throw error;
    throw new AppError('pdf', 'We could not create your PDF. Please try again.', error);
  }
}
