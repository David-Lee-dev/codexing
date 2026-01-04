import { create } from 'zustand';

import { Tab } from '@/types/config';

interface TabStore {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => void;
}

export const useTabStore = create<TabStore>((set) => ({
  tabs: [],
  setTabs: (tabs: Tab[]) => set({ tabs }),
}));
