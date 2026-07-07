import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Icon } from './Icon';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface OptionSheetProps<T extends string> {
  visible: boolean;
  title: string;
  options: Option<T>[];
  selected?: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

/** Generic bottom-sheet option picker used by dropdown-style settings. */
export function OptionSheet<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: OptionSheetProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: option.value === selected }}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Text style={styles.rowLabel}>{option.label}</Text>
              {option.value === selected ? <Icon name="check" size={20} color={colors.primary} /> : null}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, paddingBottom: spacing.xl },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  title: { fontSize: typography.subtitle, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  pressed: { opacity: 0.6 },
  rowLabel: { fontSize: typography.body, color: colors.text },
});
