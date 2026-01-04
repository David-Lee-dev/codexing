import React, { useEffect } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { getConfig, saveConfig } from '@/api/config.api';
import { useTabStore } from '@/store';
import { Tab } from '@/types/config';

import TapbarView from './TapBarView';

const Tapbar: React.FC = () => {
  const { tabs, setTabs } = useTabStore();

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getConfig();
      let newTabs: Tab[] | null = [];

      if (config.tabs.length === 0) {
        newTabs = [
          {
            id: uuidv4(),
            focused: true,
          },
        ];
      } else {
        newTabs = [...config.tabs];
        newTabs[0].focused = true;
      }

      if (newTabs) {
        setTabs(newTabs);
      }
    };

    fetchConfig();
  }, [setTabs]);

  useEffect(() => {
    const updateConfig = async () => {
      await saveConfig({
        tabs: tabs,
      });
    };

    updateConfig();
  }, [tabs]);

  const handleClickAddTab = async () => {
    const newTabs = tabs.map((t) => ({ ...t, focused: false }));
    const newTab = {
      id: uuidv4(),
      focused: true,
    };

    setTabs([...newTabs, newTab]);
  };

  const handleSwitchTab = async (tab: Tab) => {
    const newTabs = tabs.map((t) => ({ ...t, focused: false }));
    newTabs[tabs.findIndex((t) => t.id === tab.id)].focused = true;
    setTabs(newTabs);
  };

  const handleClickCloseTab = async (tab: Tab) => {
    if (tabs.length === 1) {
      const newTab = {
        id: uuidv4(),
        focused: true,
      };

      setTabs([newTab]);
      return;
    }

    const closedTabIndex = tabs.findIndex((t) => t.id === tab.id);
    const newTabs = tabs.filter((t) => t.id !== tab.id);

    if (tab.focused) {
      const isLastTab = closedTabIndex === tabs.length - 1;
      const nextFocusedIndex = isLastTab ? newTabs.length - 1 : closedTabIndex;
      newTabs[nextFocusedIndex].focused = true;
    }

    setTabs(newTabs);
  };

  return (
    <TapbarView
      tabs={tabs}
      onAddTab={handleClickAddTab}
      onSwitchTab={handleSwitchTab}
      onCloseTab={handleClickCloseTab}
    />
  );
};

export default Tapbar;
