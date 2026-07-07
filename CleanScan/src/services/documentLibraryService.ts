import type { Document } from '@/types/document';
import * as repo from '@/db/documentRepository';
import { deleteFileIfExists } from './localStorageService';
import { filterByName } from '@/utils/search';
import { nowIso } from '@/utils/id';

/**
 * documentLibraryService — high-level operations over saved documents
 * (PRD §4.5, §7.4). Delete removes both the DB row and local files.
 */
export async function loadDocuments(): Promise<Document[]> {
  return repo.getAllDocuments();
}

export async function saveDocument(doc: Document): Promise<void> {
  await repo.insertDocument(doc);
}

export async function renameDocument(id: string, name: string): Promise<void> {
  await repo.updateDocumentName(id, name, nowIso());
}

export async function toggleFavorite(id: string, current: boolean): Promise<void> {
  await repo.setFavorite(id, !current);
}

/** Deletes the DB record AND the local PDF + thumbnail (PRD §7.4, §50.3). */
export async function deleteDocument(doc: Document): Promise<void> {
  await repo.deleteDocumentRow(doc.id);
  await deleteFileIfExists(doc.pdfUri);
  await deleteFileIfExists(doc.thumbnailUri);
}

export async function markOpened(id: string): Promise<void> {
  await repo.touchLastOpened(id, nowIso());
}

/** Local, case-insensitive search by name (PRD §7.4). */
export function filterBySearch(documents: Document[], query: string): Document[] {
  return filterByName(documents, query);
}
