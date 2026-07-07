import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppHeader } from '@/components/common/AppHeader';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { SettingsRow } from '@/components/common/SettingsRow';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { LoadingOverlay } from '@/components/common/LoadingState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { OptionSheet, Option } from '@/components/common/OptionSheet';

import { useScanStore } from '@/store/scanStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDocumentStore } from '@/store/documentStore';
import { suggestDocumentName } from '@/services/smartNamingService';
import { createPdfFromPages } from '@/services/pdfGenerationService';
import { cleanTempFiles } from '@/services/tempFileCleanupService';
import { saveThumbnail } from '@/services/localStorageService';
import { validateDocumentName } from '@/utils/safeFileName';
import { createId, nowIso } from '@/utils/id';
import { estimateProjectSize } from '@/services/tempFileCleanupService';
import { isLargePdf } from '@/utils/fileSize';
import { analyticsService } from '@/services/analyticsService';
import { useHaptics } from '@/hooks/useHaptics';
import { AppError } from '@/utils/errors';
import type { PaperSize, PdfQuality, CompressionLevel } from '@/types/scanner';
import type { Document, PdfExportSettings } from '@/types/document';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

const PAPER_OPTIONS: Option<PaperSize>[] = [
  { value: 'A4', label: 'A4' },
  { value: 'LETTER', label: 'Letter' },
  { value: 'LEGAL', label: 'Legal' },
];
const QUALITY_OPTIONS: Option<PdfQuality>[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];
const COMPRESSION_OPTIONS: Option<CompressionLevel>[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];
const labelOf = <T extends string>(opts: Option<T>[], v: T) => opts.find((o) => o.value === v)?.label ?? v;

type Sheet = 'paper' | 'quality' | 'compression' | null;

