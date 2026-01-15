'use client';

import React from 'react';

export interface MainViewProps {
  hasActiveDocument: boolean;
  documentTitle?: string;
}

export const MainView: React.FC<MainViewProps> = ({
  hasActiveDocument,
  documentTitle,
}) => {
  if (!hasActiveDocument) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-white">
      {/* 에디터 헤더 */}
      <div className="h-12 px-6 flex items-center justify-between border-b border-stone-100">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-medium text-stone-800">
            {documentTitle || 'Untitled'}
          </h1>
          <span className="text-[10px] text-stone-400">Saved</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 더보기 버튼 */}
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all">
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
                d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* 제목 입력 영역 */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Untitled"
              defaultValue={documentTitle}
              className="w-full text-3xl font-bold text-stone-800 placeholder:text-stone-300 outline-none bg-transparent"
            />
          </div>

          {/* 본문 입력 영역 (더미) */}
          <div className="prose prose-stone max-w-none">
            <p className="text-stone-500 text-base leading-relaxed">
              Start writing your note here...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 빈 상태 컴포넌트
const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-stone-50/50">
      <div className="text-center space-y-4">
        {/* 아이콘 */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-stone-400"
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
        </div>

        {/* 텍스트 */}
        <div>
          <h2 className="text-lg font-medium text-stone-700 mb-1">
            No note selected
          </h2>
          <p className="text-sm text-stone-500">
            Select a note from the sidebar or create a new one
          </p>
        </div>

        {/* 단축키 안내 */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-500 font-mono">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-500 font-mono">
              N
            </kbd>
            <span>New note</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-500 font-mono">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-500 font-mono">
              K
            </kbd>
            <span>Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};
