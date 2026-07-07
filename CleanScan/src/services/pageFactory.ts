import type { DocumentPage } from '@/types/page';
import type { ScanFilter } from '@/types/scanner';
import { createId, nowIso } from '@/utils/id';

/** Builds a fresh DocumentPage with neutral edit defaults. */
export function createPage(params: {
  originalUri: string;
  workingUri?: string;
  width?: number;
  height?: number;
  orderIndex: number;
  filter?: ScanFilter;
  thumbnailUri?: string;
}): DocumentPage {
  const timestamp = nowIso();
  return {
    id: createId(),
    originalUri: params.originalUri,
    workingUri: params.workingUri ?? params.originalUri,
    thumbnailUri: params.thumbnailUri,
    width: params.width,
    height: params.height,
    orderIndex: params.orderIndex,
    rotation: 0,
    filter: params.filter ?? 'CLEAN',
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
