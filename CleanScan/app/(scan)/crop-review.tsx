import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/components/common/AppHeader';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { IconButton } from '@/components/common/IconButton';
import { QualityScoreCard } from '@/components/scanner/QualityScoreCard';
import { RetakeWarningModal } from '@/components/scanner/RetakeWarningModal';
import { CropOverlay } from '@/components/scanner/CropOverlay';
import { useScanStore } from '@/store/scanStore';
import { useSettingsStore } from '@/store/settingsStore';
import { rotateImage, cropImage } from '@/services/cropService';
import { shouldWarnRetake } from '@/services/scanQuality/scoring';
import type { CropRect } from '@/types/scanner';
import { analyticsService } from '@/services/analyticsService';
import { useHaptics } from '@/hooks/useHaptics';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

export default function CropReviewScreen() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const { currentPages, updatePage, removePage } = useScanStore();
  const warningsEnabled = useSettingsStore((s) => s.settings.scanQualityWarningsEnabled);
  const haptics = useHaptics();

  const page = useMemo(() => currentPages.find((p) => p.id === pageId), [currentPages, pageId]);
  const index = currentPages.findIndex((p) => p.id === pageId);

  const [busy, setBusy] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [pendingCrop, setPendingCrop] = useState<CropRect | null>(null);
  const [warningDismissed, setWarningDismissed] = useState(false);

  if (!page) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Review" onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.error}>Could not load page preview.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const showWarning =
    warningsEnabled && !warningDismissed && !!page.quality && shouldWarnRetake(page.quality) && !cropMode;

  const rotate = async (degrees: number) => {
    setBusy(true);
    try {
      const nextRotation = (((page.rotation + degrees) % 360) + 360) % 360;
      const rotatedUri = await rotateImage(page.originalUri, nextRotation);
      updatePage(page.id, { rotation: nextRotation, workingUri: rotatedUri });
      haptics.light();
    } finally {
      setBusy(false);
    }
  };

  const applyCrop = async () => {
    if (!pendingCrop) {
      setCropMode(false);
      return;
    }
    setBusy(true);
    try {
      const cropped = await cropImage(page.workingUri, pendingCrop);
      updatePage(page.id, { workingUri: cropped, crop: pendingCrop });
      haptics.success();
    } finally {
      setBusy(false);
      setCropMode(false);
      setPendingCrop(null);
    }
  };

  const retake = () => {
    removePage(page.id);
    router.back();
  };

  const goNext = () => router.push({ pathname: '/(scan)/enhance', params: { pageId: page.id } });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <AppHeader
          title="Review"
          onBack={() => router.back()}
          rightActions={[{ icon: 'delete', onPress: retake, accessibilityLabel: 'Retake page' }]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.previewWrap}>
          <Image
            source={{ uri: page.workingUri }}
            style={[styles.image, { transform: [{ rotate: `${cropMode ? 0 : page.rotation}deg` }] }]}
            resizeMode="contain"
          />
          {cropMode ? (
            <CropOverlay
              imageWidth={page.width ?? 1000}
              imageHeight={page.height ?? 1400}
              onChange={setPendingCrop}
            />
          ) : null}
        </View>

        <Text style={styles.pageIndicator}>
          {index + 1}/{currentPages.length}
        </Text>

        {page.quality && !cropMode ? <QualityScoreCard result={page.quality} /> : null}

        {/* Bottom tools */}
        <View style={styles.tools}>
          {cropMode ? (
            <>
              <IconButton icon="close" label="Cancel" accessibilityLabel="Cancel crop" onPress={() => { setCropMode(false); setPendingCrop(null); }} />
              <IconButton icon="check" label="Apply Crop" accessibilityLabel="Apply crop" color={colors.primary} onPress={applyCrop} />
            </>
          ) : (
            <>
              <IconButton icon="rotateLeft" label="Rotate Left" accessibilityLabel="Rotate left" onPress={() => rotate(-90)} disabled={busy} />
              <IconButton icon="rotateRight" label="Rotate Right" accessibilityLabel="Rotate right" onPress={() => rotate(90)} disabled={busy} />
              <IconButton icon="crop" label="Crop" accessibilityLabel="Crop page" onPress={() => setCropMode(true)} disabled={busy} />
              <IconButton icon="retake" label="Retake" accessibilityLabel="Retake page" onPress={retake} disabled={busy} />
            </>
          )}
        </View>
      </ScrollView>

      {!cropMode ? (
        <View style={styles.footer}>
          <PrimaryButton title="Continue" onPress={goNext} loading={busy} />
        </View>
      ) : null}

      <RetakeWarningModal
        visible={showWarning}
        result={page.quality ?? null}
        onRetake={() => {
          analyticsService.track('scan_quality_retake_clicked');
          retake();
        }}
        onUseAnyway={() => setWarningDismissed(true)}
        onFix={() => {
          setWarningDismissed(true);
          setCropMode(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  previewWrap: { aspectRatio: 0.75, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  image: { width: '100%', height: '100%' },
  pageIndicator: { textAlign: 'center', color: colors.textMuted, fontSize: typography.body },
  tools: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start' },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.textMuted, fontSize: typography.body },
});
