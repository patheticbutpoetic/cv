import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon, IconName } from '@/components/common/Icon';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { layout, shadows } from '@/constants/layout';

interface ToolCardProps {
  icon: IconName;
  title: string;
  description: string;
  comingSoon?: boolean;
  onPress?: () => void;
}

/** Tool card in the 2-column Tools grid (PRD §8.12). */
export function ToolCard({ icon, title, description, comingSoon, onPress }: ToolCardProps) {
  return (
    <Pressable
      onPress={comingSoon ? undefined : onPress}
      disabled={comingSoon}
      accessibilityRole="button"
      accessibilityLabel={comingSoon ? `${title}. Coming soon` : title}
      style={({ pressed }) => [styles.card, pressed && !comingSoon && styles.pressed, comingSoon && styles.dim]}
    >
      <View style={styles.iconWrap}>
        <Icon name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc} numberOfLines={2}>
        {description}
      </Text>
      {comingSoon ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Coming Soon</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 128,
    ...shadows.card,
  },
  pressed: { opacity: 0.85 },
  dim: { opacity: 0.75 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  title: { fontSize: typography.body, fontWeight: fontWeight.semibold, color: colors.text },
  desc: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, color: colors.textMuted, fontWeight: fontWeight.semibold },
});
