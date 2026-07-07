import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ToolCard } from '@/components/tools/ToolCard';
import { IconName } from '@/components/common/Icon';
import { useScanStore } from '@/store/scanStore';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface Tool {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  comingSoon?: boolean;
  onPress?: () => void;
}

export default function ToolsScreen() {
  const clearScan = useScanStore((s) => s.clearScan);

  const available: Tool[] = [
    {
      id: 'images_to_pdf',
      icon: 'images',
      title: 'Images to PDF',
      description: 'Convert images to PDF',
      onPress: () => {
        clearScan();
        router.push('/(scan)/camera?import=1');
      },
    },
    {
      id: 'ocr',
      icon: 'ocr',
      title: 'OCR Text Recognition',
      description: 'Preview extracting text from scans',
      onPress: () => router.push('/ocr'),
    },
  ];

  const comingSoon: Tool[] = [
    { id: 'merge', icon: 'merge', title: 'Merge PDFs', description: 'Combine multiple PDFs', comingSoon: true },
    { id: 'sign', icon: 'signature', title: 'Sign PDF', description: 'Add signature to your PDF', comingSoon: true },
    { id: 'compress', icon: 'compress', title: 'Compress PDF', description: 'Reduce PDF file size', comingSoon: true },
    { id: 'protect', icon: 'lock', title: 'Protect PDF', description: 'Password protect your PDF', comingSoon: true },
    { id: 'watermark', icon: 'edit', title: 'Watermark', description: 'Add watermark to PDF', comingSoon: true },
    { id: 'organize', icon: 'documents', title: 'Organize Pages', description: 'Rearrange PDF pages', comingSoon: true },
  ];

  const renderGrid = (tools: Tool[]) => (
    <View style={styles.grid}>
      {tools.map((tool) => (
        <View key={tool.id} style={styles.cell}>
          <ToolCard
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            comingSoon={tool.comingSoon}
            onPress={tool.onPress}
          />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tools</Text>
        <Text style={styles.sectionLabel}>Available</Text>
        {renderGrid(available)}
        <Text style={styles.sectionLabel}>Coming Soon</Text>
        {renderGrid(comingSoon)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  title: { fontSize: typography.titleLarge, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  sectionLabel: { fontSize: typography.subtitle, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%' },
});
