import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Helpful empty state (PRD §53.3). */
export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={styles.iconWrap}>
        <Icon name={icon} size={40} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton title={actionLabel} onPress={onAction} icon="scan" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: typography.subtitle, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
  message: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  action: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
