import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { IdCardCapture } from '@/components/scanner/IdCardCapture';
import { useIdCardStore } from '@/store/idCardStore';
import { analyticsService } from '@/services/analyticsService';

export default function IdCardFrontScreen() {
  const setFront = useIdCardStore((s) => s.setFront);

  useEffect(() => {
    analyticsService.track('id_card_mode_started');
  }, []);

  return (
    <IdCardCapture
      side="front"
      title="Scan front side"
      instruction="Place the card inside the frame"
      captureLabel="Capture front"
      onCaptured={(page) => {
        setFront(page);
        router.replace('/(scan)/id-card/back');
      }}
    />
  );
}
