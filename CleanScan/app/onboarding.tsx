import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

/** Local-first privacy onboarding card (PRD §49.3). */
export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Icon name="scan" size={40} color={colors.primary} />
        </View>
        <Text style={styles.brand}>
          Clean<Text style={styles.brandAccent}>Scan</Text>
        </Text>
        <Text style={styles.tagline}>Clean scans. Perfect PDFs.</Text>

        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Icon name="shield" size={24} color={colors.success} />
            <Text style={styles.privacyTitle}>Private by default</Text>
          </View>
          <Text style={styles.privacyBody}>
            CleanScan stores your scans locally on your device. You do not need an account to scan, save, or share PDFs.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Get Started" onPress={() => router.replace('/(tabs)')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  logo: { width: 88, height: 88, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  brand: { fontSize: typography.titleLarge, fontWeight: fontWeight.bold, color: colors.text },
  brandAccent: { color: colors.primary },
  tagline: { fontSize: typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  privacyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  privacyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  privacyTitle: { fontSize: typography.subtitle, fontWeight: fontWeight.semibold, color: colors.text },
  privacyBody: { fontSize: typography.body, color: colors.textMuted, lineHeight: 22 },
  footer: { padding: spacing.md },
});
