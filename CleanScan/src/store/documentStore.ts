import { create } from 'zustand';
import type { Document } from '@/types/document';
import * as library from '@/services/documentLibraryService';
import { logger } from '@/utils/logger';

/** documentStore (PRD §16.2) — saved documents + search. */
interface DocumentStore {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

  loadDocuments: () => Promise<void>;
  addDocument: (doc: Document) => Promise<void>;
  renameDocument: (id: string, name: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  searchQuery: '',

  loadDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const documents = await library.loadDocuments();
      set({ documents, isLoading: false });
    } catch (error) {
      logger.error('documentStore', 'loadDocuments failed', error);
      set({ isLoading: false, error: 'Could not load recent documents.' });
    }
  },

  addDocument: async (doc) => {
    await library.saveDocument(doc);
    set((state) => ({ documents: [doc, ...state.documents] }));
  },

  renameDocument: async (id, name) => {
    await library.renameDocument(id, name);
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, name } : d)),
    }));
  },

  deleteDocument: async (id) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) return;
    await library.deleteDocument(doc);
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
  },

  toggleFavorite: async (id) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) return;
    await library.toggleFavorite(id, doc.isFavorite);
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
      ),
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
