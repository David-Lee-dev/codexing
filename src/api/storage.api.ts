import { open } from '@tauri-apps/plugin-dialog';

import ResponseHandler from '@/utils/responseHandler';
import { Response } from '@/types/response';

import { invokeTauri } from './tauri-client';

export async function selectStorageFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: '메모 저장 폴더 선택',
  });

  if (!selected) {
    return null;
  }

  const response = await invokeTauri<Response<string>>('select_storage', {
    selectedPath: selected,
  });

  return ResponseHandler.handle<string>(response);
}
