import type { Tab } from '@/core/types';
import type { StateCreator } from 'zustand';

// ============================================
// Tab Slice State
// ============================================

export interface TabSliceState {
  tabs: Tab[];
}

export interface TabSliceActions {
  addTab: (tab: Tab) => void;
  switchTab: (tab: Tab) => void;
  popTab: (tab: Tab) => void;
}

export type TabSlice = TabSliceState & TabSliceActions;

// ============================================
// Initial State
// ============================================

const initialTabState: TabSliceState = {
  tabs: [],
};

// ============================================
// Slice Creator
// ============================================

export const createTabSlice: StateCreator<TabSlice, [], [], TabSlice> = (
  set,
  get,
) => ({
  ...initialTabState,

  addTab: (tab: Tab) => {
    const newTabs = [
      ...get().tabs.map((t) => ({ ...t, isActive: false })),
      tab,
    ];

    set({ tabs: newTabs });
  },
  switchTab: (tab: Tab) => {
    const newTabs = get().tabs.map((t) => ({
      ...t,
      isActive: t.documentId === tab.documentId,
    }));
    set({ tabs: newTabs });
  },
  popTab: (tab: Tab) => {
    const currentTabs = get().tabs;
    const tabIndex = currentTabs.findIndex(
      (t) => t.documentId === tab.documentId,
    );
    const filteredTabs = currentTabs.filter(
      (t) => t.documentId !== tab.documentId,
    );
    const focusedTabIndex = Math.min(filteredTabs.length - 1, tabIndex);

    const newTabs = filteredTabs.map((t, index) => ({
      ...t,
      isActive: index === focusedTabIndex,
    }));

    set({ tabs: newTabs });
  },
});
