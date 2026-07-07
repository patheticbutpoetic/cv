import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import type { ScanQualityResult } from '@/types/scanner';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/layout';

interface RetakeWarningModalProps {
  visible: boolean;
  result: ScanQualityResult | null;
  onRetake: () => void;
  onUseAnyway: () => void;
  onFix?: () => void;
}

/** Auto Retake Warning modal (PRD §44.1, §56.2). */
export function RetakeWarningModal({ visible, result, onRetake, onUseAnyway, onFix }: RetakeWarningModalProps) {
  const explanation =
    result && result.suggestions.length > 0
      ? result.suggestions.join(' ')
      : 'Retaking now will give you a better PDF.';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Icon name="warning" size={30} color={colors.warning} />
          </View>
          <Text style={styles.title}>This scan may not be clear</Text>
          <Text style={styles.body}>{explanation}</Text>
          <View style={styles.actions}>
            <PrimaryButton title="Retake" onPress={onRetake} icon="retake" />
            {onFix ? <SecondaryButton title="Fix" onPress={onFix} icon="crop" /> : null}
            <SecondaryButton title="Use Anyway" onPress={onUseAnyway} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 360, alignItems: 'center', ...shadows.raised },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(245,158,11,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { fontSize: typography.subtitle, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  body: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  actions: { alignSelf: 'stretch', gap: spacing.sm },
});
