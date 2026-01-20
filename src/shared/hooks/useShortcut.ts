import { useCallback, useEffect, useRef } from 'react';

import { getStoreActions, useAppStore } from '@/core/store';
import { Document, Tab } from '@/core/types';
import { documentApi } from '@/shared/api/document.api';
import { autoSaveService } from '@/shared/lib/autoSaveService';
import { DocumentFactory } from '@/shared/lib/factory';
import { tauriEventManager } from '@/shared/lib/tauriEventManager';

type ShortcutAction = () => void | Promise<void>;

const isDocumentEmpty = (document: Document | null): boolean => {
  if (!document) return true;
  if (document.title && document.title.trim().length > 0) return false;

  return document.blocks.every(
    (block) => !block.content || block.content.trim().length === 0,
  );
};

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
      'new-note': () => {
        const { addTab, addDocumentToList } = getStoreActions();
        const newDocument = DocumentFactory.create();

        addDocumentToList({
          id: newDocument.id,
          title: newDocument.title,
          tags: newDocument.tags,
          status: newDocument.status,
          updatedAt: newDocument.updatedAt ?? '',
        });

        const newTab: Tab = {
          documentId: newDocument.id,
          blockId: newDocument.blocks[0].id,
          isActive: true,
          cursor: 0,
          title: newDocument.title,
        };
        addTab(newTab);

        autoSaveService.saveImmediate(newDocument);
      },
      'save-note': async () => {
        const document = storeRef.current.document;
        if (!document) return;

        await autoSaveService.saveImmediate(document);
      },
      'close-tab': async () => {
        const activeTab = storeRef.current.tabs.find((t) => t.isActive);
        if (!activeTab) return;

        await autoSaveService.flushSave(activeTab.documentId);
        const response = await documentApi.getDocument(activeTab.documentId);

        if (!response.data || isDocumentEmpty(response.data)) {
          await documentApi.deleteDocument(activeTab.documentId);
        }

        getStoreActions().popTab(activeTab);
      },
      'prev-tab': () => {
        const { tabs } = storeRef.current;
        if (tabs.length < 2) return;

        const activeIndex = tabs.findIndex((t) => t.isActive);
        const prevIndex = activeIndex <= 0 ? tabs.length - 1 : activeIndex - 1;
        getStoreActions().switchTab(tabs[prevIndex]);
      },
      'next-tab': () => {
        const { tabs } = storeRef.current;
        if (tabs.length < 2) return;

        const activeIndex = tabs.findIndex((t) => t.isActive);
        const nextIndex = activeIndex >= tabs.length - 1 ? 0 : activeIndex + 1;
        getStoreActions().switchTab(tabs[nextIndex]);
      },
      // Tab number shortcuts (1-9)
      ...Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => [
          `goto-tab-${i + 1}`,
          () => {
            const { tabs } = storeRef.current;
            const targetIndex = i === 8 ? tabs.length - 1 : i; // 9 = last tab
            if (targetIndex < tabs.length) {
              getStoreActions().switchTab(tabs[targetIndex]);
            }
          },
        ]),
      ),
      'toggle-graph': () => {
        getStoreActions().toggleRightSidebar();
      },
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      unsubscribe = await tauriEventManager.subscribe(
        'shortcut-event',
        async (payload) => {
          const actions = getShortcutActions();
          const action = actions[payload];

          if (action) {
            try {
              await action();
            } catch (error) {
              console.error(`[Shortcut] Error executing ${payload}:`, error);
            }
          }
        },
      );
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [getShortcutActions]);
}
