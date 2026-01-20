import { invokeTauri } from './client';

import type { ApiResponse } from '@/core/types';

export interface GenerateTagsRequest {
  title: string;
  content: string;
}

export const aiApi = {
  async generateTags(
    request: GenerateTagsRequest,
  ): Promise<ApiResponse<string[]>> {
    return invokeTauri<string[]>('generate_tags', { request });
  },
};
