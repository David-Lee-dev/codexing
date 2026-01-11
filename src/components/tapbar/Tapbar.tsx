import React, { useEffect } from 'react';

import { getConfig, saveConfig } from '@/api/config.api';
import { useTabStore } from '@/store/tabStore';

import TapbarView from './TapBarView';

const Tapbar: React.FC = () => {
  const { tabs, setTabs, addTab, switchTab, closeTab } = useTabStore();

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getConfig();

      if (config.tabs.length === 0) {
        addTab();
      } else {
        const newTabs = [...config.tabs];

        if (!newTabs.find((t) => t.focused)) {
          newTabs[newTabs.length - 1].focused = true;
        }

        setTabs(newTabs);
      }
    };

    fetchConfig();
  }, [addTab, setTabs]);

  useEffect(() => {
    const updateConfig = async () => {
      await saveConfig({
        tabs: tabs,
      });
    };

    updateConfig();
  }, [tabs]);

  return (
    <TapbarView
      tabs={tabs}
      onAddTab={addTab}
      onSwitchTab={switchTab}
      onCloseTab={closeTab}
    />
  );
};

export default Tapbar;
