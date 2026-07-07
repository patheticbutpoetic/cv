import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';

import { Icon } from '@/components/common/Icon';
import { captureDocumentPhoto } from '@/services/cameraService';
import {
  pickMultipleImages,
  pickSingleImage,
  requestGalleryPermission,
} from '@/services/imageImportService';
import { analyzePage } from '@/services/scanQualityService';
import { useScanStore } from '@/store/scanStore';
import { getModeMeta } from '@/constants/scanModes';
import { analyticsService } from '@/services/analyticsService';
import { useHaptics } from '@/hooks/useHaptics';
import { AppError, isCancellation } from '@/utils/errors';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

export default function CameraScreen() {
  const params = useLocalSearchParams<{ batch?: string; import?: string; mode?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const haptics = useHaptics();

  const { mode, currentPages, isBatchMode, addPage, setBatchMode, setActivePage, updatePage } = useScanStore();
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [capturing, setCapturing] = useState(false);
  const [importing, setImporting] = useState(false);
  const meta = getModeMeta(mode);

  // Apply batch flag from query param.
  useEffect(() => {
    if (params.batch === '1') setBatchMode(true);
  }, [params.batch, setBatchMode]);

  // Import flow: launch gallery immediately, then go to batch pages.
  useEffect(() => {
    if (params.import !== '1') return;
    (async () => {
      const perm = await requestGalleryPermission();
      if (!perm.granted) {
        router.replace('/permissions/gallery');
        return;
      }
      setImporting(true);
      analyticsService.track('gallery_import_started');
      try {
        const pages = await pickMultipleImages(currentPages.length, meta.defaultFilter);
        if (pages.length === 0) {
          router.back();
          return;
        }
        pages.forEach(addPage);
        analyticsService.track('gallery_import_completed', { page_count: pages.length });
        router.replace('/(scan)/batch-pages');
      } catch {
        router.back();
      } finally {
        setImporting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Request camera permission on mount (skip during import flow).
  useEffect(() => {
    if (params.import === '1') return;
    if (permission && !permission.granted) {
      if (permission.canAskAgain) {
        requestPermission();
      } else {
        router.replace('/permissions/camera');
      }
    }
  }, [permission, params.import, requestPermission]);

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const page = await captureDocumentPhoto(cameraRef.current, currentPages.length, meta.defaultFilter);
      haptics.light();
      addPage(page);
      analyticsService.track('page_captured', { scan_mode: mode });

      // Run quality analysis in the background and attach the result.
      analyzePage(page)
        .then((quality) => updatePage(page.id, { quality }))
        .catch(() => {});

      if (isBatchMode) {
        setActivePage(page.id); // stay on camera in batch mode
      } else {
        router.push({ pathname: '/(scan)/crop-review', params: { pageId: page.id } });
      }
    } catch (error) {
      if (!isCancellation(error)) {
        const message = error instanceof AppError ? error.userMessage : 'Camera capture failed. Please try again.';
        haptics.error();
        // A single failed capture should not crash the flow.
        console.warn(message);
      }
    } finally {
      setCapturing(false);
    }
  };

  const handleGallery = async () => {
    const perm = await requestGalleryPermission();
    if (!perm.granted) {
      router.push('/permissions/gallery');
      return;
    }
    const page = await pickSingleImage(currentPages.length, meta.defaultFilter).catch(() => null);
    if (!page) return;
    addPage(page);
    analyzePage(page).then((q) => updatePage(page.id, { quality: q })).catch(() => {});
    if (isBatchMode) {
      setActivePage(page.id);
    } else {
      router.push({ pathname: '/(scan)/crop-review', params: { pageId: page.id } });
    }
  };

  const finishBatch = () => {
    if (currentPages.length === 0) {
      router.back();
      return;
    }
    router.replace('/(scan)/batch-pages');
  };

  if (importing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Importing images…</Text>
      </View>
    );
  }

  if (!permission) {
    return <View style={styles.black} />;
  }

  if (!permission.granted) {
    // Permission flow handled by redirect; render a neutral placeholder.
    return <View style={styles.black} />;
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" enableTorch={flash === 'on'} />

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']} pointerEvents="box-none">
        {/* Top controls */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.topBtn} accessibilityLabel="Close camera">
            <Icon name="close" size={24} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={() => router.replace('/(scan)/mode-select')}
            style={styles.modePill}
            accessibilityLabel="Change scan mode"
          >
            <Icon name={meta.icon} size={16} color={colors.white} />
            <Text style={styles.modePillText}>{meta.title}</Text>
          </Pressable>
          <Pressable
            onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}
            style={styles.topBtn}
            accessibilityLabel="Toggle flash"
          >
            <Icon name={flash === 'on' ? 'flash' : 'flashOff'} size={22} color={colors.white} />
          </Pressable>
        </View>

        {/* Document guide */}
        <View style={styles.guideWrap} pointerEvents="none">
          <View style={styles.guide} />
          <Text style={styles.tip}>Position the document inside the frame</Text>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <Pressable onPress={handleGallery} style={styles.sideBtn} accessibilityLabel="Open gallery">
            <Icon name="images" size={26} color={colors.white} />
            <Text style={styles.sideLabel}>Gallery</Text>
          </Pressable>

          <Pressable
            onPress={handleCapture}
            disabled={capturing}
            style={styles.shutter}
            accessibilityLabel="Capture document photo"
          >
            <View style={styles.shutterInner}>
              {capturing ? <ActivityIndicator color={colors.primary} /> : null}
            </View>
          </Pressable>

          <Pressable
            onPress={isBatchMode ? finishBatch : () => setBatchMode(true)}
            style={styles.sideBtn}
            accessibilityLabel={isBatchMode ? 'Finish batch scan' : 'Switch to batch mode'}
          >
            {isBatchMode ? (
              <>
                <View style={styles.counter}>
                  <Text style={styles.counterText}>{currentPages.length}</Text>
                </View>
                <Text style={styles.sideLabel}>Done</Text>
              </>
            ) : (
              <>
                <Icon name="documents" size={26} color={colors.white} />
                <Text style={styles.sideLabel}>Batch</Text>
              </>
            )}
          </Pressable>
        </View>

        {isBatchMode && currentPages.length > 0 ? (
          <View style={styles.pageBadge} pointerEvents="none">
            <Text style={styles.pageBadgeText}>Page {currentPages.length}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  black: { flex: 1, backgroundColor: colors.black },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: spacing.md },
  loadingText: { color: colors.textMuted, fontSize: typography.body },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  topBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modePill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: spacing.md, height: 36, borderRadius: radius.pill },
  modePillText: { color: colors.white, fontSize: typography.caption, fontWeight: fontWeight.semibold },
  guideWrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  guide: { width: '82%', aspectRatio: 0.72, borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)', borderRadius: radius.md },
  tip: { color: colors.white, fontSize: typography.body, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, overflow: 'hidden' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  sideBtn: { alignItems: 'center', gap: spacing.xs, width: 64 },
  sideLabel: { color: colors.white, fontSize: typography.caption },
  shutter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  counter: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  counterText: { color: colors.white, fontWeight: fontWeight.bold },
  pageBadge: { position: 'absolute', top: 80, alignSelf: 'center', backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  pageBadgeText: { color: colors.white, fontWeight: fontWeight.semibold, fontSize: typography.caption },
});
