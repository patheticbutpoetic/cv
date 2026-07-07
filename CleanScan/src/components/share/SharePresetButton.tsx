import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { Icon, IconName } from '@/components/common/Icon';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

interface SharePresetButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  primary?: boolean;
}

/** One-tap share preset button (PRD §48). */
export function SharePresetButton({ icon, label, onPress, primary }: SharePresetButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, primary && styles.primary, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, primary && styles.iconWrapPrimary]}>
        <Icon name={icon} size={22} color={primary ? colors.white : colors.primary} />
      </View>
      <Text style={[styles.label, primary && styles.labelPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 84,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  primary: {},
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 56, height: 56, borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center',
  },
  iconWrapPrimary: { backgroundColor: colors.primary },
  label: { fontSize: typography.caption, color: colors.text, fontWeight: fontWeight.medium },
  labelPrimary: { color: colors.primary, fontWeight: fontWeight.semibold },
});
