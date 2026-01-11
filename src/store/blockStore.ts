import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { Block } from '@/types/block';

const INFINITY_CURSOR_OFFSET = 99999999999;

interface FocusedBlockStatus {
  id: string | null;
  cursorOffset: number;
}

interface BlockStore {
  blocks: Block[];
  focusedBlockStatus: FocusedBlockStatus;
  setBlocks: (blocks: Block[]) => void;
  clearBlocks: () => void;
  addBlock: (documentId: string, block: Block) => void;
  removeBlock: (block: Block) => void;
  switchBlock: (
    block: Block,
    event: KeyboardEvent | MouseEvent,
    cursorPos?: number,
  ) => void;
}

export const useBlockStore = create<BlockStore>((set, get) => ({
  blocks: [],
  focusedBlockStatus: {
    id: null,
    cursorOffset: 0,
  },
  setBlocks: (blocks: Block[]) =>
    set({
      blocks,
      focusedBlockStatus: { id: null, cursorOffset: 0 },
    }),
  clearBlocks: () =>
    set({
      blocks: [],
      focusedBlockStatus: { id: null, cursorOffset: 0 },
    }),
  addBlock: (documentId: string, block: Block): void => {
    const getOrderIndex = (blocks: Block[], insertIndex: number): number => {
      if (insertIndex === blocks.length) {
        return blocks[insertIndex - 1].orderIndex + 1;
      } else {
        const previousBlock = blocks[insertIndex - 1];
        const followingBlock = blocks[insertIndex];
        const midpoint =
          (previousBlock.orderIndex + followingBlock.orderIndex) / 2;

        return previousBlock.orderIndex + midpoint;
      }
    };

    const currentBlocks = get().blocks;
    const insertIndex = currentBlocks.findIndex((b) => b.id === block.id) + 1;
    const newBlock: Block = {
      id: uuidv4(),
      documentId: documentId,
      type: null,
      content: null,
      orderIndex: getOrderIndex(currentBlocks, insertIndex),
      sourceDocumentId: null,
      indexingStatus: 'PENDING',
    };
    const newblocks = [
      ...currentBlocks.slice(0, insertIndex),
      newBlock,
      ...currentBlocks.slice(insertIndex),
    ];

    set((_) => ({
      blocks: newblocks,
      focusedBlockStatus: { id: newBlock.id, cursorOffset: 0 },
    }));
  },
  removeBlock: (block: Block): void => {
    const currentBlocks = get().blocks;
    if (currentBlocks.length === 1) {
      return;
    }

    const deleteIndex = currentBlocks.findIndex((b) => b.id === block.id);
    const newBlocks = [
      ...currentBlocks.slice(0, deleteIndex),
      ...currentBlocks.slice(deleteIndex + 1),
    ];

    set((_) => ({
      blocks: newBlocks,
      focusedBlockStatus: {
        id: newBlocks[deleteIndex - 1].id,
        cursorOffset: INFINITY_CURSOR_OFFSET,
      },
    }));
  },
  switchBlock: (
    block: Block,
    event: KeyboardEvent | MouseEvent,
    cursorPos?: number,
  ) => {
    const currentBlocks = get().blocks;
    const orderIndex = currentBlocks.findIndex((b) => b.id === block.id);

    if (event instanceof KeyboardEvent && event.key === 'ArrowUp') {
      if (orderIndex > 0) {
        set((state) => ({
          focusedBlockStatus: {
            id: currentBlocks[orderIndex - 1].id,
            cursorOffset: cursorPos ?? state.focusedBlockStatus.cursorOffset,
          },
        }));
      }
    } else if (event instanceof KeyboardEvent && event.key === 'ArrowDown') {
      if (orderIndex < currentBlocks.length - 1) {
        set((state) => ({
          focusedBlockStatus: {
            id: currentBlocks[orderIndex + 1].id,
            cursorOffset: cursorPos ?? state.focusedBlockStatus.cursorOffset,
          },
        }));
      }
    } else if (event instanceof MouseEvent) {
    }
  },
}));
