import { BlockFactory } from '@/shared/lib/factory';

import type { Document, Block } from '@/core/types';
import type { StateCreator } from 'zustand';

// ============================================
// Document Slice State
// ============================================

const INFINITY_POSITION = Number.MAX_SAFE_INTEGER;

export interface DocumentSliceState {
  document: Document | null;
  blockInEditing: Block | null;
  cursorOffset: number;
}

export interface DocumentSliceActions {
  // Document Actions
  setDocument: (document: Document | null) => void;
  addNewBlock: (eventTriggeredBlock: Block) => void;
  popBlock: (eventTriggeredBlock: Block) => void;
  setBlockInEditing: (block: Block) => void;
  setCursorOffset: (cursorOffset: number) => void;
  switchToPreviousBlock: (
    eventTriggeredBlock: Block,
    cursorOffset: number,
  ) => void;
  switchToNextBlock: (eventTriggeredBlock: Block, cursorOffset: number) => void;
  updateBlockContent: (block: Block, content: string) => void;
}

export type DocumentSlice = DocumentSliceState & DocumentSliceActions;

// ============================================
// Initial State
// ============================================

const initialDocumentState: DocumentSliceState = {
  document: null,
  blockInEditing: null,
  cursorOffset: 0,
};

// ============================================
// Slice Creator
// ============================================

export const createDocumentSlice: StateCreator<
  DocumentSlice,
  [],
  [],
  DocumentSlice
> = (set, get) => ({
  ...initialDocumentState,

  // ============================================
  // Document Actions
  // ============================================

  setDocument: (document: Document | null) => {
    set({ document });
  },
  setBlockInEditing: (block: Block) => {
    set({ blockInEditing: block });
  },
  setCursorOffset: (cursorOffset: number) => {
    set({ cursorOffset: cursorOffset });
  },
  addNewBlock: (eventTriggeredBlock: Block) => {
    const document = get().document;

    if (!document) return;

    const blocks = document.blocks;
    const newBlock = BlockFactory.create(document.id);
    const eventTriggeredBlockIndex = blocks.findIndex(
      (b) => b.id === eventTriggeredBlock.id,
    );
    if (blocks.length - 1 === eventTriggeredBlockIndex) {
      newBlock.orderIndex = eventTriggeredBlock.orderIndex + 1;
    } else {
      const nextBlock = blocks[eventTriggeredBlockIndex + 1];

      newBlock.orderIndex =
        eventTriggeredBlock.orderIndex +
        (eventTriggeredBlock.orderIndex + nextBlock.orderIndex) / 2;
    }

    const newBlocks = [
      ...blocks.slice(0, eventTriggeredBlockIndex + 1),
      newBlock,
      ...blocks.slice(eventTriggeredBlockIndex + 1),
    ];

    const newDocument = {
      ...document,
      blocks: newBlocks,
    };

    set({
      document: newDocument,
      blockInEditing: newBlock,
      cursorOffset: 0,
    });
  },
  popBlock: (eventTriggeredBlock: Block) => {
    const document = get().document;

    if (!document) return;
    if (document.blocks.length < 2) return;

    const eventTriggeredBlockIndex = document.blocks.findIndex(
      (b) => b.id === eventTriggeredBlock.id,
    );
    const newDocument = {
      ...document,
      blocks: document.blocks.filter((b) => b.id !== eventTriggeredBlock.id),
    };

    set({
      document: newDocument,
      blockInEditing: newDocument.blocks[eventTriggeredBlockIndex - 1],
      cursorOffset: INFINITY_POSITION,
    });
  },
  switchToPreviousBlock: (eventTriggeredBlock: Block, cursorOffset: number) => {
    const document = get().document;

    if (!document) {
      return;
    }

    const blocks = document.blocks;
    const eventTriggeredBlockIndex = blocks.findIndex(
      (b) => b.id === eventTriggeredBlock.id,
    );

    if (eventTriggeredBlockIndex === 0) {
      return;
    }

    const previousBlock = blocks[eventTriggeredBlockIndex - 1];
    set({ blockInEditing: previousBlock, cursorOffset: cursorOffset });
  },
  switchToNextBlock: (eventTriggeredBlock: Block, cursorOffset: number) => {
    const document = get().document;

    if (!document) {
      return;
    }

    const blocks = document.blocks;
    const eventTriggeredBlockIndex = blocks.findIndex(
      (b) => b.id === eventTriggeredBlock.id,
    );

    if (eventTriggeredBlockIndex === blocks.length - 1) {
      return;
    }

    const nextBlock = blocks[eventTriggeredBlockIndex + 1];
    set({ blockInEditing: nextBlock, cursorOffset: cursorOffset });
  },
  updateBlockContent: (block: Block, content: string) => {
    const document = get().document;
    if (!document) return;

    const blocks = document.blocks;
    const blockIndex = blocks.findIndex((b) => b.id === block.id);

    if (blockIndex === -1) return;

    const newBlocks = blocks.map((b, index) =>
      index === blockIndex ? { ...block, content } : b,
    );

    set({ document: { ...document, blocks: newBlocks } });
  },
});
