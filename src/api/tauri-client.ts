import { invoke } from '@tauri-apps/api/core';

export async function invokeTauri<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    console.warn(`[TauriClient] Failed to invoke ${command}:`, error);
    throw error;
  }
}
