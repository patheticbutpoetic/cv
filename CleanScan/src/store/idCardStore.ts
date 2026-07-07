import { create } from 'zustand';
import type { DocumentPage } from '@/types/page';

/** Holds the in-progress ID Card scan (front/back) — PRD §46. */
interface IdCardStore {
  frontPage?: DocumentPage;
  backPage?: DocumentPage;
  includeLabels: boolean;
  setFront: (page: DocumentPage) => void;
  setBack: (page: DocumentPage) => void;
  setIncludeLabels: (value: boolean) => void;
  clear: () => void;
}

export const useIdCardStore = create<IdCardStore>((set) => ({
  frontPage: undefined,
  backPage: undefined,
  includeLabels: true,
  setFront: (page) => set({ frontPage: page }),
  setBack: (page) => set({ backPage: page }),
  setIncludeLabels: (value) => set({ includeLabels: value }),
  clear: () => set({ frontPage: undefined, backPage: undefined, includeLabels: true }),
}));
