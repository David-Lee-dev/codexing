'use client';

import React from 'react';

export interface SidebarViewProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewNote: () => void;
  onSearch: () => void;
}

export const SidebarView: React.FC<SidebarViewProps> = ({
  isCollapsed,
  onToggleCollapse,
  onNewNote,
  onSearch,
}) => {
  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-stone-50 border-r border-stone-200/60 flex flex-col">
        {/* 헤더 - 햄버거 버튼만 (expanded 상태와 같은 y 위치) */}
        <div
          className="h-10 flex items-center justify-center flex-shrink-0"
          data-tauri-drag-region
        >
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/80 transition-all"
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
    <div className="w-56 h-full bg-stone-50 border-r border-stone-200/60 flex flex-col">
      {/* 헤더 (macOS 드래그 영역 포함) */}
      <div
        className="h-10 px-3 flex items-center justify-between flex-shrink-0"
        data-tauri-drag-region
      >
        <span className="text-sm font-medium text-stone-700">Notes</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewNote}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/80 transition-all"
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
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/80 transition-all"
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

      {/* 검색바 */}
      <div className="px-3 py-2">
        <button
          onClick={onSearch}
          className="w-full h-8 px-3 flex items-center gap-2 rounded-lg bg-stone-100 text-stone-400 hover:bg-stone-200/80 transition-all text-left"
        >
          <svg
            className="w-3.5 h-3.5"
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
          <span className="text-xs">Search notes...</span>
        </button>
      </div>

      {/* 노트 리스트 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 py-1">
        <NoteListSection title="Recent" />
        <NoteListSection title="All Notes" />
      </div>

      {/* 하단 */}
      <div className="h-12 px-3 flex items-center border-t border-stone-200/60">
        <button className="w-full h-8 px-3 flex items-center gap-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/80 transition-all text-left">
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
};

// 노트 리스트 섹션 (더미)
const NoteListSection: React.FC<{ title: string }> = ({ title }) => {
  const dummyNotes = [
    { id: '1', title: 'Welcome Note', date: 'Today' },
    { id: '2', title: 'Meeting Notes', date: 'Yesterday' },
    { id: '3', title: 'Project Ideas', date: '2 days ago' },
  ];

  return (
    <div className="mb-4">
      <div className="px-2 py-1">
        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="space-y-0.5">
        {dummyNotes.map((note) => (
          <button
            key={note.id}
            className="w-full px-2 py-2 flex items-start gap-2 rounded-lg text-left hover:bg-stone-200/50 transition-all group"
          >
            <svg
              className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-700 truncate">
                {note.title}
              </p>
              <p className="text-[10px] text-stone-400">{note.date}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
