import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

/** Semantic icon names mapped to Ionicons so screens use meaningful names. */
const ICON_MAP = {
  camera: 'camera-outline',
  images: 'images-outline',
  scan: 'scan-outline',
  document: 'document-text-outline',
  documents: 'documents-outline',
  home: 'home-outline',
  library: 'albums-outline',
  tools: 'construct-outline',
  settings: 'settings-outline',
  back: 'chevron-back',
  close: 'close',
  more: 'ellipsis-horizontal',
  moreVertical: 'ellipsis-vertical',
  add: 'add',
  delete: 'trash-outline',
  reorder: 'swap-vertical-outline',
  edit: 'create-outline',
  rotateLeft: 'arrow-undo-outline',
  rotateRight: 'arrow-redo-outline',
  crop: 'crop-outline',
  retake: 'refresh-outline',
  flash: 'flash-outline',
  flashOff: 'flash-off-outline',
  check: 'checkmark',
  checkCircle: 'checkmark-circle',
  warning: 'warning-outline',
  search: 'search-outline',
  star: 'star',
  starOutline: 'star-outline',
  share: 'share-outline',
  mail: 'mail-outline',
  folder: 'folder-outline',
  print: 'print-outline',
  save: 'download-outline',
  notification: 'notifications-outline',
  lock: 'lock-closed-outline',
  info: 'information-circle-outline',
  chevronRight: 'chevron-forward',
  chevronDown: 'chevron-down',
  idCard: 'card-outline',
  receipt: 'receipt-outline',
  whiteboard: 'easel-outline',
  homework: 'pencil-outline',
  merge: 'git-merge-outline',
  compress: 'contract-outline',
  signature: 'brush-outline',
  ocr: 'text-outline',
  shield: 'shield-checkmark-outline',
  eye: 'eye-outline',
} as const;

export type IconName = keyof typeof ICON_MAP;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 22, color = colors.text }: IconProps) {
  return <Ionicons name={ICON_MAP[name]} size={size} color={color} />;
}
