import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { layout } from '@/constants/layout';

interface HeaderAction {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
}

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightActions?: HeaderAction[];
  centerTitle?: boolean;
}

/** Reusable screen header with optional back button and right actions. */
export function AppHeader({ title, subtitle, onBack, rightActions = [], centerTitle }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={layout.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.iconBtn}
          >
            <Icon name="back" size={26} color={colors.text} />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.titleWrap, centerTitle && styles.centerTitle]}>
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.right]}>
        {rightActions.map((action) => (
          <Pressable
            key={action.icon}
            onPress={action.onPress}
            hitSlop={layout.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
            style={styles.iconBtn}
          >
            <Icon name={action.icon} size={22} color={colors.text} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  side: { minWidth: 40, justifyContent: 'center' },
  right: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  titleWrap: { flex: 1, paddingHorizontal: spacing.sm },
  centerTitle: { alignItems: 'center' },
  title: { fontSize: typography.subtitle, fontWeight: fontWeight.semibold, color: colors.text },
  subtitle: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  iconBtn: { padding: spacing.xs },
});
