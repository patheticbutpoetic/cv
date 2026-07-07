import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import type { CropRect } from '@/types/scanner';
import { colors } from '@/constants/colors';

interface CropOverlayProps {
  /** Displayed image pixel dimensions, for mapping display → source pixels. */
  imageWidth: number;
  imageHeight: number;
  onChange: (rect: CropRect) => void;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const HANDLE = 28;
const MIN_SIZE = 60;

/**
 * Manual rectangle crop overlay (PRD §8.5, Phase 1). Four draggable corners
 * over the displayed image; emits a CropRect in source-image pixel space.
 */
export function CropOverlay({ imageWidth, imageHeight, onChange }: CropOverlayProps) {
  const [layout, setLayout] = useState<Box | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const boxRef = useRef<Box | null>(null);

  const emit = (next: Box, container: Box) => {
    const scaleX = imageWidth / container.w;
    const scaleY = imageHeight / container.h;
    onChange({
      originX: Math.round(next.x * scaleX),
      originY: Math.round(next.y * scaleY),
      width: Math.round(next.w * scaleX),
      height: Math.round(next.h * scaleY),
    });
  };

  const onImageLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const container = { x: 0, y: 0, w: width, h: height };
    const initial = {
      x: width * 0.08,
      y: height * 0.06,
      w: width * 0.84,
      h: height * 0.88,
    };
    setLayout(container);
    setBox(initial);
    boxRef.current = initial;
  };

  const makeCornerResponder = (corner: 'tl' | 'tr' | 'bl' | 'br') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gesture) => {
        const container = layout;
        const current = boxRef.current;
        if (!container || !current) return;
        let { x, y, w, h } = current;
        const { dx, dy } = gesture;

        if (corner === 'tl') {
          const nx = Math.min(Math.max(0, x + dx), x + w - MIN_SIZE);
          const ny = Math.min(Math.max(0, y + dy), y + h - MIN_SIZE);
          w = w + (x - nx);
          h = h + (y - ny);
          x = nx;
          y = ny;
        } else if (corner === 'tr') {
          const ny = Math.min(Math.max(0, y + dy), y + h - MIN_SIZE);
          h = h + (y - ny);
          y = ny;
          w = Math.min(Math.max(MIN_SIZE, w + dx), container.w - x);
        } else if (corner === 'bl') {
          const nx = Math.min(Math.max(0, x + dx), x + w - MIN_SIZE);
          w = w + (x - nx);
          x = nx;
          h = Math.min(Math.max(MIN_SIZE, h + dy), container.h - y);
        } else {
          w = Math.min(Math.max(MIN_SIZE, w + dx), container.w - x);
          h = Math.min(Math.max(MIN_SIZE, h + dy), container.h - y);
        }
        setBox({ x, y, w, h });
      },
      onPanResponderRelease: () => {
        const container = layout;
        if (box && container) {
          boxRef.current = box;
          emit(box, container);
        }
      },
    });

  const corners = {
    tl: useRef(makeCornerResponder('tl')).current,
    tr: useRef(makeCornerResponder('tr')).current,
    bl: useRef(makeCornerResponder('bl')).current,
    br: useRef(makeCornerResponder('br')).current,
  };

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onImageLayout} pointerEvents="box-none">
      {box ? (
        <>
          <View style={[styles.rect, { left: box.x, top: box.y, width: box.w, height: box.h }]} pointerEvents="none" />
          <View style={[styles.handle, { left: box.x - HANDLE / 2, top: box.y - HANDLE / 2 }]} {...corners.tl.panHandlers} />
          <View style={[styles.handle, { left: box.x + box.w - HANDLE / 2, top: box.y - HANDLE / 2 }]} {...corners.tr.panHandlers} />
          <View style={[styles.handle, { left: box.x - HANDLE / 2, top: box.y + box.h - HANDLE / 2 }]} {...corners.bl.panHandlers} />
          <View style={[styles.handle, { left: box.x + box.w - HANDLE / 2, top: box.y + box.h - HANDLE / 2 }]} {...corners.br.panHandlers} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rect: { position: 'absolute', borderWidth: 2, borderColor: colors.primary, backgroundColor: 'rgba(22,93,255,0.08)' },
  handle: {
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primary,
  },
});
