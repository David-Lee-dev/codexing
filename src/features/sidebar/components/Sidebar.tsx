'use client';

import React, { useState, useCallback } from 'react';

import { useAppStore, useActiveDocumentId } from '@/core/store';
import { autoSaveService } from '@/shared/lib/autoSaveService';
import { DocumentFactory } from '@/shared/lib/factory';

import { SidebarView } from './SidebarView';
import { useDocumentListLoader } from '../hooks/useDocumentList';
import { useSearch } from '../hooks/useSearch';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const openSettings = useAppStore((state) => state.openSettings);
  const addTab = useAppStore((state) => state.addTab);
  const addDocumentToList = useAppStore((state) => state.addDocumentToList);
  const activeDocumentId = useActiveDocumentId();
  const { documentList, handleDocumentClick } = useDocumentListLoader();
  const {
    query,
    isSearching,
    searchResults,
    isSearchActive,
    handleQueryChange,
    clearSearch,
  } = useSearch();

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleNewNote = useCallback(async () => {
    const newDocument = DocumentFactory.create();

    addDocumentToList({
      id: newDocument.id,
      title: newDocument.title,
      tags: newDocument.tags,
      status: newDocument.status,
      updatedAt: newDocument.updatedAt ?? '',
    });

    addTab({
      documentId: newDocument.id,
      blockId: newDocument.blocks[0].id,
      title: null,
      isActive: true,
      cursor: 0,
    });

    await autoSaveService.saveImmediate(newDocument);
  }, [addTab, addDocumentToList]);

  const handleOpenSettings = () => {
    openSettings();
  };

  return (
    <SidebarView
      isCollapsed={isCollapsed}
      documentList={documentList}
      activeDocumentId={activeDocumentId}
      searchQuery={query}
      isSearching={isSearching}
      searchResults={searchResults}
      isSearchActive={isSearchActive}
      onToggleCollapse={handleToggleCollapse}
      onNewNote={handleNewNote}
      onDocumentClick={handleDocumentClick}
      onSearchChange={handleQueryChange}
      onSearchClear={clearSearch}
      onOpenSettings={handleOpenSettings}
    />
  );
};
