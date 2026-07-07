import * as FileSystem from 'expo-file-system';
import type { AppSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { logger } from '@/utils/logger';

/** Persists AppSettings as a small JSON file (no private content). */
const SETTINGS_URI = `${FileSystem.documentDirectory}cleanscan-settings.json`;

export async function loadSettings(): Promise<AppSettings> {
  try {
    const info = await FileSystem.getInfoAsync(SETTINGS_URI);
    if (!info.exists) return DEFAULT_SETTINGS;
    const raw = await FileSystem.readAsStringAsync(SETTINGS_URI);
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch (error) {
    logger.warn('settings', 'failed to load, using defaults');
    return DEFAULT_SETTINGS;
  }
}

export async function persistSettings(settings: AppSettings): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(SETTINGS_URI, JSON.stringify(settings));
  } catch (error) {
    logger.warn('settings', 'failed to persist settings');
  }
}