export default function ExportScreen() {
  const { currentPages, mode, clearScan } = useScanStore();
  const settings = useSettingsStore((s) => s.settings);
  const { documents, addDocument } = useDocumentStore();
  const haptics = useHaptics();

  const suggestedName = useMemo(
    () => suggestDocumentName({ mode, existingNames: documents.map((d) => d.name) }),
    [mode, documents]
  );

  const [name, setName] = useState(suggestedName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.defaultPaperSize);
  const [quality, setQuality] = useState<PdfQuality>(settings.defaultQuality);
  const [compression, setCompression] = useState<CompressionLevel>(settings.defaultCompression);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorDialog, setErrorDialog] = useState(false);
  const [largeWarning, setLargeWarning] = useState(false);

  const firstPage = currentPages[0];

  const generate = async (shareAfter: boolean) => {
    const validationError = validateDocumentName(name);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    const exportSettings: PdfExportSettings = { name: name.trim(), paperSize, quality, compression, fitMode: 'FIT' };
    setProgress(0);
    analyticsService.track('pdf_generation_started', { page_count: currentPages.length, scan_mode: mode, quality_setting: quality });

    try {
      const result = await createPdfFromPages(currentPages, exportSettings, setProgress);

      // Persist a document thumbnail from the first page.
      let thumbnailUri: string | undefined;
      if (firstPage) {
        thumbnailUri = await saveThumbnail(firstPage.thumbnailUri ?? firstPage.workingUri).catch(() => undefined);
      }

      const doc: Document = {
        id: createId(),
        name: exportSettings.name,
        pdfUri: result.uri,
        thumbnailUri,
        pageCount: result.pageCount,
        fileSizeBytes: result.fileSizeBytes,
        paperSize,
        quality,
        compression,
        mode,
        isFavorite: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      await addDocument(doc);
      await cleanTempFiles();
      analyticsService.track('pdf_generation_completed', { page_count: result.pageCount, success: true });
      haptics.success();
      clearScan();

      router.replace({ pathname: '/(pdf)/ready', params: { id: doc.id, share: shareAfter ? '1' : '0' } });
    } catch (error) {
      analyticsService.track('pdf_generation_failed', { success: false });
      haptics.error();
      setProgress(null);
      setErrorDialog(true);
    }
  };

  const checkAndGenerate = async (shareAfter: boolean) => {
    const uris = currentPages.map((p) => p.workingUri);
    const estimated = await estimateProjectSize(uris);
    if (isLargePdf(estimated, currentPages.length)) {
      setLargeWarning(true);
      return;
    }
    generate(shareAfter);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <AppHeader title="Preview PDF" subtitle={`1 of ${currentPages.length}`} onBack={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.previewWrap}>
          {firstPage ? (
            <Image source={{ uri: firstPage.workingUri }} style={[styles.preview, { transform: [{ rotate: `${firstPage.rotation}deg` }] }]} resizeMode="contain" />
          ) : (
            <Icon name="document" size={40} color={colors.textMuted} />
          )}
        </View>

        <Text style={styles.label}>Document Name</Text>
        <View style={[styles.inputWrap, !!nameError && styles.inputError]}>
          <TextInput
            value={name}
            onChangeText={(t) => { setName(t); setNameError(null); }}
            style={styles.input}
            placeholder="Document name"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Document name"
          />
          {name ? (
            <Pressable onPress={() => setName('')} hitSlop={8} accessibilityLabel="Clear name">
              <Icon name="close" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        {nameError ? <Text style={styles.error}>{nameError}</Text> : <Text style={styles.hint}>Suggested name — you can edit it.</Text>}

        <Card padded={false} style={styles.group}>
          <View style={styles.rowPad}>
            <SettingsRow label="Paper Size" value={labelOf(PAPER_OPTIONS, paperSize)} onPress={() => setSheet('paper')} showChevron />
            <View style={styles.divider} />
            <SettingsRow label="Quality" value={labelOf(QUALITY_OPTIONS, quality)} onPress={() => setSheet('quality')} showChevron />
            <View style={styles.divider} />
            <SettingsRow label="Compression" value={labelOf(COMPRESSION_OPTIONS, compression)} onPress={() => setSheet('compression')} showChevron />
            <View style={styles.divider} />
            <SettingsRow label="Password" value="Off · Coming Soon" />
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Save & Share" onPress={() => checkAndGenerate(true)} icon="share" />
        <SecondaryButton title="Save Only" onPress={() => checkAndGenerate(false)} />
      </View>

      <OptionSheet visible={sheet === 'paper'} title="Paper Size" options={PAPER_OPTIONS} selected={paperSize} onSelect={setPaperSize} onClose={() => setSheet(null)} />
      <OptionSheet visible={sheet === 'quality'} title="Quality" options={QUALITY_OPTIONS} selected={quality} onSelect={setQuality} onClose={() => setSheet(null)} />
      <OptionSheet visible={sheet === 'compression'} title="Compression" options={COMPRESSION_OPTIONS} selected={compression} onSelect={setCompression} onClose={() => setSheet(null)} />

      <LoadingOverlay visible={progress !== null} title="Generating PDF" message="Please wait while we create your PDF…" progress={progress ?? 0} />

      <ConfirmDialog
        visible={largeWarning}
        title="Large PDF warning"
        message="This document has many high-resolution pages. Creating the PDF may take longer and use more storage."
        confirmLabel="Continue"
        cancelLabel="Cancel"
        onConfirm={() => { setLargeWarning(false); generate(true); }}
        onCancel={() => setLargeWarning(false)}
      />

      <ConfirmDialog
        visible={errorDialog}
        title="Could not create PDF"
        message="Something went wrong while creating your PDF. Please try again."
        confirmLabel="Try Again"
        cancelLabel="Cancel"
        onConfirm={() => { setErrorDialog(false); generate(true); }}
        onCancel={() => setErrorDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  previewWrap: { aspectRatio: 0.78, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  label: { fontSize: typography.body, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.sm },
  inputWrap: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: radius.sm + 4, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, backgroundColor: colors.surface, gap: spacing.sm },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, fontSize: typography.body, color: colors.text },
  error: { color: colors.danger, fontSize: typography.caption },
  hint: { color: colors.textMuted, fontSize: typography.caption },
  group: { marginTop: spacing.sm },
  rowPad: { paddingHorizontal: spacing.md },
  divider: { height: 1, backgroundColor: colors.border },
  footer: { padding: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
