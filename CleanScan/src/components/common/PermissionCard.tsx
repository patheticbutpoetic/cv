import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/layout';

interface PermissionCardProps {
  icon: IconName;
  title: string;
  body: string;
  allowLabel: string;
  onAllow: () => void;
  onNotNow: () => void;
  /** When permission is permanently blocked, show "Open Settings". */
  blocked?: boolean;
  onOpenSettings?: () => void;
}

/** Explains why a permission is needed (PRD §8.3, §8.4). */
export function PermissionCard({
  icon,
  title,
  body,
  allowLabel,
  onAllow,
  onNotNow,
  blocked,
  onOpenSettings,
}: PermissionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={34} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <View style={styles.actions}>
        {blocked ? (
          <PrimaryButton title="Open Settings" onPress={onOpenSettings ?? onAllow} icon="settings" />
        ) : (
          <PrimaryButton title={allowLabel} onPress={onAllow} />
        )}
        <SecondaryButton title="Not Now" onPress={onNotNow} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', ...shadows.card },
  iconWrap: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  title: { fontSize: typography.title, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  body: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  actions: { alignSelf: 'stretch', gap: spacing.sm },
});
