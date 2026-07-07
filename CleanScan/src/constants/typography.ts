/**
 * Typography scale (PRD §9.3). Values are font sizes in px.
 */
export const typography = {
  titleLarge: 28,
  title: 22,
  subtitle: 17,
  body: 15,
  caption: 12,
  button: 16,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type TypographyToken = keyof typeof typography;
