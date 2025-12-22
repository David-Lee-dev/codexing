import { invoke } from '@tauri-apps/api/core';
import { AppConfig } from '../types';

/**
 * Fetches the app configuration from the backend.
 */
export async function getConfig(): Promise<AppConfig> {
  try {
    return await invoke<AppConfig>('get_config');
  } catch (error) {
    console.error('Failed to fetch config:', error);
    return {
      storage_path: null,
      is_onboarding_complete: false,
    };
  }
}
