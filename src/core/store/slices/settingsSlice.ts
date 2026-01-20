import type { StateCreator } from 'zustand';

export interface SettingsSliceState {
  isSettingsOpen: boolean;
  isReindexing: boolean;
}

export interface SettingsSliceActions {
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsReindexing: (isReindexing: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export type SettingsSlice = SettingsSliceState & SettingsSliceActions;

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
  isSettingsOpen: false,
  isReindexing: false,

  setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  setIsReindexing: (isReindexing) => set({ isReindexing }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
});
