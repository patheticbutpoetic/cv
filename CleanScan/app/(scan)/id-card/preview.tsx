import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppHeader } from '@/components/common/AppHeader';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { Icon } from '@/components/common/Icon';
import { LoadingOverlay } from '@/components/common/LoadingState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

import { useIdCardStore } from '@/store/idCardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDocumentStore } from '@/store/documentStore';
import { createIdCardPdf } from '@/services/idCardPdfService';
import { saveThumbnail } from '@/services/localStorageService';
import { cleanTempFiles } from '@/services/tempFileCleanupService';
import { suggestDocumentName } from '@/services/smartNamingService';
import { createId, nowIso } from '@/utils/id';
import { analyticsService } from '@/services/analyticsService';
import { useHaptics } from '@/hooks/useHaptics';
import type { Document, PdfExportSettings } from '@/types/document';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

export default function IdCardPreviewScreen() {
  const { frontPage, backPage, includeLabels, setIncludeLabels, clear } = useIdCardStore();
  const settings = useSettingsStore((s) => s.settings);
  const { documents, addDocument } = useDocumentStore();
  const haptics = useHaptics();

  const [progress, setProgress] = useState<number | null>(null);
  const [errorDialog, setErrorDialog] = useState(false);

  const createPdf = async () => {
    if (!frontPage && !backPage) return;
    const name = suggestDocumentName({ mode: 'id_card', existingNames: documents.map((d) => d.name) });
    const exportSettings: PdfExportSettings = {
      name,
      paperSize: settings.defaultPaperSize === 'LEGAL' ? 'A4' : (settings.defaultPaperSize as 'A4' | 'LETTER'),
      quality: settings.defaultQuality,
      compression: settings.defaultCompression,
      fitMode: 'CENTER',
    };
    setProgress(0);
    try {
      const result = await createIdCardPdf(frontPage, backPage, exportSettings, includeLabels, setProgress);
      const thumbnailUri = frontPage
        ? await saveThumbnail(frontPage.thumbnailUri ?? frontPage.workingUri).catch(() => undefined)
        : undefined;

      const doc: Document = {
        id: createId(),
        name,
        pdfUri: result.uri,
        thumbnailUri,
        pageCount: 1,
        fileSizeBytes: result.fileSizeBytes,
        paperSize: exportSettings.paperSize,
        quality: exportSettings.quality,
        compression: exportSettings.compression,
        mode: 'id_card',
        isFavorite: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      await addDocument(doc);
      await cleanTempFiles();
      analyticsService.track('id_card_pdf_created', { success: true });
      haptics.success();
      clear();
      router.replace({ pathname: '/(pdf)/ready', params: { id: doc.id, share: '1' } });
    } catch {
      haptics.error();
      setProgress(null);
      setErrorDialog(true);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <AppHeader title="ID Card Preview" onBack={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Front and back will be placed on one A4 page.</Text>

        <View style={styles.cardWrap}>
          <View style={styles.cardSlot}>
            <Text style={styles.slotLabel}>Front</Text>
            {frontPage ? (
              <Image source={{ uri: frontPage.workingUri }} style={styles.cardImg} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}><Icon name="idCard" size={28} color={colors.textMuted} /></View>
            )}
            <SecondaryButton title="Retake Front" icon="retake" onPress={() => router.push('/(scan)/id-card/front')} />
          </View>

          <View style={styles.cardSlot}>
            <Text style={styles.slotLabel}>Back</Text>
            {backPage ? (
              <Image source={{ uri: backPage.workingUri }} style={styles.cardImg} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}><Icon name="idCard" size={28} color={colors.textMuted} /></View>
            )}
            <SecondaryButton title="Retake Back" icon="retake" onPress={() => router.push('/(scan)/id-card/back')} />
          </View>
        </View>

        <Pressable style={styles.labelRow} onPress={() => setIncludeLabels(!includeLabels)} accessibilityRole="checkbox" accessibilityState={{ checked: includeLabels }}>
          <Icon name={includeLabels ? 'checkCircle' : 'add'} size={20} color={includeLabels ? colors.primary : colors.textMuted} />
          <Text style={styles.labelText}>Show Front / Back labels on the PDF</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Create PDF" onPress={createPdf} icon="document" disabled={!frontPage && !backPage} />
      </View>

      <LoadingOverlay visible={progress !== null} title="Generating PDF" message="Placing both sides on one page…" progress={progress ?? 0} />
      <ConfirmDialog
        visible={errorDialog}
        title="Could not create PDF"
        message="Something went wrong. Please try again."
        confirmLabel="Try Again"
        onConfirm={() => { setErrorDialog(false); createPdf(); }}
        onCancel={() => setErrorDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  subtitle: { fontSize: typography.body, color: colors.textMuted },
  cardWrap: { gap: spacing.md },
  cardSlot: { gap: spacing.sm },
  slotLabel: { fontSize: typography.body, fontWeight: fontWeight.semibold, color: colors.text },
  cardImg: { width: '100%', aspectRatio: 1.586, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  placeholder: { width: '100%', aspectRatio: 1.586, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  labelText: { fontSize: typography.body, color: colors.text },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
