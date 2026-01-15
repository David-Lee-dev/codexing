export interface Document {
  id: string;
  title: string | null;
  status: DocumentStatus;
  tags: string[] | null;
  blocks: Block[];
}

export interface Block {
  id: string;
  documentId: string;
  content: string | null;
  orderIndex: number;
  sourceDocumentId: string | null;
  indexingStatus: IndexingStatus;
}

// Document Status: 0 = FLEETING, 1 = PERMANENT, 99 = ARCHIVED
export type DocumentStatus = number;

// Indexing Status: 0 = PENDING, 1 = INDEXED, 2 = FAILED
export type IndexingStatus = number;

// Cursor Position
export interface CursorPosition {
  line: number;
  offset: number;
}
