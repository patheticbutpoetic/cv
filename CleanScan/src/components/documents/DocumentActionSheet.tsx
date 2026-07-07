import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Icon, IconName } from '@/components/common/Icon';
import type { Document } from '@/types/document';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

export type DocumentAction = 'share' | 'rename' | 'favorite' | 'move' | 'duplicate' | 'delete';

interface DocumentActionSheetProps {
  visible: boolean;
  document: Document | null;
  onClose: () => void;
  onAction: (action: DocumentAction) => void;
}

/** Bottom action sheet for a document (PRD §8.11). */
export function DocumentActionSheet({ visible, document, onClose, onAction }: DocumentActionSheetProps) {
  if (!document) return null;

  const rows: { action: DocumentAction; icon: IconName; label: string; danger?: boolean }[] = [
    { action: 'share', icon: 'share', label: 'Share' },
    { action: 'rename', icon: 'edit', label: 'Rename' },
    {
      action: 'favorite',
      icon: document.isFavorite ? 'starOutline' : 'star',
      label: document.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
    },
    { action: 'move', icon: 'folder', label: 'Move to Folder' },
    { action: 'duplicate', icon: 'documents', label: 'Duplicate' },
    { action: 'delete', icon: 'delete', label: 'Delete', danger: true },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title} numberOfLines={1}>
            {document.name}
          </Text>
          {rows.map((row) => (
            <Pressable
              key={row.action}
              onPress={() => onAction(row.action)}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Icon name={row.icon} size={22} color={row.danger ? colors.danger : colors.text} />
              <Text style={[styles.rowLabel, row.danger && styles.danger]}>{row.label}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  title: { fontSize: typography.subtitle, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  pressed: { opacity: 0.6 },
  rowLabel: { fontSize: typography.body, color: colors.text },
  danger: { color: colors.danger },
});
