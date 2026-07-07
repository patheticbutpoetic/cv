import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { Icon } from '@/components/common/Icon';
import { SharePresetButton } from '@/components/share/SharePresetButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useDocumentStore } from '@/store/documentStore';
import { getAvailablePresets, runPreset, SharePreset } from '@/services/sharePresetService';
import { sharePdf } from '@/services/shareService';
import { analyticsService } from '@/services/analyticsService';
import { formatFileSize } from '@/utils/fileSize';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

/** PDF Ready screen with one-tap share presets (PRD §48, §56.4). */
export default function PdfReadyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const documents = useDocumentStore((s) => s.documents);
  const document = useMemo(() => documents.find((d) => d.id === id), [documents, id]);
  const [presets, setPresets] = useState<SharePreset[]>([]);

  useEffect(() => {
    getAvailablePresets().then(setPresets).catch(() => setPresets([]));
  }, []);

  const onPreset = async (preset: SharePreset) => {
    if (!document) return;
    if (preset.id === 'open_library') {
      router.dismissAll();
      router.replace('/(tabs)/library');
      return;
    }
    const handled = await runPreset(preset.id, document.pdfUri);
    if (preset.id === 'share' || preset.id === 'email' || preset.id === 'save_to_files') {
      if (handled) analyticsService.track('pdf_shared');
    }
  };

  const goHome = () => {
    router.dismissAll();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Icon name="checkCircle" size={44} color={colors.success} />
        </View>
        <Text style={styles.title}>Your PDF is ready</Text>
        {document ? (
          <Text style={styles.meta}>
            {document.name} · {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'} · {formatFileSize(document.fileSizeBytes)}
          </Text>
        ) : null}

        <View style={styles.presetRow}>
          {presets.map((preset) => (
            <SharePresetButton
              key={preset.id}
              icon={preset.icon as never}
              label={preset.label}
              primary={preset.id === 'share'}
              onPress={() => onPreset(preset)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <SecondaryButton title="Done" onPress={goHome} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  successIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(34,197,94,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { fontSize: typography.title, fontWeight: fontWeight.bold, color: colors.text },
  meta: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  footer: { padding: spacing.md },
});
