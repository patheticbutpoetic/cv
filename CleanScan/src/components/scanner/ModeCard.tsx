import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon } from '@/components/common/Icon';
import type { ScanModeMeta } from '@/constants/scanModes';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { layout, shadows } from '@/constants/layout';

interface ModeCardProps {
  meta: ScanModeMeta;
  selected?: boolean;
  recommended?: boolean;
  onPress: () => void;
}

/** Mode selection card (PRD §56.1). */
export function ModeCard({ meta, selected, recommended, onPress }: ModeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${meta.title}. ${meta.description}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <Icon name={meta.icon} size={24} color={selected ? colors.white : colors.primary} />
      </View>
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{meta.title}</Text>
          {recommended ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Recommended</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.desc}>{meta.description}</Text>
      </View>
      <Icon name="chevronRight" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
  selected: { borderColor: colors.primary },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: colors.primary },
  text: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: typography.body, fontWeight: fontWeight.semibold, color: colors.text },
  desc: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  badge: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: fontWeight.bold },
});
