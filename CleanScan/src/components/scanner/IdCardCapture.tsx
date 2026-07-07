import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

import { Icon } from '@/components/common/Icon';
import { captureDocumentPhoto } from '@/services/cameraService';
import { pickSingleImage, requestGalleryPermission } from '@/services/imageImportService';
import type { DocumentPage } from '@/types/page';
import { useHaptics } from '@/hooks/useHaptics';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

interface IdCardCaptureProps {
  side: 'front' | 'back';
  title: string;
  instruction: string;
  captureLabel: string;
  onCaptured: (page: DocumentPage) => void;
}

/** Camera/import capture for a single ID card side (PRD §46). Color preserved. */
export function IdCardCapture({ side, title, instruction, captureLabel, onCaptured }: IdCardCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const haptics = useHaptics();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission, requestPermission]);

  const capture = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const page = await captureDocumentPhoto(cameraRef.current, 0, 'COLOR');
      haptics.light();
      onCaptured(page);
    } catch {
      /* ignore single failed capture */
    } finally {
      setBusy(false);
    }
  };

  const importImage = async () => {
    const perm = await requestGalleryPermission();
    if (!perm.granted) {
      router.push('/permissions/gallery');
      return;
    }
    const page = await pickSingleImage(0, 'COLOR').catch(() => null);
    if (page) onCaptured(page);
  };

  const permissionReady = permission?.granted;

  return (
    <View style={styles.container}>
      {permissionReady ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={StyleSheet.absoluteFill} />
      )}

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.topBtn} accessibilityLabel="Back">
            <Icon name="back" size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.topBtn} />
        </View>

        <View style={styles.guideWrap} pointerEvents="none">
          <View style={styles.guide} />
          <Text style={styles.tip}>{instruction}</Text>
          <View style={styles.sideBadge}>
            <Text style={styles.sideBadgeText}>{side === 'front' ? 'Front' : 'Back'}</Text>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Pressable onPress={importImage} style={styles.sideBtn} accessibilityLabel="Import from gallery">
            <Icon name="images" size={24} color={colors.white} />
            <Text style={styles.sideLabel}>Gallery</Text>
          </Pressable>
          <Pressable onPress={capture} disabled={busy || !permissionReady} style={styles.shutter} accessibilityLabel={captureLabel}>
            <View style={styles.shutterInner}>{busy ? <ActivityIndicator color={colors.primary} /> : null}</View>
          </Pressable>
          <View style={styles.sideBtn} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  topBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.white, fontSize: typography.subtitle, fontWeight: fontWeight.semibold },
  guideWrap: { alignItems: 'center', gap: spacing.md },
  guide: { width: '84%', aspectRatio: 1.586, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', borderRadius: radius.md },
  tip: { color: colors.white, fontSize: typography.body, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, overflow: 'hidden' },
  sideBadge: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 2, borderRadius: radius.pill },
  sideBadgeText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: typography.caption },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  sideBtn: { width: 64, alignItems: 'center', gap: spacing.xs },
  sideLabel: { color: colors.white, fontSize: typography.caption },
  shutter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
