import React from 'react';
import { router } from 'expo-router';
import { IdCardCapture } from '@/components/scanner/IdCardCapture';
import { useIdCardStore } from '@/store/idCardStore';

export default function IdCardBackScreen() {
  const setBack = useIdCardStore((s) => s.setBack);

  return (
    <IdCardCapture
      side="back"
      title="Scan back side"
      instruction="Now capture the other side of the card"
      captureLabel="Capture back"
      onCaptured={(page) => {
        setBack(page);
        router.replace('/(scan)/id-card/preview');
      }}
    />
  );
}
