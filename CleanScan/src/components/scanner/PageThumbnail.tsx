import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Icon } from '@/components/common/Icon';
import type { DocumentPage } from '@/types/page';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

interface PageThumbnailProps {
  page: DocumentPage;
  index: number;
  onPress?: () => void;
  onMore?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  selectionMode?: boolean;
}

/** A page tile in the batch grid (PRD §8.7). */
export function PageThumbnail({
  page,
  index,
  onPress,
  onMore,
  onLongPress,
  selected,
  selectionMode,
}: PageThumbnailProps) {
  const uri = page.thumbnailUri ?? page.workingUri;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={`Page ${index + 1}`}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
    >
      <Image
        source={{ uri }}
        style={[styles.image, { transform: [{ rotate: `${page.rotation}deg` }] }]}
        resizeMode="cover"
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{index + 1}</Text>
      </View>
      {selectionMode ? (
        <View style={[styles.check, selected && styles.checkOn]}>
          {selected ? <Icon name="check" size={14} color={colors.white} /> : null}
        </View>
      ) : onMore ? (
        <Pressable onPress={onMore} hitSlop={8} style={styles.more} accessibilityLabel="Page actions">
          <Icon name="moreVertical" size={16} color={colors.white} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 0.72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  selected: { borderColor: colors.primary, borderWidth: 2 },
  pressed: { opacity: 0.85 },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: colors.white, fontSize: typography.caption, fontWeight: fontWeight.bold },
  more: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
