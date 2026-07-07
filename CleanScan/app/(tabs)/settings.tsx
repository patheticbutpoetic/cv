import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/common/Icon';
import { SettingsRow } from '@/components/common/SettingsRow';
import { Card } from '@/components/common/Card';
import { OptionSheet, Option } from '@/components/common/OptionSheet';
import { useSettingsStore } from '@/store/settingsStore';
import type { ThemeMode } from '@/types/settings';
import type { PaperSize, PdfQuality, CompressionLevel } from '@/types/scanner';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';

const THEME_OPTIONS: Option<ThemeMode>[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];
const QUALITY_OPTIONS: Option<PdfQuality>[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];
const PAPER_OPTIONS: Option<PaperSize>[] = [
  { value: 'A4', label: 'A4' },
  { value: 'LETTER', label: 'Letter' },
  { value: 'LEGAL', label: 'Legal' },
];
const COMPRESSION_OPTIONS: Option<CompressionLevel>[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const labelOf = <T extends string>(opts: Option<T>[], value: T) => opts.find((o) => o.value === value)?.label ?? value;

type Sheet = 'theme' | 'quality' | 'paper' | 'compression' | null;

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettingsStore();
  const [sheet, setSheet] = useState<Sheet>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.section}>Preferences</Text>
        <Card padded={false} style={styles.group}>
          <View style={styles.rowPad}>
            <SettingsRow icon="eye" label="Theme" value={labelOf(THEME_OPTIONS, settings.theme)} onPress={() => setSheet('theme')} showChevron />
            <View style={styles.divider} />
            <SettingsRow icon="document" label="Default PDF Quality" value={labelOf(QUALITY_OPTIONS, settings.defaultQuality)} onPress={() => setSheet('quality')} showChevron />
            <View style={styles.divider} />
            <SettingsRow icon="crop" label="Default Paper Size" value={labelOf(PAPER_OPTIONS, settings.defaultPaperSize)} onPress={() => setSheet('paper')} showChevron />
            <View style={styles.divider} />
            <SettingsRow icon="compress" label="Default Compression" value={labelOf(COMPRESSION_OPTIONS, settings.defaultCompression)} onPress={() => setSheet('compression')} showChevron />
            <View style={styles.divider} />
            <SettingsRow
              icon="warning"
              label="Scan Quality Warnings"
              toggle={{ value: settings.scanQualityWarningsEnabled, onValueChange: (v) => updateSettings({ scanQualityWarningsEnabled: v }) }}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="check"
              label="Haptic Feedback"
              toggle={{ value: settings.hapticsEnabled, onValueChange: (v) => updateSettings({ hapticsEnabled: v }) }}
            />
          </View>
        </Card>

        <Text style={styles.section}>Privacy</Text>
        <Card style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Icon name="shield" size={22} color={colors.success} />
            <Text style={styles.privacyTitle}>Private by default</Text>
          </View>
          <Text style={styles.privacyBody}>
            All scans are stored locally on your device unless you choose to share or export them. No account is required.
          </Text>
        </Card>

        <Text style={styles.section}>More</Text>
        <Card padded={false} style={styles.group}>
          <View style={styles.rowPad}>
            <SettingsRow icon="star" label="Rate CleanScan" onPress={() => Alert.alert('Thanks!', 'App Store rating will open in a future update.')} showChevron />
            <View style={styles.divider} />
            <SettingsRow icon="mail" label="Send Feedback" onPress={() => Linking.openURL('mailto:feedback@cleanscan.app?subject=CleanScan%20Feedback')} showChevron />
            <View style={styles.divider} />
            <SettingsRow icon="info" label="About" value="CleanScan" onPress={() => Alert.alert('CleanScan', 'Clean scans. Perfect PDFs.\nEnglish-only, local-first document scanner.')} showChevron />
            <View style={styles.divider} />
            <SettingsRow icon="document" label="Version" value="1.0.0" />
          </View>
        </Card>
      </ScrollView>

      <OptionSheet visible={sheet === 'theme'} title="Theme" options={THEME_OPTIONS} selected={settings.theme} onSelect={(v) => updateSettings({ theme: v })} onClose={() => setSheet(null)} />
      <OptionSheet visible={sheet === 'quality'} title="Default PDF Quality" options={QUALITY_OPTIONS} selected={settings.defaultQuality} onSelect={(v) => updateSettings({ defaultQuality: v })} onClose={() => setSheet(null)} />
      <OptionSheet visible={sheet === 'paper'} title="Default Paper Size" options={PAPER_OPTIONS} selected={settings.defaultPaperSize} onSelect={(v) => updateSettings({ defaultPaperSize: v })} onClose={() => setSheet(null)} />
      <OptionSheet visible={sheet === 'compression'} title="Default Compression" options={COMPRESSION_OPTIONS} selected={settings.defaultCompression} onSelect={(v) => updateSettings({ defaultCompression: v })} onClose={() => setSheet(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: typography.titleLarge, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  section: { fontSize: typography.caption, fontWeight: fontWeight.semibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.sm },
  group: {},
  rowPad: { paddingHorizontal: spacing.md },
  divider: { height: 1, backgroundColor: colors.border },
  privacyCard: { gap: spacing.sm },
  privacyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  privacyTitle: { fontSize: typography.body, fontWeight: fontWeight.semibold, color: colors.text },
  privacyBody: { fontSize: typography.body, color: colors.textMuted, lineHeight: 22 },
});
