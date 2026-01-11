import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { Tab } from '@/types/config';

interface TabStore {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => void;
  addTab: () => void;
  switchTab: (tab: Tab) => void;
  closeTab: (tab?: Tab) => void;
}

// 초기 탭을 생성하는 헬퍼 함수
const createNewTab = (focused = true): Tab => ({
  id: uuidv4(),
  focused,
});

export const useTabStore = create<TabStore>((set) => ({
  tabs: [],
  setTabs: (tabs: Tab[]) => set({ tabs }),
  addTab: () =>
    set((state) => ({
      tabs: [
        ...state.tabs.map((t) => ({ ...t, focused: false })),
        createNewTab(true),
      ],
    })),
  switchTab: (tab) =>
    set((state) => ({
      tabs: state.tabs.map((t) => ({
        ...t,
        focused: t.id === tab.id,
      })),
    })),
  closeTab: (tab?) =>
    set(({ tabs }) => {
      if (tabs.length === 1) {
        return { tabs: [createNewTab(true)] };
      }

      const targetTab =
        tab ?? tabs.find((t) => t.focused) ?? tabs[tabs.length - 1];
      const newTabs = tabs.filter((t) => t.id !== targetTab.id);

      if (targetTab.focused) {
        const targetIndex = tabs.findIndex((t) => t.id === targetTab.id);
        const nextFocusIndex =
          targetIndex === tabs.length - 1 ? newTabs.length - 1 : targetIndex;

        newTabs[nextFocusIndex] = { ...newTabs[nextFocusIndex], focused: true };
      }

      return { tabs: newTabs };
    }),
}));
