import { invoke } from '@tauri-apps/api/core';

import { AppConfig } from '../types';

export async function getConfig(): Promise<AppConfig> {
  try {
    const config = await invoke<AppConfig>('get_config');
    return config;
  } catch (error) {
    console.error('[ConfigApi] Failed to get config:', error);

    return {
      storage_path: null,
      is_onboarding_complete: false,
    };
  }
}
