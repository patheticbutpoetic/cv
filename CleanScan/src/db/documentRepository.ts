import type { Document } from '@/types/document';
import type { PaperSize, PdfQuality, CompressionLevel, ScanMode } from '@/types/scanner';
import { getDatabase } from './database';
import { toAppError } from '@/utils/errors';

/** Raw DB row shape for the documents table. */
interface DocumentRow {
  id: string;
  name: string;
  pdf_uri: string;
  thumbnail_uri: string | null;
  page_count: number;
  file_size_bytes: number;
  paper_size: string;
  quality: string;
  compression: string;
  mode: string | null;
  is_favorite: number;
  folder_id: string | null;
  ocr_text: string | null;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
}

export function rowToDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    name: row.name,
    pdfUri: row.pdf_uri,
    thumbnailUri: row.thumbnail_uri ?? undefined,
    pageCount: row.page_count,
    fileSizeBytes: row.file_size_bytes,
    paperSize: row.paper_size as PaperSize,
    quality: row.quality as PdfQuality,
    compression: row.compression as CompressionLevel,
    mode: (row.mode as ScanMode) ?? undefined,
    isFavorite: row.is_favorite === 1,
    folderId: row.folder_id ?? undefined,
    ocrText: row.ocr_text ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastOpenedAt: row.last_opened_at ?? undefined,
  };
}

export async function insertDocument(doc: Document): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO documents
        (id, name, pdf_uri, thumbnail_uri, page_count, file_size_bytes, paper_size,
         quality, compression, mode, is_favorite, folder_id, ocr_text, created_at, updated_at, last_opened_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        doc.id, doc.name, doc.pdfUri, doc.thumbnailUri ?? null, doc.pageCount,
        doc.fileSizeBytes, doc.paperSize, doc.quality, doc.compression, doc.mode ?? null,
        doc.isFavorite ? 1 : 0, doc.folderId ?? null, doc.ocrText ?? null,
        doc.createdAt, doc.updatedAt, doc.lastOpenedAt ?? null,
      ]
    );
  } catch (error) {
    throw toAppError('database', error);
  }
}

export async function getAllDocuments(): Promise<Document[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<DocumentRow>(
      'SELECT * FROM documents ORDER BY datetime(created_at) DESC'
    );
    return rows.map(rowToDocument);
  } catch (error) {
    throw toAppError('database', error);
  }
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DocumentRow>('SELECT * FROM documents WHERE id = ?', [id]);
  return row ? rowToDocument(row) : null;
}

export async function updateDocumentName(id: string, name: string, updatedAt: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE documents SET name = ?, updated_at = ? WHERE id = ?', [name, updatedAt, id]);
}

export async function setFavorite(id: string, isFavorite: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE documents SET is_favorite = ? WHERE id = ?', [isFavorite ? 1 : 0, id]);
}

export async function deleteDocumentRow(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM documents WHERE id = ?', [id]);
}

export async function touchLastOpened(id: string, at: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE documents SET last_opened_at = ? WHERE id = ?', [at, id]);
}

/** Returns all document PDF/thumbnail uris — used by cleanup reconciliation. */
export async function getAllDocumentUris(): Promise<{ pdfUri: string; thumbnailUri: string | null }[]> {
  const db = await getDatabase();
  return db.getAllAsync<{ pdfUri: string; thumbnailUri: string | null }>(
    'SELECT pdf_uri as pdfUri, thumbnail_uri as thumbnailUri FROM documents'
  );
}
