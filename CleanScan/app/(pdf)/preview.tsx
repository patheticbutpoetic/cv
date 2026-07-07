import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/components/common/AppHeader';
import { IconButton } from '@/components/common/IconButton';
import { Icon } from '@/components/common/Icon';
import { EmptyState } from '@/components/common/EmptyState';
import { DocumentActionSheet, DocumentAction } from '@/components/documents/DocumentActionSheet';
import { RenameDialog } from '@/components/documents/RenameDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDocumentStore } from '@/store/documentStore';
import { sharePdf, printPdf, openPdf } from '@/services/shareService';
import { markOpened } from '@/services/documentLibraryService';
import { analyticsService } from '@/services/analyticsService';
import { formatFileSize } from '@/utils/fileSize';
import { formatShortDate } from '@/utils/dateFormat';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

export default function PdfPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { documents, toggleFavorite } = useDocumentStore();
  const document = useMemo(() => documents.find((d) => d.id === id), [documents, id]);

  const [actionOpen, setActionOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);

  useEffect(() => {
    if (id) markOpened(id).catch(() => {});
  }, [id]);

  if (!document) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerWrap}><AppHeader title="Document" onBack={() => router.back()} /></View>
        <EmptyState icon="document" title="Document not found" message="We could not find this PDF. It may have been moved or deleted." />
      </SafeAreaView>
    );
  }

  const share = async () => {
    await sharePdf(document.pdfUri);
    analyticsService.track('pdf_shared');
  };

  const handleAction = async (action: DocumentAction) => {
    setActionOpen(false);
    switch (action) {
      case 'share': return share();
      case 'rename': return setRenameOpen(true);
      case 'favorite': return toggleFavorite(document.id);
      case 'delete': return setDeleteOpen(true);
      default: break;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <AppHeader
          title={document.name}
          subtitle={`${document.pageCount} ${document.pageCount === 1 ? 'page' : 'pages'} · ${formatFileSize(document.fileSizeBytes)}`}
          onBack={() => router.back()}
          rightActions={[{ icon: 'more', onPress: () => setActionOpen(true), accessibilityLabel: 'More actions' }]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageView}>
          {document.thumbnailUri ? (
            <Image source={{ uri: document.thumbnailUri }} style={styles.pageImg} resizeMode="contain" />
          ) : (
            <Icon name="document" size={48} color={colors.textMuted} />
          )}
        </View>
        <Text style={styles.meta}>Created {formatShortDate(document.createdAt)}</Text>
        <Text style={styles.note}>Open the PDF to view every page in your device's PDF viewer.</Text>
      </ScrollView>

      <View style={styles.actions}>
        <IconButton icon="share" label="Share" accessibilityLabel="Share PDF" onPress={share} />
        <IconButton icon="eye" label="Open" accessibilityLabel="Open PDF" onPress={() => openPdf(document.pdfUri)} />
        <IconButton icon="print" label="Print" accessibilityLabel="Print PDF" onPress={() => printPdf(document.pdfUri)} />
        <IconButton icon="more" label="More" accessibilityLabel="More actions" onPress={() => setActionOpen(true)} />
      </View>

      <DocumentActionSheet visible={actionOpen} document={document} onClose={() => setActionOpen(false)} onAction={handleAction} />
      <RenameDialog visible={renameOpen} document={document} onClose={() => setRenameOpen(false)} />
      <ConfirmDialog
        visible={deleteOpen}
        title="Delete document?"
        message="This will remove the PDF from your device."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => { await deleteDocument(document.id); setDeleteOpen(false); router.back(); }}
        onCancel={() => setDeleteOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  content: { padding: spacing.md, gap: spacing.sm, alignItems: 'center', paddingBottom: spacing.xl },
  pageView: { width: '100%', aspectRatio: 0.72, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pageImg: { width: '100%', height: '100%' },
  meta: { fontSize: typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  note: { fontSize: typography.caption, color: colors.textMuted, textAlign: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
