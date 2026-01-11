export interface Block {
  id: string;
  documentId: string;
  type: string | null;
  content: string | null;
  orderIndex: number;
  sourceDocumentId: string | null;
  indexingStatus: string;
  createdAt?: string;
  updatedAt?: string;
}
