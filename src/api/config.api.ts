import { AppConfig } from '@/types/config';
import { Response } from '@/types/response';
import ResponseHandler from '@/utils/responseHandler';

import { invokeTauri } from './tauri-client';

export async function getConfig(): Promise<AppConfig> {
  const response = await invokeTauri<Response<AppConfig>>('load_config');
  return ResponseHandler.handle<AppConfig>(response);
}

export async function saveConfig(config: Partial<AppConfig>): Promise<void> {
  const currentConfig = await getConfig();

  const mergedConfig = { ...currentConfig, ...config };
  const response = await invokeTauri<Response<void>>('save_config', {
    config: mergedConfig,
  });

  return ResponseHandler.handle<void>(response);
}
