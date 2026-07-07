import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Icon } from './Icon';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/layout';

interface LoadingStateProps {
  title?: string;
  message?: string;
  /** 0..1 — when provided, shows a progress bar + percentage (PRD §8.15). */
  progress?: number;
}

/** Inline loading block with optional progress bar. */
export function LoadingState({ title = 'Loading…', message, progress }: LoadingStateProps) {
  const pct = progress !== undefined ? Math.round(Math.max(0, Math.min(1, progress)) * 100) : undefined;
  return (
    <View style={styles.inline} accessibilityRole="progressbar" accessibilityLabel={title}>
      {progress === undefined ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <View style={styles.iconWrap}>
          <Icon name="document" size={32} color={colors.primary} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {pct !== undefined ? (
        <>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.percent}>{pct}%</Text>
        </>
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

/** Full-screen blocking overlay used during PDF generation. */
export function LoadingOverlay(props: LoadingStateProps & { visible: boolean }) {
  return (
    <Modal visible={props.visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LoadingState {...props} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  inline: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },
  title: { fontSize: typography.subtitle, fontWeight: fontWeight.semibold, color: colors.text },
  message: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center' },
  track: { width: 200, height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  fill: { height: 8, borderRadius: radius.pill, backgroundColor: colors.primary },
  percent: { fontSize: typography.caption, color: colors.textMuted, fontWeight: fontWeight.medium },
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, minWidth: 260, ...shadows.raised },
});
