import { invokeTauri } from './client';

import type { ApiResponse, Document } from '../../core/types';

export const documentApi = {
  async getDocument(documentId: string): Promise<ApiResponse<Document>> {
    return invokeTauri<Document>('get_document', { documentId });
  },

  async saveDocument(document: Document): Promise<ApiResponse<void>> {
    return invokeTauri<void>('save_document', { document });
  },

  async deleteDocument(documentId: string): Promise<ApiResponse<boolean>> {
    return invokeTauri<boolean>('delete_document', { documentId });
  },

  async deleteBlock(blockId: string): Promise<ApiResponse<void>> {
    return invokeTauri<void>('delete_block', { blockId });
  },

  async listDocuments(): Promise<ApiResponse<Document[]>> {
    return invokeTauri<Document[]>('list_documents');
  },
};
