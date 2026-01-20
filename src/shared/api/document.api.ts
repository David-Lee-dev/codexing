import { invokeTauri } from './client';

import type {
  ApiResponse,
  Document,
  DocumentGraphInfo,
  GraphData,
  SearchResult,
} from '../../core/types';

export const documentApi = {
  async getDocument(documentId: string): Promise<ApiResponse<Document>> {
    return invokeTauri<Document>('get_document', { documentId });
  },

  async saveDocument(
    document: Document,
  ): Promise<ApiResponse<DocumentGraphInfo>> {
    return invokeTauri<DocumentGraphInfo>('save_document', { document });
  },

  async deleteDocument(documentId: string): Promise<ApiResponse<string>> {
    return invokeTauri<string>('delete_document', { documentId });
  },

  async deleteBlock(blockId: string): Promise<ApiResponse<void>> {
    return invokeTauri<void>('delete_block', { blockId });
  },

  async listDocuments(): Promise<ApiResponse<Document[]>> {
    return invokeTauri<Document[]>('retrieve_document', { page: 1 });
  },

  async searchDocuments(query: string): Promise<ApiResponse<SearchResult[]>> {
    return invokeTauri<SearchResult[]>('search_documents', { query });
  },

  async getGraphData(): Promise<ApiResponse<GraphData>> {
    return invokeTauri<GraphData>('get_graph_data');
  },
};
