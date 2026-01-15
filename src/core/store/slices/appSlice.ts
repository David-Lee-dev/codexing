import type { StateCreator } from 'zustand';

export interface AppSliceState {
  isLoading: boolean;
  isInitialized: boolean;
  isStorageSelected: boolean;
  isDatabaseInitialized: boolean;
}

export interface AppSliceActions {
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsStorageSelected: (isStorageSelected: boolean) => void;
  setIsDatabaseInitialized: (isDatabaseInitialized: boolean) => void;
}

export type AppSlice = AppSliceState & AppSliceActions;

export const createAppSlice: StateCreator<AppSlice, [], [], AppSlice> = (
  set,
) => ({
  isLoading: true,
  isInitialized: false,
  isStorageSelected: false,
  isDatabaseInitialized: false,

  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setIsStorageSelected: (isStorageSelected) => set({ isStorageSelected }),
  setIsDatabaseInitialized: (isDatabaseInitialized) =>
    set({ isDatabaseInitialized }),
});
