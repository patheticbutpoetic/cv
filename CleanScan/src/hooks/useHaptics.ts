import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Gentle haptics (PRD §53.2) gated by the user setting. Do not overuse.
 */
export function useHaptics() {
  const enabled = useSettingsStore((s) => s.settings.hapticsEnabled);

  return {
    light: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    success: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    warning: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    error: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  };
}
