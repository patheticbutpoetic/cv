import React from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { layout } from '@/constants/layout';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  accessibilityLabel?: string;
}

/** Large blue primary action button (PRD §9.6): 52px tall, 14px radius. */
export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  icon,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={20} color={colors.white} /> : null}
          <Text style={styles.text}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: layout.buttonHeight,
    borderRadius: layout.buttonRadius,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.primaryDark },
  disabled: { opacity: layout.disabledOpacity },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { color: colors.white, fontSize: typography.button, fontWeight: fontWeight.semibold },
});
