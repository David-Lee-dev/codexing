'use client';

import React, { useCallback } from 'react';

import { getStoreActions, useTabs } from '@/core/store';
import { Tab } from '@/core/types';
import { documentApi } from '@/shared/api';
import { DocumentFactory } from '@/shared/lib/factory';

import { TabbarView } from './TabbarView';

export const Tabbar: React.FC = () => {
  const tabs = useTabs();

  const handleSwitchTab = useCallback((tab: Tab) => {
    getStoreActions().switchTab(tab);
  }, []);

  const handleCloseTab = useCallback((tab: Tab) => {
    getStoreActions().popTab(tab);
  }, []);

  const handleAddTab = useCallback(async () => {
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
  }, []);

  return (
    <TabbarView
      tabs={tabs}
      onSwitchTab={handleSwitchTab}
      onCloseTab={handleCloseTab}
      onAddTab={handleAddTab}
    />
  );
};
