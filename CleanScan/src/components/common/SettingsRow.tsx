import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface SettingsRowProps {
  icon?: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onValueChange: (v: boolean) => void };
  showChevron?: boolean;
}

/** A single row in Settings (PRD §8.14). */
export function SettingsRow({ icon, label, value, onPress, toggle, showChevron }: SettingsRowProps) {
  const content = (
    <View style={styles.row}>
      <View style={styles.left}>
        {icon ? <Icon name={icon} size={20} color={colors.textMuted} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {toggle ? (
          <Switch
            value={toggle.value}
            onValueChange={toggle.onValueChange}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        ) : null}
        {showChevron ? <Icon name="chevronRight" size={18} color={colors.textMuted} /> : null}
      </View>
    </View>
  );

  if (toggle || !onPress) return <View>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontSize: typography.body, color: colors.text, fontWeight: fontWeight.medium },
  value: { fontSize: typography.body, color: colors.textMuted },
  pressed: { opacity: 0.6 },
});
