import React from 'react';
import { View, StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

/** Base wrapper: safe area + off-white background (PRD §9.1). */
export function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  edges = ['top'],
  contentStyle,
  backgroundColor = colors.background,
}: ScreenContainerProps) {
  const inner = (
    <View style={[padded && styles.padded, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={edges}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  padded: { paddingHorizontal: spacing.md },
  scrollContent: { paddingBottom: spacing.xxl },
});
