import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';
import { logger } from '@/utils/logger';

/**
 * permissionsService — centralizes camera + gallery permission requests
 * (PRD §17.1, §20.1). Never assume a permission exists.
 */
export interface PermissionResult {
  granted: boolean;
  /** True when the user permanently denied and must go to Settings. */
  blocked: boolean;
}

export async function requestCameraPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
    return { granted: status === 'granted', blocked: status !== 'granted' && !canAskAgain };
  } catch (error) {
    logger.error('permissions', 'camera request failed', error);
    return { granted: false, blocked: false };
  }
}

export async function getCameraPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
  return { granted: status === 'granted', blocked: status !== 'granted' && !canAskAgain };
}

export async function requestGalleryPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return { granted: status === 'granted', blocked: status !== 'granted' && !canAskAgain };
  } catch (error) {
    logger.error('permissions', 'gallery request failed', error);
    return { granted: false, blocked: false };
  }
}

/** Opens the OS settings app so the user can enable a blocked permission. */
export async function openAppSettings(): Promise<void> {
  await Linking.openSettings();
}
