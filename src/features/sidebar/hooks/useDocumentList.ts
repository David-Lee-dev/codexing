'use client';

import { useCallback, useEffect } from 'react';

import {
  useAppStore,
  useDocumentList,
  type DocumentListItem,
} from '@/core/store';
import { documentApi } from '@/shared/api/document.api';
import { autoSaveService } from '@/shared/lib/autoSaveService';

export function useDocumentListLoader() {
  const documentList = useDocumentList();
  const setDocumentList = useAppStore((state) => state.setDocumentList);
  const tabs = useAppStore((state) => state.tabs);
  const addTab = useAppStore((state) => state.addTab);
  const switchTab = useAppStore((state) => state.switchTab);

  const loadDocuments = useCallback(async () => {
    const response = await documentApi.listDocuments();
    if (response.success && response.data) {
      const items: DocumentListItem[] = response.data.map((doc) => ({
        id: doc.id,
        title: doc.title,
        tags: doc.tags,
        status: doc.status,
        updatedAt: '',
      }));
      setDocumentList(items);
    }
  }, [setDocumentList]);

  const handleDocumentClick = useCallback(
    async (documentId: string, title: string | null) => {
      await autoSaveService.flushSave();

      const existingTab = tabs.find((t) => t.documentId === documentId);
      if (existingTab) {
        switchTab(existingTab);
      } else {
        const response = await documentApi.getDocument(documentId);
        if (response.success && response.data) {
          const firstBlock = response.data.blocks[0];
          addTab({
            documentId,
            blockId: firstBlock?.id ?? '',
            title,
            isActive: true,
            cursor: 0,
          });
        }
      }
    },
    [tabs, addTab, switchTab],
  );

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documentList,
    handleDocumentClick,
  };
}
