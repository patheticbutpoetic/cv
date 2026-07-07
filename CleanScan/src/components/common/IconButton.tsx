import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { layout } from '@/constants/layout';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  label?: string;
  accessibilityLabel: string;
  color?: string;
  size?: number;
  disabled?: boolean;
  variant?: 'plain' | 'surface';
}

/** Icon-only (or icon+label) tappable button with large hit area (PRD §53.1). */
export function IconButton({
  icon,
  onPress,
  label,
  accessibilityLabel,
  color = colors.text,
  size = 24,
  disabled,
  variant = 'plain',
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={layout.hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        variant === 'surface' && styles.surface,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.inner}>
        <Icon name={icon} size={size} color={color} />
        {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { padding: spacing.sm, borderRadius: radius.md, alignItems: 'center' },
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.6 },
  disabled: { opacity: layout.disabledOpacity },
  inner: { alignItems: 'center', gap: spacing.xs },
  label: { fontSize: typography.caption },
});
