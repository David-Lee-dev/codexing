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
  type: BlockType | null;
  content: string | null;
  orderIndex: number;
  sourceDocumentId: string | null;
  indexingStatus: IndexingStatus;
}

// Document Status
export type DocumentStatus = 'draft' | 'published' | 'archived';

// Block Type
export type BlockType =
  | 'text'
  | 'heading'
  | 'list'
  | 'code'
  | 'quote'
  | 'image';

// Indexing Status
export type IndexingStatus = 'pending' | 'indexed' | 'failed';

// Cursor Position
export interface CursorPosition {
  line: number;
  offset: number;
}
