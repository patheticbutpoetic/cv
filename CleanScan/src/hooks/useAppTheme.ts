import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';

/**
 * Resolves the effective color scheme from user setting + OS. V1 ships a light
 * palette; dark tokens can be layered later. Returns the shared color tokens so
 * screens have a single source of truth.
 */
export function useAppTheme() {
  const themeSetting = useSettingsStore((s) => s.settings.theme);
  const system = useColorScheme();
  const effective = themeSetting === 'system' ? system ?? 'light' : themeSetting;
  return { scheme: effective, colors };
}
