import type { Tab } from '@/core/types';
import type { StateCreator } from 'zustand';

// ============================================
// Tab Slice State
// ============================================

export interface TabSliceState {
  tabs: Tab[];
  activeTab: Tab | undefined;
  activeDocumentId: string | undefined;
}

export interface TabSliceActions {
  addTab: (tab: Tab) => void;
  switchTab: (tab: Tab) => void;
  popTab: (tab: Tab) => void;
  updateTabTitle: (documentId: string, title: string | null) => void;
}

export type TabSlice = TabSliceState & TabSliceActions;

// ============================================
// Initial State
// ============================================

const initialTabState: TabSliceState = {
  tabs: [],
  activeTab: undefined,
  activeDocumentId: undefined,
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
    const activeTab = newTabs.find((t) => t.isActive);

    set({
      tabs: newTabs,
      activeTab,
      activeDocumentId: activeTab?.documentId,
    });
  },
  switchTab: (tab: Tab) => {
    const newTabs = get().tabs.map((t) => ({
      ...t,
      isActive: t.documentId === tab.documentId,
    }));
    const activeTab = newTabs.find((t) => t.isActive);

    set({
      tabs: newTabs,
      activeTab,
      activeDocumentId: activeTab?.documentId,
    });
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
    const activeTab = newTabs.find((t) => t.isActive);

    set({
      tabs: newTabs,
      activeTab,
      activeDocumentId: activeTab?.documentId,
    });
  },
  updateTabTitle: (documentId: string, title: string | null) => {
    const currentTabs = get().tabs;
    const newTabs = currentTabs.map((t) =>
      t.documentId === documentId ? { ...t, title } : t,
    );
    const activeTab = newTabs.find((t) => t.isActive);

    set({
      tabs: newTabs,
      activeTab,
    });
  },
});
