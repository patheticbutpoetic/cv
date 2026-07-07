import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput } from 'react-native';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useDocumentStore } from '@/store/documentStore';
import type { Document } from '@/types/document';
import { validateDocumentName } from '@/utils/safeFileName';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { layout, shadows } from '@/constants/layout';

interface RenameDialogProps {
  visible: boolean;
  document: Document | null;
  onClose: () => void;
}

/** Rename modal with name validation (PRD §8.8, §8.11). */
export function RenameDialog({ visible, document, onClose }: RenameDialogProps) {
  const renameDocument = useDocumentStore((s) => s.renameDocument);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (document) {
      setName(document.name);
      setError(null);
    }
  }, [document]);

  const save = async () => {
    const validationError = validateDocumentName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (document) await renameDocument(document.id, name.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Rename document</Text>
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError(null);
            }}
            style={[styles.input, !!error && styles.inputError]}
            autoFocus
            placeholder="Document name"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Document name"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <View style={styles.flex}>
              <SecondaryButton title="Cancel" onPress={onClose} />
            </View>
            <View style={styles.flex}>
              <PrimaryButton title="Save" onPress={save} />
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
  title: { fontSize: typography.subtitle, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  input: { height: layout.inputHeight, borderRadius: layout.inputRadius, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, fontSize: typography.body, color: colors.text, backgroundColor: colors.surface },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: typography.caption, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  flex: { flex: 1 },
});
