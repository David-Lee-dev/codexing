import { useEffect, useCallback, useRef } from 'react';

import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

import { Tab } from '@/core/types';
import { DocumentFactory } from '@/shared/lib/factory';

import { getStoreActions, useAppStore } from '../../core/store';
import { documentApi } from '../api';

type ShortcutAction = () => void | Promise<void>;

interface ShortcutMap {
  [key: string]: ShortcutAction;
}

export function useShortcut() {
  // ref를 사용하여 최신 상태에 접근 (의존성 배열에 포함 불필요)
  const storeRef = useRef(useAppStore.getState());

  // Store 변경 시 ref 업데이트
  useEffect(() => {
    const unsubscribe = useAppStore.subscribe((state) => {
      storeRef.current = state;
    });
    return unsubscribe;
  }, []);

  // 단축키 액션 정의 (의존성 없음)
  const getShortcutActions = useCallback((): ShortcutMap => {
    return {
      'new-note': async () => {
        const { addTab } = getStoreActions();
        const newDocument = DocumentFactory.create();

        await documentApi.saveDocument(newDocument);

        const newTab: Tab = {
          documentId: newDocument.id,
          blockId: newDocument.blocks[0].id,
          isActive: true,
          cursor: 0,
          title: newDocument.title,
        };
        addTab(newTab);
      },
      'close-tab': async () => {
        const activeTab = storeRef.current.tabs.find((t) => t.isActive);

        if (!activeTab) return;

        getStoreActions().popTab(activeTab);
        // if (storeRef.current.tabs.length === 0) {
        //   await getCurrentWindow().close();
        // }
      },
    };
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      unlisten = await listen<string>('shortcut-event', async (event) => {
        const actions = getShortcutActions();
        const action = actions[event.payload];

        if (action) {
          try {
            await action();
          } catch (error) {
            console.error(
              `[Shortcut] Error executing ${event.payload}:`,
              error,
            );
          }
        }
      });
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [getShortcutActions]);
}
