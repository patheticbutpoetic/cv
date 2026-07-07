import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Icon, IconName } from '@/components/common/Icon';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useDocumentStore } from '@/store/documentStore';
import { useScanStore } from '@/store/scanStore';
import { analyticsService } from '@/services/analyticsService';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/layout';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const QUICK_ACTIONS: { icon: IconName; label: string; route: string; mode?: string }[] = [
  { icon: 'camera', label: 'Camera', route: '/(scan)/camera' },
  { icon: 'images', label: 'Import Images', route: '/(scan)/camera?import=1' },
  { icon: 'document', label: 'Batch PDF', route: '/(scan)/camera?batch=1' },
];

export default function HomeScreen() {
  const { documents, isLoading } = useDocumentStore();
  const clearScan = useScanStore((s) => s.clearScan);
  const recent = useMemo(() => documents.slice(0, 4), [documents]);

  const startNewScan = () => {
    clearScan();
    analyticsService.track('scan_started');
    router.push('/(scan)/mode-select');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>Adam 👋</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/settings')}
            hitSlop={8}
            accessibilityLabel="Settings"
            style={styles.bell}
          >
            <Icon name="notification" size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Primary CTA */}
        <Pressable
          onPress={startNewScan}
          accessibilityRole="button"
          accessibilityLabel="Start new scan. Scan documents to PDF."
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <View style={styles.ctaIcon}>
            <Icon name="scan" size={26} color={colors.white} />
          </View>
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Start New Scan</Text>
            <Text style={styles.ctaSubtitle}>Scan documents to PDF</Text>
          </View>
          <Icon name="chevronRight" size={22} color={colors.white} />
        </Pressable>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => {
                clearScan();
                router.push(action.route as never);
              }}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({ pressed }) => [styles.quickCard, pressed && styles.quickPressed]}
            >
              <View style={styles.quickIcon}>
                <Icon name={action.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent documents */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
          {recent.length > 0 ? (
            <Pressable onPress={() => router.push('/(tabs)/library')} hitSlop={8}>
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.skeletonWrap}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeleton} />
            ))}
          </View>
        ) : recent.length === 0 ? (
          <EmptyState
            icon="document"
            title="No documents yet"
            message="Scan your first document or import images to create a PDF. Your scans stay on your device."
            actionLabel="Start Scanning"
            onAction={startNewScan}
          />
        ) : (
          <View style={styles.list}>
            {recent.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onPress={() => router.push({ pathname: '/(pdf)/preview', params: { id: doc.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  greeting: { fontSize: typography.body, color: colors.textMuted },
  name: { fontSize: typography.titleLarge, fontWeight: fontWeight.bold, color: colors.text },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md, ...shadows.raised,
  },
  ctaPressed: { backgroundColor: colors.primaryDark },
  ctaIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  ctaText: { flex: 1 },
  ctaTitle: { fontSize: typography.subtitle, fontWeight: fontWeight.bold, color: colors.white },
  ctaSubtitle: { fontSize: typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  sectionTitle: { fontSize: typography.subtitle, fontWeight: fontWeight.semibold, color: colors.text },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { fontSize: typography.body, color: colors.primary, fontWeight: fontWeight.medium },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm, ...shadows.card },
  quickPressed: { opacity: 0.85 },
  quickIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: typography.caption, color: colors.text, fontWeight: fontWeight.medium },
  list: { gap: spacing.sm },
  skeletonWrap: { gap: spacing.sm },
  skeleton: { height: 84, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
});
