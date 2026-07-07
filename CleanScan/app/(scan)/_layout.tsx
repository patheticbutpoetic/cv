import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ScanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="camera" options={{ animation: 'fade' }} />
    </Stack>
  );
}
