import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { sharePdf, printPdf } from './shareService';
import { logger } from '@/utils/logger';

/**
 * sharePresetService — one-tap post-export actions (PRD §48, §57.4).
 * Shows only actions available on the device; hides the rest.
 */
export type SharePresetId = 'share' | 'email' | 'save_to_files' | 'print' | 'open_library';

export interface SharePreset {
  id: SharePresetId;
  label: string;
  icon: string; // maps to an icon name in the UI
}

const ALL_PRESETS: SharePreset[] = [
  { id: 'share', label: 'Share', icon: 'share' },
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'save_to_files', label: 'Save to Files', icon: 'folder' },
  { id: 'print', label: 'Print', icon: 'print' },
  { id: 'open_library', label: 'Open Library', icon: 'library' },
];

/** Returns the presets available on this device (PRD §48.3). */
export async function getAvailablePresets(): Promise<SharePreset[]> {
  const canShare = await Sharing.isAvailableAsync().catch(() => false);
  return ALL_PRESETS.filter((preset) => {
    switch (preset.id) {
      case 'share':
      case 'email':
      case 'save_to_files':
        return canShare; // routed through the native share sheet
      case 'print':
        return Platform.OS === 'ios' || Platform.OS === 'android';
      case 'open_library':
        return true;
      default:
        return true;
    }
  });
}

/** Runs a preset action against a PDF uri. Returns false when unhandled. */
export async function runPreset(id: SharePresetId, uri: string): Promise<boolean> {
  try {
    switch (id) {
      case 'share':
      case 'email':
      case 'save_to_files':
        await sharePdf(uri);
        return true;
      case 'print':
        await printPdf(uri);
        return true;
      case 'open_library':
        return false; // navigation handled by the caller
      default:
        return false;
    }
  } catch (error) {
    logger.warn('sharePreset', `preset ${id} failed`);
    return false;
  }
}
