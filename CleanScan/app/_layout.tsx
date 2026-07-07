import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ensureAppDirectories } from '@/services/localStorageService';
import { getDatabase } from '@/db/database';
import { cleanStaleTempFiles } from '@/services/tempFileCleanupService';
import { useSettingsStore } from '@/store/settingsStore';
import { useDocumentStore } from '@/store/documentStore';
import { analyticsService } from '@/services/analyticsService';
import { logger } from '@/utils/logger';
import { colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadDocuments = useDocumentStore((s) => s.loadDocuments);

  useEffect(() => {
    (async () => {
      try {
        await ensureAppDirectories();
        await getDatabase();
        await loadSettings();
        await loadDocuments();
        // Startup housekeeping: remove temp files older than 24h (PRD §50.3).
        cleanStaleTempFiles().catch(() => {});
        analyticsService.track('app_opened');
      } catch (error) {
        logger.error('app', 'initialization failed', error);
      } finally {
        setReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, [loadSettings, loadDocuments]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(scan)" />
          <Stack.Screen name="(pdf)" />
          <Stack.Screen name="permissions" options={{ presentation: 'modal' }} />
          <Stack.Screen name="onboarding" options={{ presentation: 'modal' }} />
          <Stack.Screen name="ocr" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
