import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@/components/common/Icon';
import type { ScanQualityResult, ScanQualityLabel } from '@/types/scanner';
import { colors } from '@/constants/colors';
import { typography, fontWeight } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/layout';

const LABEL_TEXT: Record<ScanQualityLabel, string> = {
  excellent: 'Excellent',
  good: 'Good',
  needs_review: 'Needs Review',
  poor: 'Poor',
};

function toneFor(label: ScanQualityLabel): string {
  switch (label) {
    case 'excellent':
    case 'good':
      return colors.success;
    case 'needs_review':
      return colors.warning;
    case 'poor':
    default:
      return colors.danger;
  }
}

interface QualityScoreCardProps {
  result: ScanQualityResult;
}

/** Small quality card shown on Crop/Review after capture (PRD §43.2). */
export function QualityScoreCard({ result }: QualityScoreCardProps) {
  const tone = toneFor(result.label);
  const good = result.label === 'excellent' || result.label === 'good';

  return (
    <View style={styles.card} accessibilityLabel={`Scan quality ${result.score} out of 100, ${LABEL_TEXT[result.label]}`}>
      <View style={styles.header}>
        <View style={[styles.scorePill, { backgroundColor: tone }]}>
          <Text style={styles.scoreText}>{result.score}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Scan Quality</Text>
          <Text style={[styles.label, { color: tone }]}>{LABEL_TEXT[result.label]}</Text>
        </View>
        <Icon name={good ? 'checkCircle' : 'warning'} size={24} color={tone} />
      </View>

      {result.suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {result.suggestions.map((s) => (
            <View key={s} style={styles.suggestionRow}>
              <Icon name="info" size={14} color={colors.textMuted} />
              <Text style={styles.suggestionText}>{s}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.allGood}>Document is readable and well framed.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scorePill: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  scoreText: { color: colors.white, fontSize: typography.subtitle, fontWeight: fontWeight.bold },
  headerText: { flex: 1 },
  title: { fontSize: typography.body, fontWeight: fontWeight.semibold, color: colors.text },
  label: { fontSize: typography.caption, fontWeight: fontWeight.semibold, marginTop: 2 },
  suggestions: { marginTop: spacing.sm, gap: spacing.xs },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  suggestionText: { fontSize: typography.caption, color: colors.textMuted, flex: 1 },
  allGood: { marginTop: spacing.sm, fontSize: typography.caption, color: colors.textMuted },
});
