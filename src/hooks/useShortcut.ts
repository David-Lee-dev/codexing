import { useEffect, useMemo } from 'react';

import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

import { useTabStore } from '@/store/tabStore';

export const useShortcut = () => {
  const { tabs, addTab, closeTab } = useTabStore();

  const shortcutActions: Record<string, () => void | Promise<void>> = useMemo(
    () => ({
      'close-tab': async () => {
        const focusedTab = tabs.find((t) => t.focused);
        if (tabs.length > 1 && focusedTab) {
          closeTab(focusedTab);
        } else {
          await getCurrentWindow().close();
        }
      },
      'new-note': async () => {
        addTab();
      },
    }),
    [tabs, closeTab, addTab],
  );

  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await listen<string>('shortcut-event', async (event) => {
        const action = shortcutActions[event.payload];

        if (action) {
          await action();
        } else {
          console.warn(`정의되지 않은 단축키 이벤트: ${event.payload}`);
        }
      });

      return unlisten;
    };

    const listenerPromise = setupListener();

    return () => {
      listenerPromise.then((unlisten) => unlisten());
    };
  }, [shortcutActions]); // shortcutActions가 변경될 때마다 리스너 갱신
};
