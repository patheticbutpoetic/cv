import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Icon } from '@/components/common/Icon';
import type { Document } from '@/types/document';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { layout, shadows } from '@/constants/layout';
import { formatFileSize } from '@/utils/fileSize';
import { formatRelativeDate } from '@/utils/dateFormat';

interface DocumentCardProps {
  document: Document;
  onPress: () => void;
  onMore?: () => void;
  onToggleFavorite?: () => void;
}

/** Library / recent list card: thumbnail, name, pages, size, date (PRD §8.1). */
export function DocumentCard({ document, onPress, onMore, onToggleFavorite }: DocumentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${document.name}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.thumb}>
        {document.thumbnailUri ? (
          <Image source={{ uri: document.thumbnailUri }} style={styles.thumbImg} resizeMode="cover" />
        ) : (
          <Icon name="document" size={26} color={colors.primary} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'} · {formatFileSize(document.fileSizeBytes)}
        </Text>
        <Text style={styles.date}>{formatRelativeDate(document.createdAt)}</Text>
      </View>

      <View style={styles.actions}>
        {onToggleFavorite ? (
          <Pressable onPress={onToggleFavorite} hitSlop={8} accessibilityLabel="Toggle favorite">
            <Icon
              name={document.isFavorite ? 'star' : 'starOutline'}
              size={20}
              color={document.isFavorite ? colors.warning : colors.textMuted}
            />
          </Pressable>
        ) : null}
        {onMore ? (
          <Pressable onPress={onMore} hitSlop={8} accessibilityLabel="More actions">
            <Icon name="moreVertical" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    gap: spacing.md,
    ...shadows.card,
  },
  pressed: { opacity: 0.85 },
  thumb: {
    width: 52,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: typography.body, fontWeight: fontWeight.semibold, color: colors.text },
  meta: { fontSize: typography.caption, color: colors.textMuted },
  date: { fontSize: typography.caption, color: colors.textMuted },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
