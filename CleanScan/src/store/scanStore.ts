import { create } from 'zustand';
import type { DocumentPage } from '@/types/page';
import type { ScanMode } from '@/types/scanner';
import { reorderPages } from '@/utils/reorder';
import { nowIso } from '@/utils/id';

/**
 * scanStore (PRD §16.1) — the current in-progress scan project.
 * Holds only URIs + metadata (never large base64 blobs — PRD §21.2).
 */
interface ScanStore {
  mode: ScanMode;
  currentPages: DocumentPage[];
  activePageId?: string;
  isBatchMode: boolean;

  setMode: (mode: ScanMode) => void;
  setBatchMode: (value: boolean) => void;
  setActivePage: (id?: string) => void;
  addPage: (page: DocumentPage) => void;
  addPages: (pages: DocumentPage[]) => void;
  updatePage: (id: string, patch: Partial<DocumentPage>) => void;
  removePage: (id: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  clearScan: () => void;
}

export const useScanStore = create<ScanStore>((set) => ({
  mode: 'document',
  currentPages: [],
  activePageId: undefined,
  isBatchMode: false,

  setMode: (mode) => set({ mode }),
  setBatchMode: (value) => set({ isBatchMode: value }),
  setActivePage: (id) => set({ activePageId: id }),

  addPage: (page) =>
    set((state) => {
      const orderIndex = state.currentPages.length;
      return {
        currentPages: [...state.currentPages, { ...page, orderIndex }],
        activePageId: page.id,
      };
    }),

  addPages: (pages) =>
    set((state) => {
      const base = state.currentPages.length;
      const indexed = pages.map((p, i) => ({ ...p, orderIndex: base + i }));
      return { currentPages: [...state.currentPages, ...indexed] };
    }),

  updatePage: (id, patch) =>
    set((state) => ({
      currentPages: state.currentPages.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p
      ),
    })),

  removePage: (id) =>
    set((state) => {
      const filtered = state.currentPages
        .filter((p) => p.id !== id)
        .map((p, index) => ({ ...p, orderIndex: index }));
      return {
        currentPages: filtered,
        activePageId: state.activePageId === id ? filtered[0]?.id : state.activePageId,
      };
    }),

  reorderPages: (fromIndex, toIndex) =>
    set((state) => ({ currentPages: reorderPages(state.currentPages, fromIndex, toIndex) })),

  clearScan: () => set({ currentPages: [], activePageId: undefined, isBatchMode: false, mode: 'document' }),
}));
