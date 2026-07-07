import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { router } from 'expo-router';

import { AppHeader } from '@/components/common/AppHeader';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { PageThumbnail } from '@/components/scanner/PageThumbnail';
import { Icon } from '@/components/common/Icon';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { useScanStore } from '@/store/scanStore';
import type { DocumentPage } from '@/types/page';
import { analyticsService } from '@/services/analyticsService';
import { useHaptics } from '@/hooks/useHaptics';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

export default function BatchPagesScreen() {
  const { currentPages, removePage, reorderPages, setActivePage } = useScanStore();
  const setStorePages = useScanStore.setState;
  const haptics = useHaptics();

  const [reorderMode, setReorderMode] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const selectionMode = selection.size > 0;

  const toggleSelect = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const editPage = (page: DocumentPage) => {
    setActivePage(page.id);
    router.push({ pathname: '/(scan)/crop-review', params: { pageId: page.id } });
  };

  const deleteSelected = () => {
    selection.forEach((id) => removePage(id));
    analyticsService.track('page_deleted', { page_count: selection.size });
    haptics.success();
    setSelection(new Set());
    setConfirmDelete(false);
  };

  const createPdf = () => {
    if (currentPages.length === 0) {
      Alert.alert('No pages', 'Add at least one page before creating a PDF.');
      return;
    }
    router.push('/(scan)/export');
  };

  const addPage = () => router.push('/(scan)/camera?batch=1');

  const renderReorderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<DocumentPage>) => {
    const idx = getIndex() ?? 0;
    return (
      <Pressable
        onLongPress={drag}
        delayLongPress={120}
        style={[styles.reorderRow, isActive && styles.reorderActive]}
        accessibilityLabel={`Page ${idx + 1}, hold to drag`}
      >
        <Image source={{ uri: item.thumbnailUri ?? item.workingUri }} style={styles.reorderThumb} resizeMode="cover" />
        <Text style={styles.reorderIndex}>Page {idx + 1}</Text>
        <Icon name="reorder" size={22} color={colors.textMuted} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <AppHeader
          title={selectionMode ? `${selection.size} selected` : 'New Document'}
          subtitle={selectionMode ? undefined : `${currentPages.length} ${currentPages.length === 1 ? 'page' : 'pages'}`}
          onBack={() => (reorderMode ? setReorderMode(false) : router.back())}
          rightActions={
            selectionMode
              ? [{ icon: 'delete', onPress: () => setConfirmDelete(true), accessibilityLabel: 'Delete selected pages' }]
              : currentPages.length > 1
              ? [{ icon: reorderMode ? 'check' : 'reorder', onPress: () => setReorderMode((v) => !v), accessibilityLabel: 'Reorder pages' }]
              : []
          }
        />
      </View>

      {currentPages.length === 0 ? (
        <EmptyState
          icon="document"
          title="No pages yet"
          message="Add a page from the camera or your gallery to start building your PDF."
          actionLabel="Add Page"
          onAction={addPage}
        />
      ) : reorderMode ? (
        <DraggableFlatList
          data={currentPages}
          keyExtractor={(item) => item.id}
          onDragEnd={({ from, to }) => {
            reorderPages(from, to);
            analyticsService.track('page_reordered');
            haptics.light();
          }}
          renderItem={renderReorderItem}
          contentContainerStyle={styles.reorderList}
        />
      ) : (
        <FlatList
          data={currentPages}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={styles.cell}>
              <PageThumbnail
                page={item}
                index={index}
                selected={selection.has(item.id)}
                selectionMode={selectionMode}
                onPress={() => (selectionMode ? toggleSelect(item.id) : editPage(item))}
                onLongPress={() => toggleSelect(item.id)}
                onMore={() => editPage(item)}
              />
            </View>
          )}
          ListFooterComponent={
            <Pressable onPress={addPage} style={styles.addCard} accessibilityLabel="Add page">
              <Icon name="add" size={28} color={colors.primary} />
              <Text style={styles.addText}>Add Page</Text>
            </Pressable>
          }
        />
      )}

      {!reorderMode ? (
        <View style={styles.footer}>
          <PrimaryButton title="Create PDF" onPress={createPdf} icon="document" disabled={currentPages.length === 0} />
        </View>
      ) : null}

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete pages?"
        message={`This will remove ${selection.size} ${selection.size === 1 ? 'page' : 'pages'} from this document.`}
        confirmLabel="Delete"
        destructive
        onConfirm={deleteSelected}
        onCancel={() => setConfirmDelete(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  grid: { padding: spacing.md, paddingBottom: spacing.xxl },
  column: { gap: spacing.sm, marginBottom: spacing.sm },
  cell: { flex: 1 / 3 },
  addCard: {
    marginTop: spacing.sm, height: 120, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed',
    borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.surface,
  },
  addText: { color: colors.primary, fontSize: typography.caption, fontWeight: fontWeight.semibold },
  reorderList: { padding: spacing.md, gap: spacing.sm },
  reorderRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, marginBottom: spacing.sm,
  },
  reorderActive: { borderColor: colors.primary, ...{ shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 } },
  reorderThumb: { width: 44, height: 56, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted },
  reorderIndex: { flex: 1, fontSize: typography.body, color: colors.text, fontWeight: fontWeight.medium },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
