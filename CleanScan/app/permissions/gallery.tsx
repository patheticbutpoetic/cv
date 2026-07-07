import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { PermissionCard } from '@/components/common/PermissionCard';
import { requestGalleryPermission, openAppSettings } from '@/services/permissionsService';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export default function GalleryPermissionScreen() {
  const [blocked, setBlocked] = useState(false);

  const allow = async () => {
    const result = await requestGalleryPermission();
    if (result.granted) {
      router.replace('/(scan)/camera?import=1');
    } else {
      setBlocked(result.blocked);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <PermissionCard
          icon="images"
          title="Gallery Permission"
          body="CleanScan needs access to your photos to import images."
          allowLabel="Allow Gallery Access"
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
