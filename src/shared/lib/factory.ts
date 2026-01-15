import { v4 as uuidv4 } from 'uuid';

import type { Document, Block } from '@/core/types';

export class DocumentFactory {
  static create(overrides?: Partial<Document>): Document {
    const id = overrides?.id ?? uuidv4();

    return {
      id,
      title: null,
      status: 0,
      tags: null,
      blocks: [BlockFactory.create(id)],
      ...overrides,
    };
  }
}

export class BlockFactory {
  static create(documentId: string, overrides?: Partial<Block>): Block {
    return {
      id: uuidv4(),
      documentId,
      content: null,
      orderIndex: 0,
      sourceDocumentId: null,
      indexingStatus: 0,
      ...overrides,
    };
  }
}
