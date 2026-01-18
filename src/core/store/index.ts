import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createAppSlice, type AppSlice } from './slices/appSlice';
import {
  createDocumentSlice,
  type DocumentSlice,
} from './slices/documentSlice';
import { createEditorSlice, type EditorSlice } from './slices/editorSlice';
import { createTabSlice, type TabSlice } from './slices/tabSlice';

export type AppStore = TabSlice & DocumentSlice & EditorSlice & AppSlice;

// ============================================
// Store
// ============================================

export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector((...args) => ({
      ...createTabSlice(...args),
      ...createDocumentSlice(...args),
      ...createEditorSlice(...args),
      ...createAppSlice(...args),
    })),
    { name: 'AppStore' },
  ),
);

// ============================================
// Selectors
// ============================================

// AppSlice
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useIsStorageSelected = () =>
  useAppStore((state) => state.isStorageSelected);
export const useIsDatabaseInitialized = () =>
  useAppStore((state) => state.isDatabaseInitialized);

// TabSlice
export const useTabs = () => useAppStore((state) => state.tabs);
export const useActiveTab = () => useAppStore((state) => state.activeTab);
export const useActiveDocumentId = () =>
  useAppStore((state) => state.activeDocumentId);
// DocumentSlice
export const useDocument = () => useAppStore((state) => state.document);
export const useBlockInEditing = () =>
  useAppStore((state) => state.blockInEditing);
export const useCursorOffset = () => useAppStore((state) => state.cursorOffset);

// ============================================
// Actions (컴포넌트 외부에서 사용)
// ============================================

export const getStoreActions = () => {
  const state = useAppStore.getState();
  return {
    // AppSlice
    setIsLoading: state.setIsLoading,
    setIsInitialized: state.setIsInitialized,
    setIsStorageSelected: state.setIsStorageSelected,
    setIsDatabaseInitialized: state.setIsDatabaseInitialized,
    // TabSlice
    addTab: state.addTab,
    switchTab: state.switchTab,
    popTab: state.popTab,
    // DocumentSlice
    setDocument: state.setDocument,
    addNewBlock: state.addNewBlock,
    popBlock: state.popBlock,
    setBlockInEditing: state.setBlockInEditing,
    setCursorOffset: state.setCursorOffset,
    switchToPreviousBlock: state.switchToPreviousBlock,
    switchToNextBlock: state.switchToNextBlock,
    updateBlockContent: state.updateBlockContent,
    // EditorSlice
    setId: state.setId,
    setTitle: state.setTitle,
    setBlocks: state.setBlocks,
  };
};

// Re-export types
export type { DocumentSlice } from './slices/documentSlice';
export type { EditorSlice } from './slices/editorSlice';
export type { AppSlice } from './slices/appSlice';
