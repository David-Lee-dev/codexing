import type { StateCreator } from 'zustand';

export type SaveStatus = 'idle' | 'saving' | 'indexing';

export interface AppSliceState {
  isLoading: boolean;
  isInitialized: boolean;
  isStorageSelected: boolean;
  isDatabaseInitialized: boolean;
  saveStatus: SaveStatus;
  isRightSidebarOpen: boolean;
}

export interface AppSliceActions {
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsStorageSelected: (isStorageSelected: boolean) => void;
  setIsDatabaseInitialized: (isDatabaseInitialized: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setIsRightSidebarOpen: (isOpen: boolean) => void;
  toggleRightSidebar: () => void;
}

export type AppSlice = AppSliceState & AppSliceActions;

export const createAppSlice: StateCreator<AppSlice, [], [], AppSlice> = (
  set,
  get,
) => ({
  isLoading: true,
  isInitialized: false,
  isStorageSelected: false,
  isDatabaseInitialized: false,
  saveStatus: 'idle',
  isRightSidebarOpen: true,

  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setIsStorageSelected: (isStorageSelected) => set({ isStorageSelected }),
  setIsDatabaseInitialized: (isDatabaseInitialized) =>
    set({ isDatabaseInitialized }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setIsRightSidebarOpen: (isRightSidebarOpen) => set({ isRightSidebarOpen }),
  toggleRightSidebar: () =>
    set({ isRightSidebarOpen: !get().isRightSidebarOpen }),
});
