import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { PermissionCard } from '@/components/common/PermissionCard';
import { requestCameraPermission, openAppSettings } from '@/services/permissionsService';
import { analyticsService } from '@/services/analyticsService';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export default function CameraPermissionScreen() {
  const [blocked, setBlocked] = useState(false);

  const allow = async () => {
    const result = await requestCameraPermission();
    if (result.granted) {
      analyticsService.track('camera_permission_granted');
      router.replace('/(scan)/camera');
    } else {
      analyticsService.track('camera_permission_denied');
      setBlocked(result.blocked);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <PermissionCard
          icon="camera"
          title="Camera Permission"
          body="CleanScan needs access to your camera to take photos of documents."
          allowLabel="Allow Camera Access"
          onAllow={allow}
          onNotNow={() => router.back()}
          blocked={blocked}
          onOpenSettings={openAppSettings}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
});
