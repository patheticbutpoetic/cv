import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import type { ScanFilter } from '@/types/scanner';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { FILTER_LABELS } from '@/services/imageEnhancementService';

interface FilterOptionProps {
  filter: ScanFilter;
  previewUri: string;
  selected: boolean;
  onPress: () => void;
}

/** A selectable filter chip with a live thumbnail (PRD §8.6). */
export function FilterOption({ filter, previewUri, selected, onPress }: FilterOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${FILTER_LABELS[filter]} filter`}
      accessibilityState={{ selected }}
      style={styles.wrap}
    >
      <View style={[styles.thumb, selected && styles.selected]}>
        <Image source={{ uri: previewUri }} style={styles.img} resizeMode="cover" />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{FILTER_LABELS[filter]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 68 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  selected: { borderColor: colors.primary },
  img: { width: '100%', height: '100%' },
  label: { marginTop: spacing.xs, fontSize: typography.caption, color: colors.textMuted },
  labelSelected: { color: colors.primary, fontWeight: fontWeight.semibold },
});
