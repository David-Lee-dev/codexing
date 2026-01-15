/**
 * Tauri IPC Client
 *
 * Tauri IPC 통신을 위한 기본 클라이언트입니다.
 * - 재시도 로직
 * - 에러 처리
 * - 타입 안전성
 */

import { invoke } from '@tauri-apps/api/core';

import type { ApiResponse } from '../../core/types';

interface InvokeOptions {
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_OPTIONS: InvokeOptions = {
  retries: 0,
  retryDelay: 1000,
};

export async function invokeTauri<T>(
  command: string,
  args?: Record<string, unknown>,
  options: InvokeOptions = DEFAULT_OPTIONS,
): Promise<ApiResponse<T>> {
  const { retries = 0, retryDelay = 1000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await invoke<ApiResponse<T>>(command, args);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        await delay(retryDelay * (attempt + 1));
        continue;
      }
    }
  }

  return {
    success: false,
    code: 500,
    data: null,
    message: lastError?.message ?? 'Unknown error occurred',
  };
}

// Utility
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
