import { colors } from './colors';
import { radius } from './spacing';

/**
 * Shared layout primitives: component sizing rules (PRD §9.6) and soft shadows.
 */
export const layout = {
  buttonHeight: 52,
  buttonRadius: radius.md,
  inputHeight: 48,
  inputRadius: radius.sm + 4, // 12
  cardRadius: radius.md + 2, // 16
  cardPadding: 16,
  disabledOpacity: 0.5,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;

/**
 * Soft shadow presets. iOS uses shadow*, Android uses elevation.
 */
export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export { colors };
