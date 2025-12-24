import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export async function selectStorageFolder(): Promise<void> {
  try {
    const selected: string | null = await open({
      directory: true,
      multiple: false,
      title: '메모 저장 폴더 선택',
    });

    if (selected) {
      const codexPath: string | null = await invoke<string>(
        'select_storage_folder',
        {
          selectedPath: selected,
        },
      );
      console.log('codexPath', codexPath);

      if (codexPath) {
        await invoke('save_config', {
          config: {
            storage_path: codexPath,
            is_onboarding_complete: true,
          },
        });

        console.log('config saved');
      }
    }
  } catch (error) {
    console.error('Failed to select storage folder:', error);
    throw error;
  }
}
