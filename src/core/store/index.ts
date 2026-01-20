import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createAppSlice, type AppSlice } from './slices/appSlice';
import {
  createDocumentSlice,
  type DocumentSlice,
} from './slices/documentSlice';
import { createGraphSlice, type GraphSlice } from './slices/graphSlice';
import {
  createSettingsSlice,
  type SettingsSlice,
} from './slices/settingsSlice';
import { createSidebarSlice, type SidebarSlice } from './slices/sidebarSlice';
import { createTabSlice, type TabSlice } from './slices/tabSlice';

export type AppStore = TabSlice &
  DocumentSlice &
  AppSlice &
  SettingsSlice &
  GraphSlice &
  SidebarSlice;

// ============================================
// Store
// ============================================

export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector((...args) => ({
      ...createTabSlice(...args),
      ...createDocumentSlice(...args),
      ...createAppSlice(...args),
      ...createSettingsSlice(...args),
      ...createGraphSlice(...args),
      ...createSidebarSlice(...args),
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
export const useSaveStatus = () => useAppStore((state) => state.saveStatus);
export const useIsRightSidebarOpen = () =>
  useAppStore((state) => state.isRightSidebarOpen);

// TabSlice
export const useTabs = () => useAppStore((state) => state.tabs);
export const useActiveDocumentId = () =>
  useAppStore((state) => state.activeDocumentId);
// DocumentSlice
export const useDocument = () => useAppStore((state) => state.document);
export const useBlockInEditing = () =>
  useAppStore((state) => state.blockInEditing);
export const useCursorOffset = () => useAppStore((state) => state.cursorOffset);

// SettingsSlice
export const useIsSettingsOpen = () =>
  useAppStore((state) => state.isSettingsOpen);
export const useIsReindexing = () => useAppStore((state) => state.isReindexing);

// GraphSlice
export const useGraphData = () => useAppStore((state) => state.graphData);

// SidebarSlice
export const useDocumentList = () => useAppStore((state) => state.documentList);

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
    setSaveStatus: state.setSaveStatus,
    setIsRightSidebarOpen: state.setIsRightSidebarOpen,
    toggleRightSidebar: state.toggleRightSidebar,
    // TabSlice
    addTab: state.addTab,
    switchTab: state.switchTab,
    popTab: state.popTab,
    updateTabTitle: state.updateTabTitle,
    // DocumentSlice
    setDocument: state.setDocument,
    addNewBlock: state.addNewBlock,
    popBlock: state.popBlock,
    setBlockInEditing: state.setBlockInEditing,
    setCursorOffset: state.setCursorOffset,
    switchToPreviousBlock: state.switchToPreviousBlock,
    switchToNextBlock: state.switchToNextBlock,
    updateBlockContent: state.updateBlockContent,
    // SettingsSlice
    openSettings: state.openSettings,
    closeSettings: state.closeSettings,
    setIsReindexing: state.setIsReindexing,
    // GraphSlice
    setGraphData: state.setGraphData,
    setIsGraphLoading: state.setIsGraphLoading,
    setLastGraphUpdated: state.setLastGraphUpdated,
    upsertDocumentGraph: state.upsertDocumentGraph,
    removeDocumentFromGraph: state.removeDocumentFromGraph,
    applyEdgeChanges: state.applyEdgeChanges,
    // SidebarSlice
    setDocumentList: state.setDocumentList,
    addDocumentToList: state.addDocumentToList,
    removeDocumentFromList: state.removeDocumentFromList,
    updateDocumentInList: state.updateDocumentInList,
    setSearchQuery: state.setSearchQuery,
    setIsSearching: state.setIsSearching,
  };
};

// Re-export types
export type { DocumentSlice } from './slices/documentSlice';
export type { AppSlice } from './slices/appSlice';
export type { SettingsSlice } from './slices/settingsSlice';
export type { GraphSlice } from './slices/graphSlice';
export type { SidebarSlice, DocumentListItem } from './slices/sidebarSlice';
