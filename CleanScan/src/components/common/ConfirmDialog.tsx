import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/layout';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation modal, e.g. "Delete document?" (PRD §8.11). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <View style={styles.flex}>
              <SecondaryButton title={cancelLabel} onPress={onCancel} />
            </View>
            <View style={styles.flex}>
              <PrimaryButton title={confirmLabel} onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 360, ...shadows.raised },
  title: { fontSize: typography.subtitle, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  message: { fontSize: typography.body, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
