import { invoke } from '@tauri-apps/api/core';
import { AppConfig } from '../types';

/**
 * Tauri 백엔드에서 앱 설정을 가져옵니다.
 */
export async function getConfig(): Promise<AppConfig> {
  try {
    const config = await invoke<AppConfig>('get_config');
    return config;
  } catch (error) {
    return {
      storage_path: null,
      is_onboarding_complete: false,
    };
  }
}
