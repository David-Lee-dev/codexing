import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

/**
 * Opens a folder picker dialog and saves the selected path as the storage folder.
 * Automatically creates a 'codex' subdirectory within the selected folder.
 */
export async function selectStorageFolder(): Promise<string | null> {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: '메모 저장 폴더 선택',
    });

    if (selected && typeof selected === 'string') {
      return await invoke<string>('select_storage_folder', {
        selectedPath: selected,
      });
    }
    return null;
  } catch (error) {
    console.error('Failed to select storage folder:', error);
    throw error;
  }
}
