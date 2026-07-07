import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function PdfLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
