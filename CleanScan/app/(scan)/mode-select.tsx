import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppHeader } from '@/components/common/AppHeader';
import { ModeCard } from '@/components/scanner/ModeCard';
import { SCAN_MODES } from '@/constants/scanModes';
import type { ScanMode } from '@/types/scanner';
import { useScanStore } from '@/store/scanStore';
import { useIdCardStore } from '@/store/idCardStore';
import { analyticsService } from '@/services/analyticsService';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

/** Mode Selection screen (PRD §45.2, §56.1). Default mode is Document. */
export default function ModeSelectScreen() {
  const setMode = useScanStore((s) => s.setMode);
  const clearScan = useScanStore((s) => s.clearScan);
  const clearIdCard = useIdCardStore((s) => s.clear);

  const select = (mode: ScanMode) => {
    clearScan();
    setMode(mode);
    analyticsService.track('scan_mode_selected', { scan_mode: mode });

    if (mode === 'id_card') {
      clearIdCard();
      router.push('/(scan)/id-card/front');
      return;
    }
    router.push({ pathname: '/(scan)/camera', params: { mode } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <AppHeader title="New Scan" onBack={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>What are you scanning?</Text>
        <View style={styles.list}>
          {SCAN_MODES.map((meta) => (
            <ModeCard
              key={meta.mode}
              meta={meta}
              recommended={meta.mode === 'document'}
              onPress={() => select(meta.mode)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  question: { fontSize: typography.title, fontWeight: fontWeight.bold, color: colors.text },
  list: { gap: spacing.sm },
});
