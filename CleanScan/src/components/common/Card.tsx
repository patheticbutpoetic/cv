import React from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { layout, shadows } from '@/constants/layout';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  padded?: boolean;
  elevated?: boolean;
}

/** Rounded white card with soft shadow (PRD §9.6). */
export function Card({ children, onPress, style, accessibilityLabel, padded = true, elevated = true }: CardProps) {
  const content = (
    <View
      style={[styles.card, padded && styles.padded, elevated && shadows.card, style]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: { padding: layout.cardPadding },
  pressed: { opacity: 0.85 },
});
