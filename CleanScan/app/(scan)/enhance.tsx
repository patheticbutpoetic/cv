import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { router, useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/components/common/AppHeader';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { FilterOption } from '@/components/scanner/FilterOption';
import { Icon } from '@/components/common/Icon';
import { useScanStore } from '@/store/scanStore';
import type { ScanFilter } from '@/types/scanner';
import { analyticsService } from '@/services/analyticsService';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

const FILTERS: ScanFilter[] = ['ORIGINAL', 'CLEAN', 'BW', 'GRAYSCALE', 'COLOR'];

export default function EnhanceScreen() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const { currentPages, updatePage, isBatchMode } = useScanStore();
  const page = useMemo(() => currentPages.find((p) => p.id === pageId), [currentPages, pageId]);
  const [applyToAll, setApplyToAll] = useState(false);

  if (!page) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Enhance" onBack={() => router.back()} />
      </SafeAreaView>
    );
  }

  const patchTargets = (patch: Partial<typeof page>) => {
    if (applyToAll) {
      currentPages.forEach((p) => updatePage(p.id, patch));
    } else {
      updatePage(page.id, patch);
    }
  };

  const selectFilter = (filter: ScanFilter) => {
    patchTargets({ filter });
    analyticsService.track('filter_selected');
  };

  const next = () => {
    if (isBatchMode) router.replace('/(scan)/batch-pages');
    else router.push('/(scan)/export');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <AppHeader
          title="Enhance"
          onBack={() => router.back()}
          rightActions={
            isBatchMode
              ? [{ icon: applyToAll ? 'checkCircle' : 'documents', onPress: () => setApplyToAll((v) => !v), accessibilityLabel: 'Apply to all pages' }]
              : []
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isBatchMode ? (
          <Pressable style={styles.applyRow} onPress={() => setApplyToAll((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: applyToAll }}>
            <Icon name={applyToAll ? 'checkCircle' : 'add'} size={20} color={applyToAll ? colors.primary : colors.textMuted} />
            <Text style={styles.applyText}>Apply to All pages</Text>
          </Pressable>
        ) : null}

        <View style={styles.previewWrap}>
          <Image source={{ uri: page.workingUri }} style={[styles.image, { transform: [{ rotate: `${page.rotation}deg` }] }]} resizeMode="contain" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((filter) => (
            <FilterOption
              key={filter}
              filter={filter}
              previewUri={page.workingUri}
              selected={page.filter === filter}
              onPress={() => selectFilter(filter)}
            />
          ))}
        </ScrollView>

        <View style={styles.sliders}>
          <SliderRow label="Brightness" value={page.brightness} onChange={(v) => patchTargets({ brightness: v })} />
          <SliderRow label="Contrast" value={page.contrast} onChange={(v) => patchTargets({ contrast: v })} />
          <SliderRow label="Sharpness" value={page.sharpness} onChange={(v) => patchTargets({ sharpness: v })} />
        </View>
        <Text style={styles.note}>
          Filters and adjustments are saved with each page. Full scanner-style processing arrives in a later update.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Next" onPress={next} />
      </View>
    </SafeAreaView>
  );
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{Math.round(value)}</Text>
      </View>
      <Slider
        minimumValue={-100}
        maximumValue={100}
        value={value}
        step={1}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  applyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  applyText: { fontSize: typography.body, color: colors.text, fontWeight: fontWeight.medium },
  previewWrap: { aspectRatio: 0.78, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  image: { width: '100%', height: '100%' },
  filterRow: { gap: spacing.md, paddingVertical: spacing.xs },
  sliders: { gap: spacing.md },
  sliderRow: { gap: spacing.xs },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: typography.body, color: colors.text },
  sliderValue: { fontSize: typography.body, color: colors.textMuted },
  note: { fontSize: typography.caption, color: colors.textMuted, lineHeight: 18 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
