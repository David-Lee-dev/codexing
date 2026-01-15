import { open } from '@tauri-apps/plugin-dialog';

import { AppConfig, ApiResponse, DatabaseHealth } from '@/core/types';

import { invokeTauri } from './client';

export const configApi = {
  async loadConfig(): Promise<ApiResponse<AppConfig>> {
    return invokeTauri<AppConfig>('load_config');
  },

  async saveConfig(
    config: Partial<AppConfig>,
  ): Promise<ApiResponse<AppConfig>> {
    return invokeTauri<AppConfig>('save_config', { config });
  },

  async selectStorage(): Promise<ApiResponse<string>> {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: 'Select Storage Location',
    });

    if (!selectedPath) {
      return {
        success: false,
        code: 400,
        message: 'Storage location selection cancelled.',
        data: null,
      };
    }

    return invokeTauri<string>('select_storage', {
      selectedPath: selectedPath,
    });
  },

  async initDatabase(): Promise<ApiResponse<void>> {
    return invokeTauri<void>('init_database');
  },

  async loadDatabase(): Promise<ApiResponse<DatabaseHealth>> {
    return invokeTauri<DatabaseHealth>('load_database');
  },
};
