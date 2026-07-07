import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Icon } from '@/components/common/Icon';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentActionSheet, DocumentAction } from '@/components/documents/DocumentActionSheet';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { RenameDialog } from '@/components/documents/RenameDialog';
import { useDocumentStore } from '@/store/documentStore';
import type { Document } from '@/types/document';
import { filterByName } from '@/utils/search';
import { sharePdf } from '@/services/shareService';
import { analyticsService } from '@/services/analyticsService';
import { useHaptics } from '@/hooks/useHaptics';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

type LibraryTab = 'all' | 'recent' | 'favorites' | 'folders';
const TABS: { id: LibraryTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recent' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'folders', label: 'Folders' },
];

export default function LibraryScreen() {
  const { documents, searchQuery, setSearchQuery, deleteDocument, toggleFavorite } = useDocumentStore();
  const haptics = useHaptics();
  const [tab, setTab] = useState<LibraryTab>('all');
  const [actionDoc, setActionDoc] = useState<Document | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  const [renameDoc, setRenameDoc] = useState<Document | null>(null);

  const filtered = useMemo(() => {
    let list = filterByName(documents, searchQuery);
    if (tab === 'favorites') list = list.filter((d) => d.isFavorite);
    if (tab === 'recent') list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
    if (searchQuery.trim()) analyticsService.track('library_search_used');
    return list;
  }, [documents, searchQuery, tab]);

  const handleAction = async (action: DocumentAction) => {
    const doc = actionDoc;
    setActionDoc(null);
    if (!doc) return;
    switch (action) {
      case 'share':
        await sharePdf(doc.pdfUri);
        break;
      case 'rename':
        setRenameDoc(doc);
        break;
      case 'favorite':
        await toggleFavorite(doc.id);
        break;
      case 'delete':
        setDeleteDoc(doc);
        break;
      case 'move':
      case 'duplicate':
        Alert.alert('Coming Soon', 'This action will be added in a future update.');
        break;
    }
  };

  const confirmDelete = async () => {
    if (!deleteDoc) return;
    await deleteDocument(deleteDoc.id);
    analyticsService.track('document_deleted');
    haptics.success();
    setDeleteDoc(null);
  };

  const isFoldersTab = tab === 'folders';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
      </View>

      <View style={styles.searchBar}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search documents"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Search documents"
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8} accessibilityLabel="Clear search">
            <Icon name="close" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.id }}
            style={[styles.tab, tab === t.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {isFoldersTab ? (
        <EmptyState icon="folder" title="Folders coming soon" message="Organizing documents into folders will be added in a future update." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <DocumentCard
              document={item}
              onPress={() => router.push({ pathname: '/(pdf)/preview', params: { id: item.id } })}
              onMore={() => setActionDoc(item)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          ListEmptyComponent={
            searchQuery.trim() ? (
              <EmptyState icon="search" title="No results found" message="Try a different name or clear your search." />
            ) : (
              <EmptyState
                icon="document"
                title="No documents yet"
                message="Scan your first document or import images to create a PDF."
                actionLabel="Start Scanning"
                onAction={() => router.push('/(scan)/mode-select')}
              />
            )
          }
        />
      )}

      <DocumentActionSheet
        visible={!!actionDoc}
        document={actionDoc}
        onClose={() => setActionDoc(null)}
        onAction={handleAction}
      />

      <ConfirmDialog
        visible={!!deleteDoc}
        title="Delete document?"
        message="This will remove the PDF from your device."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDoc(null)}
      />

      <RenameDialog
        visible={!!renameDoc}
        document={renameDoc}
        onClose={() => setRenameDoc(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  title: { fontSize: typography.titleLarge, fontWeight: fontWeight.bold, color: colors.text },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.md, marginTop: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: 48,
  },
  searchInput: { flex: 1, fontSize: typography.body, color: colors.text },
  tabs: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.md },
  tab: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: typography.caption, color: colors.textMuted, fontWeight: fontWeight.medium },
  tabTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
});
