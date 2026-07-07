import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { layout } from '@/constants/layout';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: IconName;
  tone?: 'default' | 'danger';
  accessibilityLabel?: string;
}

/** Outlined secondary button — same size language, transparent fill. */
export function SecondaryButton({
  title,
  onPress,
  disabled,
  icon,
  tone = 'default',
  accessibilityLabel,
}: SecondaryButtonProps) {
  const tint = tone === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.border },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={20} color={tint} /> : null}
        <Text style={[styles.text, { color: tint }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: layout.buttonHeight,
    borderRadius: layout.buttonRadius,
    borderWidth: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  disabled: { opacity: layout.disabledOpacity },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { fontSize: typography.button, fontWeight: fontWeight.semibold },
});
