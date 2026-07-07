import { useScanStore } from './scanStore';
import type { DocumentPage } from '@/types/page';

function makePage(id: string): DocumentPage {
  const now = new Date().toISOString();
  return {
    id,
    originalUri: `file://${id}.jpg`,
    workingUri: `file://${id}.jpg`,
    orderIndex: 0,
    rotation: 0,
    filter: 'CLEAN',
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    createdAt: now,
    updatedAt: now,
  };
}

describe('scanStore (PRD §16.1)', () => {
  beforeEach(() => useScanStore.getState().clearScan());

  it('adds pages with sequential orderIndex', () => {
    const store = useScanStore.getState();
    store.addPage(makePage('a'));
    store.addPage(makePage('b'));
    const pages = useScanStore.getState().currentPages;
    expect(pages.map((p) => p.id)).toEqual(['a', 'b']);
    expect(pages.map((p) => p.orderIndex)).toEqual([0, 1]);
  });

  it('removes a page and reindexes', () => {
    const store = useScanStore.getState();
    store.addPages([makePage('a'), makePage('b'), makePage('c')]);
    useScanStore.getState().removePage('b');
    const pages = useScanStore.getState().currentPages;
    expect(pages.map((p) => p.id)).toEqual(['a', 'c']);
    expect(pages.map((p) => p.orderIndex)).toEqual([0, 1]);
  });

  it('reorders pages', () => {
    const store = useScanStore.getState();
    store.addPages([makePage('a'), makePage('b'), makePage('c')]);
    useScanStore.getState().reorderPages(0, 2);
    expect(useScanStore.getState().currentPages.map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('updates a page and applies rotation patch', () => {
    const store = useScanStore.getState();
    store.addPage(makePage('a'));
    useScanStore.getState().updatePage('a', { rotation: 90 });
    expect(useScanStore.getState().currentPages[0].rotation).toBe(90);
  });

  it('clears the scan', () => {
    const store = useScanStore.getState();
    store.addPage(makePage('a'));
    useScanStore.getState().clearScan();
    expect(useScanStore.getState().currentPages).toHaveLength(0);
  });
});
