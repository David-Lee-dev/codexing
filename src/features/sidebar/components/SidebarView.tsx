'use client';

import React, { memo } from 'react';

import { Virtuoso } from 'react-virtuoso';

import { DocumentListItem } from './DocumentListItem';
import { SearchInput } from './SearchInput';
import { SearchResultItem } from './SearchResultItem';

import type { DocumentListItem as DocumentListItemType } from '@/core/store';
import type { SearchResult } from '@/core/types';

export interface SidebarViewProps {
  isCollapsed: boolean;
  documentList: DocumentListItemType[];
  activeDocumentId: string | undefined;
  searchQuery: string;
  isSearching: boolean;
  searchResults: SearchResult[];
  isSearchActive: boolean;
  onToggleCollapse: () => void;
  onNewNote: () => void;
  onDocumentClick: (documentId: string, title: string | null) => void;
  onSearchChange: (query: string) => void;
  onSearchClear: () => void;
  onOpenSettings: () => void;
}

export const SidebarView: React.FC<SidebarViewProps> = memo(
  function SidebarView({
    isCollapsed,
    documentList,
    activeDocumentId,
    searchQuery,
    isSearching,
    searchResults,
    isSearchActive,
    onToggleCollapse,
    onNewNote,
    onDocumentClick,
    onSearchChange,
    onSearchClear,
    onOpenSettings,
  }) {
    if (isCollapsed) {
      return (
        <div className="w-12 h-full bg-ctp-mantle border-r border-ctp-surface0/60 flex flex-col">
          <div
            className="h-10 flex items-center justify-center flex-shrink-0"
            data-tauri-drag-region
          >
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 flex items-center justify-center rounded-xl text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0/80 transition-all"
              title="Expand sidebar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-56 h-full bg-ctp-mantle border-r border-ctp-surface0/60 flex flex-col">
        <div
          className="h-10 px-3 flex items-center justify-between flex-shrink-0"
          data-tauri-drag-region
        >
          <span className="text-sm font-medium text-ctp-text">Notes</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onNewNote}
              className="w-7 h-7 flex items-center justify-center rounded-xl text-ctp-overlay1 hover:text-ctp-lavender hover:bg-ctp-surface0/80 transition-all"
              title="New note"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 flex items-center justify-center rounded-xl text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0/80 transition-all"
              title="Collapse sidebar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-3 py-2">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={onSearchClear}
            isSearching={isSearching}
          />
        </div>

        <div className="flex-1 overflow-hidden px-2 py-1">
          {isSearchActive ? (
            searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                {isSearching ? (
                  <p className="text-xs text-ctp-overlay1">Searching...</p>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8 text-ctp-surface2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                    <p className="text-xs text-ctp-overlay1">No results found</p>
                  </>
                )}
              </div>
            ) : (
              <Virtuoso
                data={searchResults}
                itemContent={(_, result) => (
                  <SearchResultItem
                    result={result}
                    isActive={activeDocumentId === result.id}
                    onClick={onDocumentClick}
                  />
                )}
                className="hide-scrollbar"
              />
            )
          ) : documentList.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-ctp-overlay1">No notes yet</p>
            </div>
          ) : (
            <Virtuoso
              data={documentList}
              itemContent={(_, document) => (
                <DocumentListItem
                  document={document}
                  isActive={activeDocumentId === document.id}
                  onClick={onDocumentClick}
                />
              )}
              className="hide-scrollbar"
            />
          )}
        </div>

        <div className="h-12 px-3 flex items-center border-t border-ctp-surface0/60">
          <button
            onClick={onOpenSettings}
            className="w-full h-8 px-3 flex items-center gap-2 rounded-xl text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0/80 transition-all text-left"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.609 6.609 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    );
  },
);
