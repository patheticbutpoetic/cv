/**
 * CleanScan color tokens (PRD §9.2).
 * White / off-white background, strong blue primary, dark navy text.
 */
export const colors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3F6',
  primary: '#165DFF',
  primaryDark: '#0B3FCC',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  // Convenience aliases
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(17, 24, 39, 0.55)',
} as const;

export type ColorToken = keyof typeof colors;
