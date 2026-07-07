import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppHeader } from '@/components/common/AppHeader';
import { Icon } from '@/components/common/Icon';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

/**
 * OCR example / placeholder screen (PRD §8.13, Phase 4).
 * OCR text recognition is a Coming Soon feature — this screen previews the UI
 * without producing fake extracted text.
 */
export default function OcrScreen() {
  const [tab, setTab] = useState<'image' | 'text'>('image');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <AppHeader title="OCR Text Recognition" onBack={() => router.back()} />
      </View>

      <View style={styles.tabs}>
        {(['image', 'text'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'image' ? 'Image' : 'Text'}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Icon name="info" size={16} color={colors.primary} />
          <Text style={styles.badgeText}>Coming Soon</Text>
        </View>

        {tab === 'image' ? (
          <View style={styles.previewBox}>
            <Icon name="ocr" size={40} color={colors.textMuted} />
            <Text style={styles.previewText}>Scanned page preview</Text>
          </View>
        ) : (
          <View style={styles.previewBox}>
            <Icon name="document" size={40} color={colors.textMuted} />
            <Text style={styles.previewText}>Recognized text will appear here</Text>
          </View>
        )}

        <Text style={styles.explain}>
          Text recognition (OCR) will let you copy and export text from your scans. This tool will be added in a future
          update — CleanScan does not produce placeholder text today.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={[styles.footerBtn, styles.disabled]}>
          <Text style={styles.footerBtnText}>Copy Text</Text>
        </View>
        <View style={[styles.footerBtn, styles.footerBtnPrimary, styles.disabled]}>
          <Text style={[styles.footerBtnText, styles.footerBtnTextPrimary]}>Export Text</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: spacing.md },
  tabs: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.sm },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: typography.body, color: colors.textMuted, fontWeight: fontWeight.medium },
  tabTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  content: { padding: spacing.md, gap: spacing.md },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', backgroundColor: 'rgba(22,93,255,0.1)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill },
  badgeText: { color: colors.primary, fontSize: typography.caption, fontWeight: fontWeight.semibold },
  previewBox: { aspectRatio: 0.9, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  previewText: { color: colors.textMuted, fontSize: typography.body },
  explain: { fontSize: typography.caption, color: colors.textMuted, lineHeight: 18 },
  footer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  footerBtn: { flex: 1, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  footerBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  footerBtnText: { color: colors.text, fontWeight: fontWeight.semibold },
  footerBtnTextPrimary: { color: colors.white },
  disabled: { opacity: 0.5 },
});
