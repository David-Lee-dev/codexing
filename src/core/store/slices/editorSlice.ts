import type { Block, Document, DocumentStatus } from '@/core/types';
import type { StateCreator } from 'zustand';

// ============================================
// Editor Slice State
// ============================================

export interface EditorSliceState {
  id: string | null;
  title: string | null;
  blocks: Block[];
}

export interface EditorSliceActions {
  setId: (id: string) => void;
  setTitle: (title: string | null) => void;
  setBlocks: (blocks: Block[]) => void;
}

export type EditorSlice = EditorSliceState & EditorSliceActions;

// ============================================
// Initial State
// ============================================

const initialEditorState: EditorSliceState = {
  id: null,
  title: null,
  blocks: [],
};

// ============================================
// Slice Creator
// ============================================

export const createEditorSlice: StateCreator<
  EditorSlice,
  [],
  [],
  EditorSlice
> = (set, get) => ({
  ...initialEditorState,
  setId: (id: string) => {
    set({ id });
  },
  setTitle: (title: string | null) => {
    set({ title });
  },
  setBlocks: (blocks: Block[]) => {
    set({ blocks });
  },
});
