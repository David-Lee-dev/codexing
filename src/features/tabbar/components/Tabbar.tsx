'use client';

import React, { useCallback } from 'react';

import {
  getStoreActions,
  useAppStore,
  useTabs,
  useIsRightSidebarOpen,
} from '@/core/store';
import { Tab, Document } from '@/core/types';
import { documentApi } from '@/shared/api/document.api';
import { autoSaveService } from '@/shared/lib/autoSaveService';
import { DocumentFactory } from '@/shared/lib/factory';

import { TabbarView } from './TabbarView';

const isDocumentEmpty = (document: Document | null): boolean => {
  if (!document) return true;
  if (document.title && document.title.trim().length > 0) return false;

  return document.blocks.every(
    (block) => !block.content || block.content.trim().length === 0,
  );
};

export const Tabbar: React.FC = () => {
  const tabs = useTabs();
  const isGraphOpen = useIsRightSidebarOpen();
  const toggleRightSidebar = useAppStore((state) => state.toggleRightSidebar);

  const handleSwitchTab = useCallback(async (tab: Tab) => {
    await autoSaveService.flushSave();
    getStoreActions().switchTab(tab);
  }, []);

  const handleCloseTab = useCallback(async (tab: Tab) => {
    await autoSaveService.flushSave(tab.documentId);
    const response = await documentApi.getDocument(tab.documentId);

    if (!response.data || isDocumentEmpty(response.data)) {
      const deleteResponse = await documentApi.deleteDocument(tab.documentId);
      if (deleteResponse.success && deleteResponse.data) {
        getStoreActions().removeDocumentFromGraph(deleteResponse.data);
      }
    }

    getStoreActions().popTab(tab);
  }, []);

  const handleAddTab = useCallback(() => {
    const { addTab } = getStoreActions();
    const newDocument = DocumentFactory.create();

    const newTab: Tab = {
      documentId: newDocument.id,
      blockId: newDocument.blocks[0].id,
      isActive: true,
      cursor: 0,
      title: newDocument.title,
    };
    addTab(newTab);

    autoSaveService.saveImmediate(newDocument);
  }, []);

  const handleToggleGraph = useCallback(() => {
    toggleRightSidebar();
  }, [toggleRightSidebar]);

  return (
    <TabbarView
      tabs={tabs}
      isGraphOpen={isGraphOpen}
      onSwitchTab={handleSwitchTab}
      onCloseTab={handleCloseTab}
      onAddTab={handleAddTab}
      onToggleGraph={handleToggleGraph}
    />
  );
};
